from datetime import datetime, timezone
from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import Settings, get_settings
from app.schemas import (
    ConfigStatus,
    HealthResponse,
    SentimentQuery,
    SentimentResponse,
    SocialPost,
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
        allow_credentials=False,
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
