from __future__ import annotations

import asyncio
import json
import logging
from datetime import datetime, timezone
import time
from typing import Any

import httpx
from openai import OpenAI
import google.generativeai as genai
import os
import concurrent.futures

from .config import Settings
from .schemas import (
    ConfigStatus,
    Location,
    SentimentQuery,
    SentimentResponse,
    SentimentResult,
    SocialPost,
    FeedbackItem,
    ChatRequest,
    ChatResponse,
    EmployeeUpdateRequest,
    EmployeeRecord,
    EmployeeSignupRequest,
    AnalysisTimings,
)

LOGGER = logging.getLogger("sentiment-services")

REDDIT_SEARCH_PATH = "/search"
USER_AGENT = "T-Sentiment-Agent/0.1 (by /u/hackutd)"
REDDIT_TOKEN_URL = "https://www.reddit.com/api/v1/access_token"
DEFAULT_SUBREDDITS: list[str] = [
    "tmobile",
    "tmobileisp",
    "tmobiledown",
    "ATT",
    "ATTWireless",
    "verizon",
    "NoContract",
    "cellular",
    "networking",
    "telecom",
]

CATEGORY_KEYWORDS = {
    "Network Coverage": ["coverage", "tower", "signal", "5g", "4g", "outage", "latency", "network", "data speed"],
    "Customer Service": ["support", "customer service", "rep", "agent", "call center"],
    "Billing": ["bill", "billing", "charge", "payment", "invoice"],
    "Pricing & Plans": ["plan", "pricing", "upgrade", "downgrade", "promotion", "offer", "deal"],
    "Device and Equipment": ["device", "phone", "tablet", "router", "gateway", "sim"],
    "Store Experience": ["store", "retail", "in-store", "kiosk"],
    "Mobile App": ["app", "application", "login", "mytmobile"],
}

POSITIVE_KEYWORDS = ["love", "loving", "great", "awesome", "fast", "happy", "excellent", "amazing"]
NEGATIVE_KEYWORDS = [
    "slow",
    "bad",
    "terrible",
    "hate",
    "angry",
    "frustrating",
    "issue",
    "problem",
    "outage",
    "dropped",
]

COMMON_LOCATIONS = {
    "dallas": ("Dallas", "TX", 32.7767, -96.7970),
    "new york": ("New York", "NY", 40.7128, -74.0060),
    "nyc": ("New York", "NY", 40.7128, -74.0060),
    "seattle": ("Seattle", "WA", 47.6062, -122.3321),
    "houston": ("Houston", "TX", 29.7604, -95.3698),
    "los angeles": ("Los Angeles", "CA", 34.0522, -118.2437),
    "chicago": ("Chicago", "IL", 41.8781, -87.6298),
    "miami": ("Miami", "FL", 25.7617, -80.1918),
}


def build_config_status(settings: Settings) -> ConfigStatus:
    LOGGER.debug("Building config status. CORS_ALLOW_ALL=%s FRONTEND_ORIGIN=%s", getattr(settings, "CORS_ALLOW_ALL", None), getattr(settings, "FRONTEND_ORIGIN", None))
    return ConfigStatus(
        has_reddit_credentials=bool(settings.REDDIT_CLIENT_ID and settings.REDDIT_CLIENT_SECRET),
        has_nemotron_credentials=bool(
            settings.NEMOTRON_API_KEY
            or (
                settings.NEMOTRON_BASE_URL
                and (
                    "localhost" in settings.NEMOTRON_BASE_URL
                    or "127.0.0.1" in settings.NEMOTRON_BASE_URL
                    or "0.0.0.0" in settings.NEMOTRON_BASE_URL
                )
            )
        ),
        has_gemini_credentials=bool(settings.GEMINI_API_KEY or settings.OPENROUTER_API_KEY),
        has_maps_credentials=bool(settings.GOOGLE_MAPS_API_KEY),
    )


def _mock_posts(payload: SentimentQuery) -> list[SocialPost]:
    samples = [
        "Loving the upgraded 5G speeds downtown!",
        "Coverage dropped again during my commute.",
        "Billing got weird this month, anyone else?",
        "T-Mobile support was clutch tonight.",
        "App login failing on iOS 17.",
    ]
    posts: list[SocialPost] = []
    for idx in range(payload.limit):
        snippet = samples[idx % len(samples)]
        posts.append(
            SocialPost(
                id=f"mock-{idx}",
                text=f"{snippet} (query: {payload.query})",
                author=f"user{idx}",
                posted_at=datetime.now(timezone.utc),
                location=Location(city="Dallas", state="TX", latitude=32.7767, longitude=-96.7970),
                permalink="https://reddit.com/r/tmobile",
            )
        )
    return posts


