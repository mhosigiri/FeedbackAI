export interface ConfigStatus {
  has_reddit_credentials: boolean;
  has_nemotron_credentials: boolean;
  has_gemini_credentials: boolean;
  has_maps_credentials: boolean;
}

export interface SentimentResult {
  post: {
    id: string;
    text: string;
    author: string;
    posted_at: string;
    permalink?: string | null;
    source: string;
  };
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  rating: number;
  solution?: string;
  category:
    | 'Network Coverage'
    | 'Customer Service'
    | 'Billing'
    | 'Pricing & Plans'
    | 'Device and Equipment'
    | 'Store Experience'
    | 'Mobile App'
    | 'Other';
  issues: string[];
  delights: string[];
}

export interface AnalyzeResponse {
  sentiments: SentimentResult[];
  csi_score: number;
  summary: string;
  issue_counts: Record<string, number>;
  timings?: AnalysisTimings;
}

export interface AnalyzePayload {
  query: string;
  limit?: number;
  subreddits?: string[];
  keywords?: string[];
}

export interface AnalysisTimings {
  reddit_ms: number;
  feedback_ms: number;
  llm_ms: number;
  total_ms: number;
}

export interface WorkflowIntake {
  classification: string;
  summary: string;
  tags: string[];
}

export interface WorkflowSentiment {
  tone: 'positive' | 'neutral' | 'negative' | string;
  score?: number | null;
  urgency?: string | null;
  notes?: string | null;
}

export interface WorkflowRoutingAction {
  step: string;
  owner?: string | null;
  detail?: string | null;
}

export interface WorkflowRouting {
  priority: string;
  team: string;
  actions: WorkflowRoutingAction[];
}

export interface WorkflowInsightFlowStep {
  title: string;
  description: string;
  color?: string | null;
}

export interface WorkflowInsightCard {
  title: string;
  body: string;
  color: string;
}

export interface WorkflowInsights {
  type: 'flowchart' | 'cards';
  flowchart: WorkflowInsightFlowStep[];
  cards: WorkflowInsightCard[];
}

export interface FeedbackAnalysis {
  feedback_id: string;
  name: string;
  problem: string;
  intake: WorkflowIntake;
  sentiment: WorkflowSentiment;
  routing: WorkflowRouting;
  insights: WorkflowInsights;
  resolved: boolean;
  analyzed_at: number; // epoch seconds
}


