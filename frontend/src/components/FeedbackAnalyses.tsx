import React, { useEffect, useState } from 'react';
import { listAnalyses } from '../api';
import type { FeedbackAnalysis, WorkflowInsightCard, WorkflowInsightFlowStep } from '../types';
import { CheckCircle, User as UserIcon, ClipboardList, AlertCircle, Tag, Compass } from 'lucide-react';

export default function FeedbackAnalyses() {
  const [items, setItems] = useState<FeedbackAnalysis[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await listAnalyses(8);
        setItems(res as FeedbackAnalysis[]);
      } catch (e: any) {
        setError(e?.message || 'Failed to load analyses');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div id="insights" className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">Latest Customer Form Analyses</h2>
      {loading && <p className="text-sm text-gray-500">Analyzing recent submissions...</p>}
      {error && <p className="text-sm text-red-600">Error: {error}</p>}
      <div className="grid grid-cols-1 gap-4">
        {items.map((a) => (
          <div key={a.feedback_id} className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121212]">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <UserIcon className="w-4 h-4" />
                <span className="font-medium">{a.name || 'Unknown'}</span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date((a.analyzed_at || 0) * 1000).toLocaleString()}
              </span>
            </div>
            <section className="mb-4">
              <p className="text-sm text-gray-500">Problem</p>
              <p className="text-gray-900 dark:text-gray-100">{a.problem}</p>
            </section>

            <section className="mb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                <ClipboardList className="w-4 h-4" />
                <span>Automated Intake &amp; Classification</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#E20074]/10 text-[#E20074] border border-[#E20074]/20">
                  {a.intake?.classification || 'General Inquiry'}
                </span>
                {(a.intake?.tags || []).map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {a.intake?.summary}
              </p>
            </section>

            <section className="mb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>Sentiment Analysis</span>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium capitalize">{a.sentiment?.tone || 'neutral'}</span>
                {typeof a.sentiment?.score === 'number' && (
                  <span>Score: {Math.round(a.sentiment.score)}</span>
                )}
                {a.sentiment?.urgency && <span>Urgency: {a.sentiment.urgency}</span>}
              </div>
              {a.sentiment?.notes && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{a.sentiment.notes}</p>
              )}
            </section>

            <section className="mb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                <Compass className="w-4 h-4" />
                <span>Route &amp; Prioritize</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[#FFB800]/10 text-[#FF8A00] border border-[#FFB800]/30">
                  {a.routing?.priority || 'Normal'}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {a.routing?.team || 'Customer Care'}
                </span>
              </div>
              <ol className="list-decimal ml-5 space-y-1">
                {(a.routing?.actions || []).map((step, idx) => (
                  <li key={idx} className="text-gray-900 dark:text-gray-100">
                    <p className="font-medium">{step.step}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {step.owner && <span>{step.owner} • </span>}
                      {step.detail}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                <CheckCircle className="w-4 h-4" />
                <span>Insights</span>
              </div>
              {renderInsights(a.insights?.type, a.insights?.flowchart || [], a.insights?.cards || [])}
            </section>
          </div>
        ))}
        {!loading && !error && items.length === 0 && (
          <p className="text-sm text-gray-500">No analyses yet. Submit a feedback form to see results.</p>
        )}
      </div>
    </div>
  );
}

function renderInsights(
  type: FeedbackAnalysis['insights']['type'] | undefined,
  flowchart: WorkflowInsightFlowStep[],
  cards: WorkflowInsightCard[]
) {
  if (type === 'flowchart' && flowchart.length > 0) {
    return (
      <div className="relative pl-4">
        <div className="absolute left-1 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden />
        <ul className="space-y-4">
          {flowchart.map((step, idx) => (
            <li key={`${step.title}-${idx}`} className="relative flex gap-3">
              <div
                className="w-3 h-3 rounded-full border-2 border-white dark:border-[#121212]"
                style={{ backgroundColor: step.color || '#E20074' }}
              />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {idx + 1}. {step.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {(cards.length > 0 ? cards : [
        { title: 'Insight', body: 'Nemotron did not return detailed guidance.', color: '#E20074' },
      ]).map((card, idx) => (
        <div
          key={`${card.title}-${idx}`}
          className="rounded-xl p-4 text-white shadow"
          style={{ background: card.color || '#E20074' }}
        >
          <p className="text-sm font-semibold mb-1">{card.title}</p>
          <p className="text-sm opacity-90">{card.body}</p>
        </div>
      ))}
    </div>
  );
}


