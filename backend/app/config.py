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
    OPENROUTER_API_KEY: Optional[str] = None

    # Frontend + CORS
    FRONTEND_ORIGIN: str = "https://feedback-two-omega.vercel.app"
    # When true, allow all origins (dev convenience). Overrides ALLOWED_ORIGINS.
    CORS_ALLOW_ALL = True
    # Comma-separated list of origins or JSON list. FRONTEND_ORIGIN is auto-added.
    ALLOWED_ORIGINS: Optional[str] = "https://feedback-two-omega.vercel.app"

    # Logging
    LOG_LEVEL: str = "INFO"

    # External endpoints
    REDDIT_BASE_URL: str = "https://oauth.reddit.com"
    NEMOTRON_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    NEMOTRON_MODEL: str = "NVIDIABuild-Autogen-33"
    GEMINI_MODEL: str = "gemini-1.5-flash"
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    OPENROUTER_MODEL: str = "openrouter/auto"

    # Firebase (server-side)
    FIREBASE_SERVICE_ACCOUNT_JSON: Optional[str] = None  # JSON string
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None      # path to JSON file
    FIREBASE_PROJECT_ID: Optional[str] = None
    FIREBASE_STORE: str = "realtime"  # or "firestore"
    FIREBASE_DATABASE_URL: Optional[str] = None

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