async def _resolve_reddit_token(settings: Settings) -> str | None:
    """
    Resolve a usable Reddit OAuth bearer token.
    Priority:
      1) Use REDDIT_API_KEY if provided (already a bearer token)
      2) If REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET exist, exchange for a short-lived token
    """
    if settings.REDDIT_CLIENT_ID and settings.REDDIT_CLIENT_SECRET:
        LOGGER.info("Acquiring Reddit access token via client credentials grant.")
        headers = {"User-Agent": settings.REDDIT_USER_AGENT or USER_AGENT}
        auth = (settings.REDDIT_CLIENT_ID, settings.REDDIT_CLIENT_SECRET)
        data = {"grant_type": "client_credentials"}
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(REDDIT_TOKEN_URL, data=data, auth=auth, headers=headers)
                resp.raise_for_status()
                token = resp.json().get("access_token")
                if token:
                    LOGGER.debug("Successfully obtained Reddit access token.")
                    return token
                LOGGER.warning("Reddit token response missing access_token.")
        except httpx.HTTPError as exc:
            LOGGER.warning("Failed to acquire Reddit token via client credentials: %s", exc)
        return None

    return None


async def fetch_social_posts(payload: SentimentQuery, settings: Settings) -> list[SocialPost]:
    LOGGER.info("Fetching social posts for query='%s', limit=%s", payload.query, payload.limit)

    token = await _resolve_reddit_token(settings)
    if not token and settings.REDDIT_CLIENT_ID and settings.REDDIT_CLIENT_SECRET:
        # Try PRAW as a fallback path
        try:
            import praw  # type: ignore
            LOGGER.info("Falling back to PRAW for Reddit fetching.")
            def _praw_fetch() -> list[SocialPost]:
                reddit = praw.Reddit(
                    client_id=settings.REDDIT_CLIENT_ID,
                    client_secret=settings.REDDIT_CLIENT_SECRET,
                    user_agent=settings.REDDIT_USER_AGENT or USER_AGENT,
                )
                terms: list[str] = []
                if payload.query:
                    terms.append(payload.query)
                if payload.keywords:
                    terms.extend(payload.keywords)
                human_terms = " ".join(t for t in terms if t).strip()
                tmo_clause = '("T-Mobile" OR "tmobile" OR "t mobile" OR TMO)'
                q = f"{tmo_clause} {human_terms}".strip()
                subs = [s.lstrip('r/').strip() for s in (payload.subreddits or DEFAULT_SUBREDDITS) if s and s.strip()]
                per_sub_limit = max(3, payload.limit // max(1, len(subs)) + 2)
                collected: list[SocialPost] = []
                for sr in subs or ["all"]:
                    for submission in reddit.subreddit(sr).search(query=q, sort="relevance", time_filter="all", limit=per_sub_limit):
                        text_body = f"{submission.title}\n\n{submission.selftext or ''}".strip()
                        if not _is_tmobile_relevant(text_body, payload):
                            continue
                        created_utc = datetime.fromtimestamp(getattr(submission, "created_utc", datetime.now().timestamp()), tz=timezone.utc)
                        collected.append(
                            SocialPost(
                                id=submission.id,
                                text=text_body,
                                author=str(submission.author) if submission.author else "anonymous",
                                posted_at=created_utc,
                                location=_infer_location(text_body, {}, payload.location_hint),
                                permalink=f"https://reddit.com{submission.permalink}" if getattr(submission, "permalink", None) else None,
                                source="reddit",
                            )
                        )
                deduped = _dedupe_posts(collected)
                return deduped[: payload.limit]
            return await asyncio.to_thread(_praw_fetch)
        except Exception as exc:
            LOGGER.warning("PRAW fetch failed: %s", exc)
            # continue to httpx path if token later becomes available
            if not token:
                return []
    if not token:
        LOGGER.error("No Reddit credentials available (REDDIT_CLIENT_ID/SECRET missing or token exchange failed).")
        return []

    headers = {
        "User-Agent": settings.REDDIT_USER_AGENT or USER_AGENT,
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }
    terms: list[str] = []
    if payload.query:
        terms.append(payload.query)
    if payload.keywords:
        terms.extend(payload.keywords)
    human_terms = " ".join(t for t in terms if t).strip()
    tmo_clause = '("T-Mobile" OR "tmobile" OR "t mobile" OR TMO)'
    query = f"{tmo_clause} {human_terms}".strip()

    try:
        async with httpx.AsyncClient(base_url=settings.REDDIT_BASE_URL, timeout=15.0) as client:
            subs = [s.lstrip('r/').strip() for s in (payload.subreddits or []) if s and s.strip()]
            responses: list[Any] = []
            if subs:
                per_sub_limit = max(3, payload.limit // max(1, len(subs)) + 2)
                async def fetch_sr(sr: str):
                    params = {
                        "q": query,
                        "limit": per_sub_limit,
                        "sort": "relevance",
                        "include_facets": "false",
                        "restrict_sr": "true",
                    }
                    path = f"/r/{sr}/search"
                    resp = await client.get(path, params=params, headers=headers)
                    resp.raise_for_status()
                    return resp.json()
                tasks = [fetch_sr(sr) for sr in subs]
                responses = await asyncio.gather(*tasks, return_exceptions=True)
            else:
                params = {
                    "q": query,
                    "limit": payload.limit,
                    "sort": "relevance",
                    "include_facets": "false",
                }
                resp = await client.get(REDDIT_SEARCH_PATH, params=params, headers=headers)
                resp.raise_for_status()
                responses = [resp.json()]
            # Parse and merge
            collected: list[SocialPost] = []
            for resp in responses:
                if isinstance(resp, Exception):
                    LOGGER.warning("Reddit search for one subreddit failed: %s", resp)
                    continue
                collected.extend(_parse_listing(resp, payload))
    except httpx.HTTPStatusError as exc:
        # If Reddit blocks or rejects (e.g., 401/403/429), don't crash the API; return empty
        LOGGER.warning("Reddit API returned %s. Returning empty list. Detail: %s", exc.response.status_code, exc)
        return []
    except httpx.HTTPError as exc:
        LOGGER.warning("Reddit network error: %s. Returning empty list.", exc)
        return []

    deduped = _dedupe_posts(collected)
    return deduped[: payload.limit]


def _parse_listing(data: Any, payload: SentimentQuery) -> list[SocialPost]:
    children = data.get("data", {}).get("children", []) if isinstance(data, dict) else []
    posts: list[SocialPost] = []

    for child in children:
        node = child.get("data", {})
        text_body = f"{node.get('title', '')}\n\n{node.get('selftext', '')}".strip()
        if not _is_tmobile_relevant(text_body, payload):
            continue

        location = _infer_location(text_body, node, payload.location_hint)
        posts.append(
            SocialPost(
                id=node.get("id") or node.get("name") or f"reddit-{len(posts)}",
                text=text_body,
                author=node.get("author") or "anonymous",
                posted_at=datetime.fromtimestamp(node.get("created_utc", datetime.now().timestamp()), tz=timezone.utc),
                location=location,
                permalink=f"https://reddit.com{node.get('permalink', '')}" if node.get("permalink") else None,
            )
        )
    LOGGER.info("Parsed %s Reddit posts from listing.", len(posts))
    return posts


def _is_tmobile_relevant(text: str, payload: SentimentQuery) -> bool:
    lowered = text.lower()
    tmo_synonyms = ["t-mobile", "tmobile", "t mobile", "t‑mobile", "t–mobile", "tmo"]
    has_tmo = any(s in lowered for s in tmo_synonyms)
    if not has_tmo:
        return False
    # If extra keywords provided, require at least one to also be present
    if payload.keywords:
        if any(str(kw).lower() in lowered for kw in payload.keywords if kw):
            return True
        # Also allow original query terms to count
        q = (payload.query or "").strip().lower()
        if q and any(tok and tok in lowered for tok in q.split()):
            return True
        return False
    return True


def _dedupe_posts(posts: list[SocialPost]) -> list[SocialPost]:
    seen: set[str] = set()
    unique: list[SocialPost] = []
    for p in posts:
        key = p.id or p.permalink or f"{p.author}-{int(p.posted_at.timestamp())}-{hash(p.text[:50])}"
        if key in seen:
            continue
        seen.add(key)
        unique.append(p)
    return unique


# --------------------------- Firebase Integration ---------------------------
_FIREBASE_INIT_DONE = False


def _ensure_firebase(settings: Settings) -> None:
    global _FIREBASE_INIT_DONE
    if _FIREBASE_INIT_DONE:
        return
    try:
        import firebase_admin
        from firebase_admin import credentials
        if not firebase_admin._apps:
            cred = None
            if settings.FIREBASE_SERVICE_ACCOUNT_JSON:
                cred = credentials.Certificate(json.loads(settings.FIREBASE_SERVICE_ACCOUNT_JSON))
            elif settings.FIREBASE_CREDENTIALS_PATH:
                cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            else:
                LOGGER.warning("Firebase credentials not provided; skipping admin initialization.")
                _FIREBASE_INIT_DONE = True
                return
            app_kwargs = {}
            if settings.FIREBASE_DATABASE_URL:
                app_kwargs["options"] = {"databaseURL": settings.FIREBASE_DATABASE_URL}
            firebase_admin.initialize_app(cred, **app_kwargs)
        _FIREBASE_INIT_DONE = True
        LOGGER.info("Firebase Admin initialized.")
    except Exception as exc:
        LOGGER.warning("Failed to initialize Firebase Admin: %s", exc)
        _FIREBASE_INIT_DONE = True  # avoid retry loops


async def _fetch_feedback_posts(limit: int, settings: Settings) -> list[SocialPost]:
    _ensure_firebase(settings)
    try:
        if settings.FIREBASE_STORE == "realtime":
            from firebase_admin import db
            if not settings.FIREBASE_DATABASE_URL:
                LOGGER.debug("FIREBASE_DATABASE_URL not set; skipping feedback fetch.")
                return []
            ref = db.reference("feedback")
            snapshot = ref.order_by_child("posted_at").limit_to_last(limit).get() or {}
            records = list(snapshot.values()) if isinstance(snapshot, dict) else snapshot or []
        else:
            from firebase_admin import firestore
            client = firestore.client()
            docs = client.collection("feedback").order_by("posted_at", direction=firestore.Query.DESCENDING).limit(limit).stream()
            records = [doc.to_dict() for doc in docs]
    except Exception as exc:
        LOGGER.warning("Failed to read feedback from Firebase: %s", exc)
        return []

    posts: list[SocialPost] = []
    for rec in records:
        try:
            text_body = str(rec.get("text", "")).strip()
            if not text_body:
                continue
            ts = rec.get("posted_at")
            when = datetime.fromtimestamp(ts, tz=timezone.utc) if isinstance(ts, (int, float)) else datetime.now(timezone.utc)
            posts.append(
                SocialPost(
                    id=str(rec.get("id") or f"fb-{len(posts)}"),
                    text=text_body,
                    author=str(rec.get("author") or "customer"),
                    posted_at=when,
                    location=Location(raw=str(rec.get("location_hint") or "")) if rec.get("location_hint") else None,
                    permalink=None,
                    source="feedback",
                )
            )
        except Exception:
            continue
    LOGGER.info("Fetched %s feedback posts from Firebase.", len(posts))
    return posts


def _infer_location(text: str, node: dict[str, Any], location_hint: str | None) -> Location | None:
    hints = [node.get("link_flair_text"), node.get("author_flair_text"), location_hint or ""]
    hints = [h for h in hints if h]
    haystack = " ".join([text.lower(), *[h.lower() for h in hints]])

    for needle, (city, state, lat, lng) in COMMON_LOCATIONS.items():
        if needle in haystack:
            return Location(city=city, state=state, latitude=lat, longitude=lng, raw=needle)

    return Location(raw=location_hint) if location_hint else None


def _heuristic_category(text: str) -> str:
    lowered = text.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword in lowered for keyword in keywords):
            return category
    return "Other"


def _heuristic_rating(text: str) -> int:
    lowered = text.lower()
    score = 3
    score += sum(1 for token in POSITIVE_KEYWORDS if token in lowered)
    score -= sum(1 for token in NEGATIVE_KEYWORDS if token in lowered)
    return max(1, min(5, score))


def _sentiment_from_rating(rating: int) -> str:
    if rating >= 4:
        return "positive"
    if rating <= 2:
        return "negative"
    return "neutral"


def _default_solution(category: str, sentiment: str, text: str) -> str:
    lowered = text.lower()
    if category == "Network Coverage":
        return "Toggle Airplane Mode, reboot your phone/router, and check the T‑Mobile outage map. If signal stays weak, try a different spot (near a window) and contact support for a tower check."
    if category == "Mobile App":
        return "Force close and clear cache, then update or reinstall the T‑Mobile app. If login still fails, try the web portal and check for known outages."
    if category == "Billing":
        return "Review the latest bill in the app for one‑time/pro‑rated charges, then contact support to dispute unexpected fees and request an adjustment."
    if category == "Pricing & Plans":
        return "Verify your plan and add‑ons in the app, confirm AutoPay/discounts, and compare plans. Contact support to switch or apply missing discounts."
    if category == "Customer Service":
        return "Document the case number and ask for escalation or a supervisor via app chat/phone. If unresolved, request a call‑back and note commitments."
    if category == "Device and Equipment":
        return "Power cycle, update OS/firmware, reseat SIM/eSIM, and test without accessories. If issues persist, visit a T‑Mobile store for diagnostics."
    if category == "Store Experience":
        return "Share feedback via the app and schedule a visit at another nearby store. Bring ID and account PIN for faster resolution."
    return "Try the basic steps: reboot device, update software, and check for outages. If the issue persists, contact T‑Mobile support with details for targeted help."


async def _request_nemotron(posts: list[SocialPost], settings: Settings) -> dict[str, Any]:
    local_ok = bool(
        settings.NEMOTRON_BASE_URL
        and (
            "localhost" in settings.NEMOTRON_BASE_URL
            or "127.0.0.1" in settings.NEMOTRON_BASE_URL
            or "0.0.0.0" in settings.NEMOTRON_BASE_URL
        )
    )
    if (not settings.NEMOTRON_API_KEY and not local_ok) or not posts:
        if not settings.NEMOTRON_API_KEY and not local_ok:
            LOGGER.debug("Nemotron API key missing and not using local endpoint; skipping LLM enrichment.")
        if not posts:
            LOGGER.debug("No posts to enrich; skipping LLM enrichment.")
        return {}

    def _call_llm() -> dict[str, Any]:
        client = OpenAI(base_url=settings.NEMOTRON_BASE_URL, api_key=settings.NEMOTRON_API_KEY or "sk-local")
        payload = [
            {"id": post.id, "text": post.text[:600], "author": post.author, "location": post.location.raw if post.location else ""}
            for post in posts
        ]
        user_prompt = (
            "You are an operations analyst for T-Mobile. "
            "Rate each Reddit post from 1 (very negative) to 5 (very positive) about customer experience, "
            "infer the primary problem category from this list: "
            "[Network Coverage, Customer Service, Billing, Pricing & Plans, Device and Equipment, Store Experience, Mobile App, Other]. "
            "Extract a short location hint if present. "
            "For each item, provide a concise, actionable solution (1–2 sentences) that a user can try now. "
            "Keep outputs concise: include an `insight` short phrase and a `solution` sentence per item, and a single brief `summary`. "
            "Return JSON with fields `items` (array of {id, rating, category, sentiment, location, insight, solution}) and `summary` (string). "
            "Only output JSON."
        )

        completion = client.chat.completions.create(
            model=settings.NEMOTRON_MODEL,
            messages=[
                {"role": "system", "content": "Respond with valid JSON only."},
                {"role": "user", "content": f"{user_prompt}\nPosts: {json.dumps(payload)}"},
            ],
            temperature=0.4,
            top_p=0.8,
            max_tokens=450,
        )

        content = completion.choices[0].message.content or "{}"
        cleaned = content.strip().strip("`")
        try:
            LOGGER.debug("Nemotron returned content length=%s", len(cleaned))
            return json.loads(cleaned)
        except json.JSONDecodeError:
            LOGGER.warning("Nemotron returned non-JSON payload; ignoring LLM response (no enrichment applied).")
            return {}

    return await asyncio.to_thread(_call_llm)


def _apply_nemotron_data(raw: dict[str, Any]) -> tuple[dict[str, Any], str | None]:
    if not raw:
        return {}, None

    items = raw.get("items", [])
    mapping = {item.get("id"): item for item in items if item.get("id")}
    summary = raw.get("summary")
    LOGGER.debug("Built Nemotron mapping for %s items. Has summary=%s", len(mapping), bool(summary))
    return mapping, summary


def _normalize_workflow_analysis(record: dict[str, Any], fallback_problem: str | None = None) -> dict[str, Any]:
    """Ensure workflow analysis records have the new structured shape."""
    rec = dict(record or {})
    rec["feedback_id"] = str(rec.get("feedback_id") or rec.get("id") or "")
    rec["name"] = (str(rec.get("name") or "").strip()) or "Unknown"
    base_problem = rec.get("problem") or fallback_problem or ""
    rec["problem"] = str(base_problem).strip() or "Unspecified issue"
    rec["resolved"] = bool(rec.get("resolved", False))

    intake_raw = rec.get("intake")
    if not isinstance(intake_raw, dict):
        intake_raw = {}
    tags_raw = intake_raw.get("tags") if isinstance(intake_raw.get("tags"), list) else []
    rec["intake"] = {
        "classification": (str(intake_raw.get("classification") or "").strip()) or "General Inquiry",
        "summary": (str(intake_raw.get("summary") or rec["problem"]).strip()),
        "tags": [str(tag).strip() for tag in tags_raw if str(tag).strip()],
    }

    sentiment_raw = rec.get("sentiment")
    if not isinstance(sentiment_raw, dict):
        sentiment_raw = {}
    score_raw = sentiment_raw.get("score")
    rec["sentiment"] = {
        "tone": (str(sentiment_raw.get("tone") or "").strip()) or "neutral",
        "score": float(score_raw) if isinstance(score_raw, (int, float)) else None,
        "urgency": (str(sentiment_raw.get("urgency") or "").strip()) or None,
        "notes": (str(sentiment_raw.get("notes") or "").strip()) or None,
    }

    routing_raw = rec.get("routing")
    actions: list[dict[str, Any]] = []
    if isinstance(routing_raw, dict) and isinstance(routing_raw.get("actions"), list):
        for action in routing_raw["actions"]:
            if not isinstance(action, dict):
                continue
            step = (str(action.get("step") or "").strip())
            if not step:
                continue
            actions.append(
                {
                    "step": step,
                    "owner": (str(action.get("owner") or "").strip()) or None,
                    "detail": (str(action.get("detail") or "").strip()) or None,
                }
            )
    elif rec.get("what_can_be_done"):
        actions.append(
            {
                "step": "Recommended action plan",
                "owner": None,
                "detail": str(rec["what_can_be_done"]).strip(),
            }
        )
    rec["routing"] = {
        "priority": (str((routing_raw or {}).get("priority") or "").strip()) or "Normal",
        "team": (str((routing_raw or {}).get("team") or "").strip()) or "Customer Care",
        "actions": actions,
    }

    insights_raw = rec.get("insights")
    flowchart: list[dict[str, Any]] = []
    cards: list[dict[str, Any]] = []
    insight_type = "cards"
    if isinstance(insights_raw, dict):
        insight_type = str(insights_raw.get("type") or "cards").strip().lower()
        if insight_type not in {"flowchart", "cards"}:
            insight_type = "cards"
        flow_src = insights_raw.get("flowchart")
        if isinstance(flow_src, list):
            for idx, step in enumerate(flow_src):
                if isinstance(step, dict):
                    flowchart.append(
                        {
                            "title": (str(step.get("title") or "").strip()) or f"Step {idx+1}",
                            "description": (str(step.get("description") or "").strip()),
                            "color": (str(step.get("color") or "").strip()) or None,
                        }
                    )
                elif isinstance(step, str):
                    flowchart.append(
                        {
                            "title": f"Step {idx+1}",
                            "description": step.strip(),
                            "color": None,
                        }
                    )
        cards_src = insights_raw.get("cards")
        if isinstance(cards_src, list):
            for card in cards_src:
                if not isinstance(card, dict):
                    continue
                title = (str(card.get("title") or "").strip())
                body = (str(card.get("body") or "").strip())
                if not title and not body:
                    continue
                color = (str(card.get("color") or "").strip()) or "#E20074"
                cards.append(
                    {
                        "title": title or "Insight",
                        "body": body,
                        "color": color,
                    }
                )
    elif isinstance(rec.get("roadmap"), list):
        for idx, step in enumerate(rec["roadmap"]):
            cards.append(
                {
                    "title": f"Step {idx+1}",
                    "body": str(step).strip(),
                    "color": "#E20074",
                }
            )
        insight_type = "cards" if cards else "flowchart"
    else:
        insight_type = "cards"

    if insight_type == "flowchart" and not flowchart and cards:
        insight_type = "cards"
    if insight_type == "cards" and not cards and flowchart:
        insight_type = "flowchart"

    rec["insights"] = {
        "type": insight_type,
        "flowchart": flowchart,
        "cards": cards,
    }

    analyzed_raw = rec.get("analyzed_at")
    try:
        rec["analyzed_at"] = int(analyzed_raw)
    except (TypeError, ValueError):
        rec["analyzed_at"] = int(datetime.now(timezone.utc).timestamp())

    return rec


def _build_sentiment_entry(post: SocialPost, enrichment: dict[str, Any]) -> SentimentResult:
    rating = int(enrichment.get("rating", _heuristic_rating(post.text)))
    sentiment = enrichment.get("sentiment") or _sentiment_from_rating(rating)
    category = enrichment.get("category") or _heuristic_category(post.text)
    location_text = enrichment.get("location")
    solution_text = enrichment.get("solution") or _default_solution(category, sentiment, post.text)

    if location_text and (not post.location or not post.location.city):
        post.location = Location(raw=location_text)

    confidence = min(0.95, 0.5 + abs(rating - 3) * 0.15)

    issues: list[str] = []
    delights: list[str] = []
    if sentiment == "negative":
        issues.append(enrichment.get("insight") or f"Negative feedback on {category.lower()}")
    elif sentiment == "positive":
        delights.append(enrichment.get("insight") or f"Positive note on {category.lower()}")

    return SentimentResult(
        post=post,
        sentiment=sentiment,  # type: ignore[arg-type]
        confidence=confidence,
        rating=rating,
        solution=solution_text,
        category=category,  # type: ignore[arg-type]
        issues=issues,
        delights=delights,
    )


def _tally_categories(sentiments: list[SentimentResult]) -> dict[str, int]:
    tally: dict[str, int] = {
        "Network Coverage": 0,
        "Customer Service": 0,
        "Billing": 0,
        "Pricing & Plans": 0,
        "Device and Equipment": 0,
        "Store Experience": 0,
        "Mobile App": 0,
        "Other": 0,
    }
    for item in sentiments:
        tally[item.category] = tally.get(item.category, 0) + 1
    return tally


def _compute_csi(sentiments: list[SentimentResult]) -> float:
    if not sentiments:
        return 50.0
    total = len(sentiments)
    positive_weight = sum(s.rating for s in sentiments if s.sentiment == "positive")
    negative_weight = sum(6 - s.rating for s in sentiments if s.sentiment == "negative")
    raw_score = ((positive_weight - negative_weight) / (total * 5)) * 100
    return max(0.0, min(100.0, round(50 + raw_score / 2, 2)))


def _fallback_summary(sentiments: list[SentimentResult], csi_score: float) -> str:
    if not sentiments:
        return "No Reddit discussions detected for the current filter."
    leading_category = max(sentiments, key=lambda s: len(s.issues) + len(s.delights)).category
    return f"CSI {csi_score}: dominant signal around {leading_category.lower()}."


async def build_sentiment_response(payload: SentimentQuery, settings: Settings) -> SentimentResponse:
    LOGGER.info("Starting sentiment analysis pipeline. query='%s' limit=%s", payload.query, payload.limit)
    t0 = time.perf_counter()
    r0 = time.perf_counter()
    reddit_posts = await fetch_social_posts(payload, settings)
    r1 = time.perf_counter()
    f0 = time.perf_counter()
    feedback_posts = await _fetch_feedback_posts(payload.limit, settings)
    f1 = time.perf_counter()
    posts = _dedupe_posts(reddit_posts + feedback_posts)
    LOGGER.info("Fetched %s posts; proceeding to LLM enrichment.", len(posts))
    l0 = time.perf_counter()
    nemotron_raw = await _request_nemotron(posts, settings)
    l1 = time.perf_counter()
    nemo_map, nemo_summary = _apply_nemotron_data(nemotron_raw)

    sentiments = [_build_sentiment_entry(post, nemo_map.get(post.id, {})) for post in posts]
    csi_score = _compute_csi(sentiments)
    summary = nemo_summary or _fallback_summary(sentiments, csi_score)
    issue_counts = _tally_categories(sentiments)

    total_ms = int((time.perf_counter() - t0) * 1000)
    timings = AnalysisTimings(
        reddit_ms=int((r1 - r0) * 1000),
        feedback_ms=int((f1 - f0) * 1000),
        llm_ms=int((l1 - l0) * 1000),
        total_ms=total_ms,
    )
    response = SentimentResponse(
        sentiments=sentiments,
        csi_score=csi_score,
        summary=summary,
        issue_counts=issue_counts,
        timings=timings,
    )
    LOGGER.info("Completed sentiment response with %s sentiments; CSI=%s", len(sentiments), csi_score)
    return response


# --------------------------- Feedback Writer ---------------------------
async def write_feedback(item: FeedbackItem, settings: Settings) -> bool:
    _ensure_firebase(settings)
    try:
        item_id = item.id or f"fb-{int(datetime.now().timestamp()*1000)}"
        when = item.posted_at or datetime.now(timezone.utc)
        record = {
            "id": item_id,
            "text": item.text,
            "author": item.author,
            "posted_at": int(when.timestamp()),
            "location_hint": item.location_hint or "",
        }
        if settings.FIREBASE_STORE == "realtime":
            from firebase_admin import db
            ref = db.reference("feedback")
            ref.child(item_id).set(record)
        else:
            from firebase_admin import firestore
            client = firestore.client()
            client.collection("feedback").document(item_id).set(record)
        LOGGER.info("Stored feedback item id=%s", item_id)
        return True
    except Exception as exc:
        LOGGER.warning("Failed to store feedback: %s", exc)
        return False


# --------------------------- Feedback Analysis (Nemotron) ---------------------------
async def analyze_feedback_item(item: FeedbackItem, settings: Settings) -> bool:
    """
    Run Nemotron to convert freshly submitted feedback into an internal workflow
    covering intake, sentiment, routing, and action-oriented insights.
    """
    local_ok = bool(
        settings.NEMOTRON_BASE_URL
        and (
            "localhost" in settings.NEMOTRON_BASE_URL
            or "127.0.0.1" in settings.NEMOTRON_BASE_URL
            or "0.0.0.0" in settings.NEMOTRON_BASE_URL
        )
    )
    if not settings.NEMOTRON_API_KEY and not local_ok:
        LOGGER.debug("Nemotron API key missing and not using local endpoint; skipping feedback analysis.")
        return False

    def _call_llm() -> dict[str, Any]:
        client = OpenAI(base_url=settings.NEMOTRON_BASE_URL, api_key=settings.NEMOTRON_API_KEY or "sk-local")
        system = (
            "You are an enterprise IT operations workflow architect for T-Mobile. "
            "Respond with valid JSON only. No markdown or commentary."
        )
        user = (
            "Analyze the following customer feedback and build an internal operations workflow for employees.\n"
            "Requirements:\n"
            "1. Provide `name` (customer name if available, else 'Unknown').\n"
            "2. Provide `problem` as a single sentence describing the core issue.\n"
            "3. Always include `resolved: false` unless the customer explicitly states the issue is fixed.\n"
            "4. Build `intake` with keys: classification (short label), summary (1–2 sentences), tags (array of 2–4 keywords).\n"
            "5. Build `sentiment` with keys: tone ('positive'|'neutral'|'negative'), score (0–100), urgency ('Low'|'Medium'|'High'), notes (1 concise sentence).\n"
            "6. Build `routing` with keys: priority (e.g., 'P1 - Critical'), team (owning T-Mobile team), actions (array of 3 steps with keys step, owner, detail).\n"
            "7. Build `insights` choosing exactly one format:\n"
            "   - If the issue needs sequential troubleshooting, set type='flowchart' and provide 3–5 ordered steps with keys title, description, color (hex such as #E20074, #FFB800, #1E3A8A, #10B981).\n"
            "   - Otherwise set type='cards' and provide 2–4 cards with keys title, body, color (hex) representing colored briefing paragraphs.\n"
            "Return strictly JSON with keys: name, problem, resolved, intake, sentiment, routing, insights.\n\n"
            f"Feedback author: {item.author}\n"
            f"Location hint: {item.location_hint or ''}\n"
            f"Feedback text:\n{item.text}"
        )
        completion = client.chat.completions.create(
            model=settings.NEMOTRON_MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=0.3,
            top_p=0.8,
            max_tokens=700,
        )
        content = (completion.choices[0].message.content or "").strip().strip("`")
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            LOGGER.warning("Nemotron returned non-JSON for feedback analysis; content length=%s", len(content))
            return {}

    raw = await asyncio.to_thread(_call_llm)
    if not raw:
        return False

    analyzed_at = int(datetime.now(timezone.utc).timestamp())
    base_record = {
        "feedback_id": item.id or "",
        "name": raw.get("name"),
        "problem": raw.get("problem"),
        "resolved": raw.get("resolved", False),
        "intake": raw.get("intake"),
        "sentiment": raw.get("sentiment"),
        "routing": raw.get("routing"),
        "insights": raw.get("insights"),
        "analyzed_at": analyzed_at,
    }
    record = _normalize_workflow_analysis(base_record, fallback_problem=item.text)
    try:
        _ensure_firebase(settings)
        if settings.FIREBASE_STORE == "realtime":
            from firebase_admin import db
            ref = db.reference("feedback_analyses")
            key = (item.id or f"fb-{int(datetime.now().timestamp()*1000)}")
            ref.child(key).set(record)
        else:
            from firebase_admin import firestore
            client = firestore.client()
            doc_id = item.id or f"fb-{int(datetime.now().timestamp()*1000)}"
            client.collection("feedback_analyses").document(doc_id).set(record)
        LOGGER.info("Stored feedback analysis for id=%s", item.id)
        return True
    except Exception as exc:
        LOGGER.warning("Failed to store feedback analysis: %s", exc)
        return False


async def list_feedback_analyses(limit: int, settings: Settings) -> list[dict[str, Any]]:
    """Fetch latest feedback analyses."""
    _ensure_firebase(settings)
    try:
        if settings.FIREBASE_STORE == "realtime":
            from firebase_admin import db
            if not settings.FIREBASE_DATABASE_URL:
                LOGGER.debug("FIREBASE_DATABASE_URL not set; skipping analysis fetch.")
                return []
            ref = db.reference("feedback_analyses")
            snapshot = ref.order_by_child("analyzed_at").limit_to_last(limit).get() or {}
            records = list(snapshot.values()) if isinstance(snapshot, dict) else snapshot or []
            # sort descending
            records.sort(key=lambda r: r.get("analyzed_at", 0), reverse=True)
        else:
            from firebase_admin import firestore
            client = firestore.client()
            docs = client.collection("feedback_analyses").order_by("analyzed_at", direction=firestore.Query.DESCENDING).limit(limit).stream()
            records = [doc.to_dict() for doc in docs]
    except Exception as exc:
        LOGGER.warning("Failed to read feedback analyses: %s", exc)
        return []

    sanitized: list[dict[str, Any]] = []
    for rec in records:
        if isinstance(rec, dict):
            sanitized.append(_normalize_workflow_analysis(rec))
    return sanitized

# --------------------------- OpenRouter Chat (JOY) ---------------------------
async def chat_with_openrouter(request: ChatRequest, settings: Settings) -> ChatResponse:
    """
    Use OpenRouter (OpenAI-compatible) to power JOY, the T‑Mobile IT expert.
    """
    if not settings.OPENROUTER_API_KEY:
        return ChatResponse(reply="Chat is not configured. Please set OPENROUTER_API_KEY.")
    try:
        client = OpenAI(base_url=settings.OPENROUTER_BASE_URL, api_key=settings.OPENROUTER_API_KEY)
        system = (
            "You are JOY, T‑Mobile's friendly mascot and an expert T‑Mobile IT advisor.\n"
            "SCOPE: Only answer questions directly related to T‑Mobile—onboarding, plans, billing, device setup, coverage/network, app login/support, migrations, and troubleshooting.\n"
            "OUT‑OF‑SCOPE BEHAVIOR: If the user's request is not about T‑Mobile, reply with exactly: \"Sorry, that is beyond my expertise.\" Do not add any other text.\n"
            "STYLE: Professional, empathetic, concise but complete. Prefer numbered steps, brief explanations, and clear next actions. "
            "Do not invent URLs; if needed, say “Visit the T‑Mobile Support portal”."
        )
        completion = await asyncio.to_thread(
            client.chat.completions.create,
            model=settings.OPENROUTER_MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": request.message},
            ],
            temperature=0.3,
            top_p=0.9,
            max_tokens=800,
        )
        reply = (completion.choices[0].message.content or "").strip()
        if not reply:
            reply = "I'm JOY. How can I help you onboard to T‑Mobile or resolve a technical issue today?"
        return ChatResponse(reply=reply)
    except Exception as exc:
        LOGGER.warning("OpenRouter chat failure: %s", exc)
        return ChatResponse(reply="JOY is temporarily unavailable. Please try again shortly.")


