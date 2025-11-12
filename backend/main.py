from datetime import datetime, timezone
from typing import Annotated

from fastapi import Depends, FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import Settings, get_settings
from app.schemas import (
    ConfigStatus,
    HealthResponse,
    SentimentQuery,
    SentimentResponse,
    SocialPost,
    FeedbackItem,
    FeedbackAnalysis,
    ChatRequest,
    ChatResponse,
    EmployeeUpdateRequest,
    EmployeeRecord,
    EmployeeSignupRequest,
)
from app import services

settings = get_settings()

# Configure logging early
log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
logging.basicConfig(
    level=log_level,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("openai").setLevel(logging.WARNING)

app = FastAPI(
    title="T-Sentiment Agent API",
    description="Backend services for the T-Mobile sentiment dashboard MVP",
    version="0.1.0",
)

# Configure CORS from settings:
# - If CORS_ALLOW_ALL is true, allow all origins (credentials disabled as required by browsers).
# - Otherwise, allow the union of FRONTEND_ORIGIN and ALLOWED_ORIGINS (credentials enabled).
if settings.CORS_ALLOW_ALL:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    allowed = set(settings.ALLOWED_ORIGINS or [])
    allowed.add(settings.FRONTEND_ORIGIN)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=sorted(allowed),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/health", response_model=HealthResponse)
async def healthcheck() -> HealthResponse:
    return HealthResponse(status="ok", timestamp=datetime.now(timezone.utc))


@app.get("/config", response_model=ConfigStatus)
async def config(settings: Annotated[Settings, Depends(get_settings)]) -> ConfigStatus:
    return services.build_config_status(settings)


@app.get("/posts", response_model=list[SocialPost])
async def fetch_posts(
    settings: Annotated[Settings, Depends(get_settings)],
    query: str = "T-Mobile",
    limit: int = 5,
) -> list[SocialPost]:
    payload = SentimentQuery(query=query, limit=limit)
    return await services.fetch_social_posts(payload, settings)


@app.post("/analyze", response_model=SentimentResponse)
async def analyze(query: SentimentQuery, settings: Annotated[Settings, Depends(get_settings)]) -> SentimentResponse:
    return await services.build_sentiment_response(query, settings)


@app.post("/feedback")
async def submit_feedback(
    item: FeedbackItem,
    background: BackgroundTasks,
    settings: Annotated[Settings, Depends(get_settings)],
) -> dict[str, bool]:
    # Ensure an id so analysis can reference it deterministically
    if not item.id:
        item.id = f"fb-{int(datetime.now(timezone.utc).timestamp()*1000)}"
    ok = await services.write_feedback(item, settings)
    if ok:
        # Fire-and-forget Nemotron analysis
        background.add_task(services.analyze_feedback_item, item, settings)
    return {"ok": ok}


@app.post("/feedback/analyze")
async def analyze_feedback_now(
    item: FeedbackItem,
    settings: Annotated[Settings, Depends(get_settings)],
) -> dict[str, bool]:
    ok = await services.analyze_feedback_item(item, settings)
    return {"ok": ok}


@app.get("/feedback/analyses", response_model=list[FeedbackAnalysis])
async def list_analyses(
    settings: Annotated[Settings, Depends(get_settings)],
    limit: int = 10,
) -> list[FeedbackAnalysis]:
    records = await services.list_feedback_analyses(limit, settings)
    # Coerce into pydantic model (analyzed_at is int epoch)
    return [FeedbackAnalysis(**rec) for rec in records]


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, settings: Annotated[Settings, Depends(get_settings)]) -> ChatResponse:
    return await services.chat_with_openrouter(request, settings)


@app.post("/employees/update", response_model=EmployeeRecord)
async def employee_update(payload: EmployeeUpdateRequest, settings: Annotated[Settings, Depends(get_settings)]) -> EmployeeRecord:
    return await services.upsert_employee(payload, settings)


@app.post("/employees/signup", response_model=EmployeeRecord)
async def employee_signup(payload: EmployeeSignupRequest, settings: Annotated[Settings, Depends(get_settings)]) -> EmployeeRecord:
    return await services.signup_employee(payload, settings)
