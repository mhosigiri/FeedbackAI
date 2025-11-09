from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class Location(BaseModel):
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "USA"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    raw: Optional[str] = None


class SocialPost(BaseModel):
    id: str
    text: str
    author: str
    posted_at: datetime
    location: Optional[Location] = None
    permalink: Optional[str] = None
    source: str = "reddit"


class SentimentResult(BaseModel):
    post: SocialPost
    sentiment: Literal["positive", "neutral", "negative"]
    confidence: float = Field(..., ge=0, le=1)
    rating: int = Field(..., ge=1, le=5)
    category: Literal[
        "Network Coverage",
        "Customer Service",
        "Billing",
        "Pricing & Plans",
        "Device and Equipment",
        "Store Experience",
        "Mobile App",
        "Other",
    ]
    issues: list[str] = []
    delights: list[str] = []


class SentimentQuery(BaseModel):
    query: str = Field(..., example="T-Mobile network Dallas")
    limit: int = Field(10, ge=1, le=100)
    location_hint: Optional[str] = Field(None, example="Dallas, TX")


class SentimentResponse(BaseModel):
    sentiments: list[SentimentResult]
    csi_score: float = Field(..., ge=0, le=100)
    summary: str
    issue_counts: dict[str, int]


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime


class ConfigStatus(BaseModel):
    has_reddit_credentials: bool
    has_nemotron_credentials: bool
    has_gemini_credentials: bool
    has_maps_credentials: bool