# --------------------------- Employees ---------------------------
async def upsert_employee(req: EmployeeUpdateRequest, settings: Settings) -> EmployeeRecord:
    _ensure_firebase(settings)
    try:
        from firebase_admin import auth, firestore
        # Update auth user if needed
        kwargs: dict[str, Any] = {}
        if req.email:
            kwargs["email"] = req.email
        if req.new_password:
            kwargs["password"] = req.new_password
        if kwargs:
            auth.update_user(req.emp_id, **kwargs)
        # Store profile in Firestore 'employees' (always use Firestore for employees)
        client = firestore.client()
        record = {
            "Emp_ID": req.emp_id,
            "Name": req.name or "",
            "FName": req.first_name or "",
            "LName": req.last_name or "",
            "Email": req.email or "",
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        client.collection("employees").document(req.emp_id).set(record, merge=True)
        return EmployeeRecord(emp_id=req.emp_id, name=req.name, email=req.email)
    except Exception as exc:
        LOGGER.warning("Failed to upsert employee: %s", exc)
        return EmployeeRecord(emp_id=req.emp_id, name=req.name, email=req.email)


async def signup_employee(req: EmployeeSignupRequest, settings: Settings) -> EmployeeRecord:
    _ensure_firebase(settings)
    try:
        from firebase_admin import auth, firestore
        import bcrypt  # type: ignore
        # Create or update auth user
        user = None
        if req.emp_id:
            try:
                user = auth.get_user(req.emp_id)
            except Exception:
                user = None
        if user:
            auth.update_user(user.uid, email=req.email, password=req.password, display_name=f"{req.first_name} {req.last_name}")
            emp_id = user.uid
        else:
            user = auth.create_user(email=req.email, password=req.password, display_name=f"{req.first_name} {req.last_name}")
            emp_id = user.uid
        # Hash password for Firestore storage (never plaintext)
        pw_hash = bcrypt.hashpw(req.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        # Write to Firestore employees
        client = firestore.client()
        doc = {
            "Emp_ID": emp_id,
            "FName": req.first_name,
            "LName": req.last_name,
            "Email": req.email,
            "PasswordHash": pw_hash,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        client.collection("employees").document(emp_id).set(doc, merge=True)
        return EmployeeRecord(emp_id=emp_id, name=f"{req.first_name} {req.last_name}", email=req.email)
    except Exception as exc:
        LOGGER.warning("Employee signup failed: %s", exc)
        return EmployeeRecord(emp_id=req.emp_id or "", name=f"{req.first_name} {req.last_name}", email=req.email)
