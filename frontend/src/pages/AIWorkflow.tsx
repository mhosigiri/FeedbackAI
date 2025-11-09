import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowDown,
  ClipboardList,
  Activity,
  Compass,
  Sparkles,
  Tag,
  AlertTriangle,
  CalendarClock,
  User as UserIcon,
  RefreshCcw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { listAnalyses } from '../api';
import type { FeedbackAnalysis, WorkflowInsightCard, WorkflowInsightFlowStep } from '../types';

const FETCH_LIMIT = 25;

const AIWorkflow: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<FeedbackAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadData = useCallback(async (silent = false) => {
    if (!isMounted.current) return;
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    try {
      const res = await listAnalyses(FETCH_LIMIT);
      if (!isMounted.current) return;
      const parsed = (res as FeedbackAnalysis[]).filter((item) => !item.resolved);
      setCases(parsed);
      setLastUpdated(Date.now());
    } catch (err: any) {
      if (!isMounted.current) return;
      setError(err?.message || 'Failed to load workflow queue');
      if (!silent) {
        setCases([]);
      }
    } finally {
      if (!isMounted.current) return;
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadData(false);
    const id = window.setInterval(() => loadData(true), 60000);
    return () => window.clearInterval(id);
  }, [loadData]);

  const openCount = cases.length;
  const lastUpdatedLabel = lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0B0B]">
      <main className="min-h-screen flex flex-col">
        <header className="w-full flex items-center justify-between py-6 px-6 border-b border-gray-200 dark:border-gray-800" role="banner">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#E20074] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-center flex-1 text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">AI Workflow</h1>
          <div className="w-20" />
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-[#E20074] via-[#FF0066] to-[#FF4D8C] text-white rounded-3xl shadow-lg p-6 md:p-8"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm uppercase tracking-widest font-semibold opacity-80">Operations Queue</p>
                  <h2 className="text-3xl md:text-4xl font-bold mt-1">Unresolved Feedback Workflows</h2>
                  <p className="mt-3 text-sm md:text-base opacity-90 max-w-2xl">
                    Nemotron captures each customer submission and transforms it into an actionable workflow for employees—covering intake, sentiment, routing, and expert guidance.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={loading || refreshing}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white text-sm font-medium transition"
                >
                  <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatTile label="Open Cases" value={openCount.toString()} />
                <StatTile label="Last Updated" value={lastUpdatedLabel} />
                <StatTile label="Auto Refresh" value="Every 60s" />
              </div>
            </motion.section>

            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={error} onRetry={() => loadData(false)} />
            ) : openCount === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-8">
                {cases.map((analysis, idx) => (
                  <WorkflowCaseCard key={analysis.feedback_id || `${analysis.analyzed_at}-${idx}`} analysis={analysis} index={idx} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIWorkflow;

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/10 rounded-2xl px-4 py-3">
      <p className="text-xs uppercase font-semibold tracking-wide opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

const LoadingState = () => (
  <div className="flex items-center justify-center py-16">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1.2 }}
      className="flex items-center gap-3 text-[#E20074]"
    >
      <RefreshCcw className="w-5 h-5 animate-spin" />
      <span className="font-medium">Syncing latest workflows…</span>
    </motion.div>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl">
    <Sparkles className="w-10 h-10 text-[#E20074]" />
    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">All customer issues are resolved 🎉</p>
    <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
      When a new feedback form arrives, Nemotron will generate a fresh workflow here for the operations team.
    </p>
  </div>
);

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center gap-3 py-16 border border-red-300 dark:border-red-700 bg-red-50/60 dark:bg-red-900/20 rounded-3xl">
    <AlertTriangle className="w-10 h-10 text-red-600" />
    <p className="text-lg font-semibold text-red-700 dark:text-red-400">Unable to load workflows</p>
    <p className="text-sm text-red-600 dark:text-red-300 text-center max-w-md">{message}</p>
    <button
      type="button"
      onClick={onRetry}
      className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
    >
      <RefreshCcw className="w-4 h-4" />
      Retry
    </button>
  </div>
);

interface WorkflowCaseCardProps {
  analysis: FeedbackAnalysis;
  index: number;
}

