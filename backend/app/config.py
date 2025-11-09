from functools import lru_cache
from typing import Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralized application configuration."""
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # Ignore unknown keys in .env (e.g., deprecated MOCK_MODE, REDDIT_API_KEY)
    )

    # API keys / external services
    REDDIT_CLIENT_ID: Optional[str] = None
    REDDIT_CLIENT_SECRET: Optional[str] = None
    REDDIT_USER_AGENT: str = "T-Sentiment-Agent/0.1 (by /u/hackutd)"
    NEMOTRON_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    GOOGLE_MAPS_API_KEY: Optional[str] = None

    # Frontend + CORS
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    # When true, allow all origins (dev convenience). Overrides ALLOWED_ORIGINS.
    CORS_ALLOW_ALL: bool = False
    # Comma-separated list of origins or JSON list. FRONTEND_ORIGIN is auto-added.
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
    ]

    # Logging
    LOG_LEVEL: str = "INFO"

    # External endpoints
    REDDIT_BASE_URL: str = "https://oauth.reddit.com"
    NEMOTRON_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    NEMOTRON_MODEL: str = "mistralai/mistral-nemotron"

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def _normalize_origins(cls, value):
        # Accept comma-separated string, JSON string, or list
        if value is None:
            return []
        if isinstance(value, str):
            # Split on commas; ignore empties
            parts = [v.strip() for v in value.split(",")]
            return [p for p in parts if p]
        return value

@lru_cache()
def get_settings() -> Settings:
    return Settings()
