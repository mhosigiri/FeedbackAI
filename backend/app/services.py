from __future__ import annotations

import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Any

import httpx
from openai import OpenAI

from .config import Settings
from .schemas import (
    ConfigStatus,
    Location,
    SentimentQuery,
    SentimentResponse,
    SentimentResult,
    SocialPost,
)

LOGGER = logging.getLogger("sentiment-services")

REDDIT_SEARCH_PATH = "/search"
USER_AGENT = "T-Sentiment-Agent/0.1 (by /u/hackutd)"
REDDIT_TOKEN_URL = "https://www.reddit.com/api/v1/access_token"

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
        has_nemotron_credentials=bool(settings.NEMOTRON_API_KEY),
        has_gemini_credentials=bool(settings.GEMINI_API_KEY),
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
    if not token:
        LOGGER.error("No Reddit credentials available (REDDIT_CLIENT_ID/SECRET missing or token exchange failed).")
        return []

    headers = {
        "User-Agent": settings.REDDIT_USER_AGENT or USER_AGENT,
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }
    params = {
        "q": f"\"T-Mobile\" {payload.query}",
        "limit": payload.limit,
        "sort": "new",
        "t": "day",
        "include_facets": "false",
    }

    try:
        async with httpx.AsyncClient(base_url=settings.REDDIT_BASE_URL, timeout=15.0) as client:
            response = await client.get(REDDIT_SEARCH_PATH, params=params, headers=headers)
            response.raise_for_status()
            LOGGER.debug("Reddit search response status=%s", response.status_code)
            data = response.json()
    except httpx.HTTPStatusError as exc:
        # If Reddit blocks or rejects (e.g., 401/403/429), don't crash the API; return empty
        LOGGER.warning("Reddit API returned %s. Returning empty list. Detail: %s", exc.response.status_code, exc)
        return []
    except httpx.HTTPError as exc:
        LOGGER.warning("Reddit network error: %s. Returning empty list.", exc)
        return []

    return _parse_listing(data, payload)


def _parse_listing(data: Any, payload: SentimentQuery) -> list[SocialPost]:
    children = data.get("data", {}).get("children", []) if isinstance(data, dict) else []
    posts: list[SocialPost] = []

    for child in children:
        node = child.get("data", {})
        text_body = f"{node.get('title', '')}\n\n{node.get('selftext', '')}".strip()
        if "t-mobile" not in text_body.lower():
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


async def _request_nemotron(posts: list[SocialPost], settings: Settings) -> dict[str, Any]:
    if not settings.NEMOTRON_API_KEY or not posts:
        if not settings.NEMOTRON_API_KEY:
            LOGGER.debug("Nemotron API key missing; skipping LLM enrichment.")
        if not posts:
            LOGGER.debug("No posts to enrich; skipping LLM enrichment.")
        return {}

    def _call_llm() -> dict[str, Any]:
        client = OpenAI(base_url=settings.NEMOTRON_BASE_URL, api_key=settings.NEMOTRON_API_KEY)
        payload = [
            {"id": post.id, "text": post.text[:600], "author": post.author, "location": post.location.raw if post.location else ""}
            for post in posts
        ]
        user_prompt = (
            "You are an operations analyst for T-Mobile. "
            "Rate each Reddit post from 1 (very negative) to 5 (very positive) about customer experience, "
            "infer the primary problem category from this list: "
            "[Network Coverage, Customer Service, Billing, Pricing & Plans, Device and Equipment, Store Experience, Mobile App, Other]. "
            "Extract a short location hint if present. Return JSON with fields "
            "`items` (array of {id, rating, category, sentiment, location, insight}) and "
            "`summary` (string). Only output JSON."
        )

        completion = client.chat.completions.create(
            model=settings.NEMOTRON_MODEL,
            messages=[
                {"role": "system", "content": "Respond with valid JSON only."},
                {"role": "user", "content": f"{user_prompt}\nPosts: {json.dumps(payload)}"},
            ],
            temperature=0.4,
            top_p=0.8,
            max_tokens=900,
        )

        content = completion.choices[0].message.content or "{}"
        cleaned = content.strip().strip("`")
        try:
            LOGGER.debug("Nemotron returned content length=%s", len(cleaned))
            return json.loads(cleaned)
        except json.JSONDecodeError:
            LOGGER.warning("Nemotron returned non-JSON payload, falling back to heuristics.")
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


def _build_sentiment_entry(post: SocialPost, enrichment: dict[str, Any]) -> SentimentResult:
    rating = int(enrichment.get("rating", _heuristic_rating(post.text)))
    sentiment = enrichment.get("sentiment") or _sentiment_from_rating(rating)
    category = enrichment.get("category") or _heuristic_category(post.text)
    location_text = enrichment.get("location")

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
    posts = await fetch_social_posts(payload, settings)
    LOGGER.info("Fetched %s posts; proceeding to LLM enrichment.", len(posts))
    nemotron_raw = await _request_nemotron(posts, settings)
    nemo_map, nemo_summary = _apply_nemotron_data(nemotron_raw)

    sentiments = [_build_sentiment_entry(post, nemo_map.get(post.id, {})) for post in posts]
    csi_score = _compute_csi(sentiments)
    summary = nemo_summary or _fallback_summary(sentiments, csi_score)
    issue_counts = _tally_categories(sentiments)

    response = SentimentResponse(
        sentiments=sentiments,
        csi_score=csi_score,
        summary=summary,
        issue_counts=issue_counts,
    )
    LOGGER.info("Completed sentiment response with %s sentiments; CSI=%s", len(sentiments), csi_score)
    return response