function WorkflowCaseCard({ analysis, index }: WorkflowCaseCardProps) {
  const intake = analysis.intake || { classification: 'General Inquiry', summary: '', tags: [] };
  const sentiment = analysis.sentiment || {};
  const routing = analysis.routing || { priority: 'Normal', team: 'Customer Care', actions: [] };
  const insights = analysis.insights;
  const timestamp = new Date((analysis.analyzed_at || 0) * 1000);

  const tags = (intake.tags || []).filter(Boolean);
  const actions = (routing.actions || []).filter((step) => step?.step);
  const tone = String(sentiment.tone || 'neutral').toLowerCase();
  const urgency = String(sentiment.urgency || 'Medium');
  const score = typeof sentiment.score === 'number' ? Math.max(0, Math.min(100, sentiment.score)) : null;

  const steps = [
    {
      title: 'Automated Intake & Classification',
      icon: <ClipboardList className="w-5 h-5" />,
      subtitle: 'Nemotron triages the customer request and adds routing signals.',
      content: (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E20074]/10 text-[#E20074] border border-[#E20074]/20">
              {intake.classification || 'General Inquiry'}
            </span>
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{intake.summary || 'No intake summary provided.'}</p>
        </div>
      ),
    },
    {
      title: 'Sentiment Analysis',
      icon: <Activity className="w-5 h-5" />,
      subtitle: 'Emotion and urgency assessment to understand customer impact.',
      content: (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${toneBadgeClass(tone)}`}>{tone}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${urgencyBadgeClass(urgency)}`}>{urgency}</span>
            {score !== null && <span className="text-xs text-gray-600 dark:text-gray-400">Score: {Math.round(score)}</span>}
          </div>
          {sentiment.notes && <p className="text-sm text-gray-700 dark:text-gray-300">{sentiment.notes}</p>}
          {score !== null && (
            <div>
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#FF0066] to-[#E20074]" style={{ width: `${score}%` }} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Confidence score (0-100)</p>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Route & Prioritize',
      icon: <Compass className="w-5 h-5" />,
      subtitle: 'Ownership and next steps for the employee team.',
      content: (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FFB800]/15 text-[#FF8A00] border border-[#FFB800]/30">
              {routing.priority || 'Normal'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              {routing.team || 'Customer Care'}
            </span>
          </div>
          {actions.length > 0 ? (
            <ol className="list-decimal ml-5 space-y-2">
              {actions.map((step, idx) => (
                <li key={`${step.step}-${idx}`} className="text-sm text-gray-800 dark:text-gray-200">
                  <p className="font-semibold">{step.step}</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {step.owner && <span className="font-medium">{step.owner}</span>}
                    {step.owner && step.detail ? ' • ' : ''}
                    {step.detail}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">Nemotron did not propose routing actions.</p>
          )}
        </div>
      ),
    },
    {
      title: 'Generate Insights',
      icon: <Sparkles className="w-5 h-5" />,
      subtitle: 'Expert troubleshooting flow or color-coded coaching for employees.',
      content: <WorkflowInsightsView insights={insights} />,
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm"
    >
      <header className="border-b border-gray-200 dark:border-gray-800 px-6 py-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-300">
                <AlertTriangle className="w-3 h-3" /> Unresolved
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-[#E20074]">Case #{index + 1}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 leading-snug">
              {analysis.problem}
            </h2>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-col items-start md:items-end gap-1">
            <span className="inline-flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5" />
              {analysis.name || 'Unknown customer'}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="w-3.5 h-3.5" />
              {timestamp.toLocaleString()}
            </span>
          </div>
        </div>
      </header>
      <div className="px-6 py-6 md:px-8 md:py-8">
        <div className="space-y-8">
          {steps.map((step, idx) => (
            <React.Fragment key={step.title}>
              <StepCard icon={step.icon} title={step.title} subtitle={step.subtitle}>
                {step.content}
              </StepCard>
              {idx < steps.length - 1 && (
                <div className="flex justify-center" aria-hidden>
                  <ArrowDown className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

function StepCard({ icon, title, subtitle, children }: StepCardProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 md:p-6">
      <div className="flex items-center justify-center md:items-start md:justify-start">
        <div className="w-11 h-11 rounded-full bg-[#E20074]/15 text-[#E20074] flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="flex-1 space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

function WorkflowInsightsView({ insights }: { insights?: FeedbackAnalysis['insights'] }) {
  if (!insights) {
    return <p className="text-sm text-gray-600 dark:text-gray-400">Nemotron did not return insight guidance.</p>;
  }

  if (insights.type === 'flowchart' && (insights.flowchart || []).length > 0) {
    return <FlowchartView steps={insights.flowchart} />;
  }

  if ((insights.cards || []).length > 0) {
    return <InsightCards cards={insights.cards} />;
  }

  return <p className="text-sm text-gray-600 dark:text-gray-400">Nemotron did not return insight guidance.</p>;
}

function FlowchartView({ steps }: { steps: WorkflowInsightFlowStep[] }) {
  return (
    <div className="space-y-6">
      {steps.map((step, idx) => (
        <div key={`${step.title}-${idx}`} className="flex items-start gap-4">
          <div className="flex flex-col items-center" aria-hidden>
            <div
              className="w-10 h-10 rounded-full text-white font-semibold flex items-center justify-center shadow"
              style={{ background: step.color || '#E20074' }}
            >
              {idx + 1}
            </div>
            {idx < steps.length - 1 && <ArrowDown className="mt-3 w-4 h-4 text-gray-300 dark:text-gray-600" />}
          </div>
          <div className="flex-1 bg-white dark:bg-[#0B0B0B] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 shadow-sm">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{step.title}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function InsightCards({ cards }: { cards: WorkflowInsightCard[] }) {
  const usable = cards.length > 0 ? cards : [{ title: 'Insight', body: 'Nemotron did not produce detailed guidance.', color: '#E20074' }];
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {usable.map((card, idx) => (
        <div
          key={`${card.title}-${idx}`}
          className="rounded-2xl p-4 text-white shadow-md"
          style={{ background: card.color || '#E20074' }}
        >
          <p className="text-sm font-semibold mb-1">{card.title}</p>
          <p className="text-sm opacity-90 whitespace-pre-wrap">{card.body}</p>
        </div>
      ))}
    </div>
  );
}

function toneBadgeClass(tone: string): string {
  switch (tone) {
    case 'positive':
      return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
    case 'negative':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    default:
      return 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  }
}

function urgencyBadgeClass(urgency: string): string {
  const norm = urgency.toLowerCase();
  if (norm === 'high' || norm === 'p1' || norm === 'critical') {
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
  }
  if (norm === 'low') {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300';
  }
  return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300';
}

