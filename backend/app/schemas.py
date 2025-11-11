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
    solution: Optional[str] = None
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
    issues: list[str] = Field(default_factory=list)
    delights: list[str] = Field(default_factory=list)


class SentimentQuery(BaseModel):
    query: str = Field(..., example="T-Mobile network Dallas")
    limit: int = Field(10, ge=1, le=100)
    location_hint: Optional[str] = Field(None, example="Dallas, TX")
    # Optional: limit Reddit search to these subreddits; if empty, search sitewide
    subreddits: list[str] | None = Field(
        default=None,
        description="List of subreddit names to search within (e.g., ['tmobile','att','networking']).",
        example=["tmobile", "tmobileisp", "att", "attwireless"],
    )
    # Optional: additional keywords that must appear alongside T‑Mobile mentions
    keywords: list[str] | None = Field(
        default=None,
        description="Extra keywords to bias relevance (e.g., ['network','coverage','5g','AT&T']).",
        example=["network", "coverage", "5g", "AT&T"],
    )


class AnalysisTimings(BaseModel):
    reddit_ms: int = 0
    feedback_ms: int = 0
    llm_ms: int = 0
    total_ms: int = 0


class SentimentResponse(BaseModel):
    sentiments: list[SentimentResult]
    csi_score: float = Field(..., ge=0, le=100)
    summary: str
    issue_counts: dict[str, int]
    timings: Optional[AnalysisTimings] = None


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime


class ConfigStatus(BaseModel):
    has_reddit_credentials: bool
    has_nemotron_credentials: bool
    has_gemini_credentials: bool
    has_maps_credentials: bool


class FeedbackItem(BaseModel):
    id: str | None = None
    text: str
    author: str = "customer"
    posted_at: datetime | None = None
    location_hint: str | None = None


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


class EmployeeUpdateRequest(BaseModel):
    emp_id: str
    name: str | None = None  # full display name
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    new_password: str | None = None


class EmployeeRecord(BaseModel):
    emp_id: str
    name: str | None = None
    email: str | None = None


class EmployeeSignupRequest(BaseModel):
    emp_id: str | None = None
    first_name: str
    last_name: str
    email: str
    password: str


class WorkflowIntake(BaseModel):
    classification: str = "General Inquiry"
    summary: str = ""
    tags: list[str] = Field(default_factory=list)


class WorkflowSentiment(BaseModel):
    tone: str = "neutral"
    score: float | None = None
    urgency: str | None = None
    notes: str | None = None


class WorkflowRoutingAction(BaseModel):
    step: str
    owner: str | None = None
    detail: str | None = None


class WorkflowRouting(BaseModel):
    priority: str = "Normal"
    team: str = "Customer Care"
    actions: list[WorkflowRoutingAction] = Field(default_factory=list)


class WorkflowInsightFlowStep(BaseModel):
    title: str
    description: str
    color: str | None = None


class WorkflowInsightCard(BaseModel):
    title: str
    body: str
    color: str = "#E20074"


class WorkflowInsights(BaseModel):
    type: Literal["flowchart", "cards"] = "cards"
    flowchart: list[WorkflowInsightFlowStep] = Field(default_factory=list)
    cards: list[WorkflowInsightCard] = Field(default_factory=list)


class FeedbackAnalysis(BaseModel):
    """Structured analysis for a single customer-submitted feedback form."""
    feedback_id: str
    name: str
    problem: str
    intake: WorkflowIntake = Field(default_factory=WorkflowIntake)
    sentiment: WorkflowSentiment = Field(default_factory=WorkflowSentiment)
    routing: WorkflowRouting = Field(default_factory=WorkflowRouting)
    insights: WorkflowInsights = Field(default_factory=WorkflowInsights)
    analyzed_at: int
    resolved: bool = False
