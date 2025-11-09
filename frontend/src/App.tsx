import React from 'react';
import Sidebar from './components/Sidebar';
import CustomerHappinessIndex from './components/CustomerHappinessIndex';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import AIAssistant from './pages/AIAssistant';
import AIWorkflow from './pages/AIWorkflow';
import Feed from './pages/Feed';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import GeoMap from './components/GeoMap';
import InsightCharts from './components/InsightCharts';
import CategoryPie from './components/CategoryPie';
import FeedbackAnalyses from './components/FeedbackAnalyses';
import ProtectedRoute from './components/ProtectedRoute';
import FeedbackForm from './components/FeedbackForm';
import { useEffect, useState } from 'react';
import { analyze } from './api';
import type { AnalyzeResponse } from './types';

const App: React.FC = () => {
  const [chiKey, setChiKey] = useState(0);
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0B0B]">
      <Sidebar />
      <main className="min-h-screen transition-all duration-300 md:ml-[250px]">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/assistant" element={<AIAssistant />} />
          <Route
            path="/workflow"
            element={
              <ProtectedRoute>
                <AIWorkflow />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={
            <section id="dashboard" className="min-h-screen p-8">
              <div className="max-w-6xl w-full space-y-8">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  Dashboard
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  Live Customer Happiness Index, Map, and Insights from Reddit + feedback.
                </p>
                <CustomerHappinessIndex key={chiKey} />
                <DashboardInsights onRefetchCHI={() => setChiKey((k) => k + 1)} />
              </div>
            </section>
          } />
          <Route path="/feed" element={<Feed />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;

function DashboardInsights({ onRefetchCHI }: { onRefetchCHI?: () => void }) {
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('T-Mobile network');
  const [limit, setLimit] = useState(15);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState(0);
  const timerRef = React.useRef<number | null>(null);
  const startRef = React.useRef<number>(0);
  const estimateRef = React.useRef<number>(0);
  const categories = [
    'Network Coverage',
    'Customer Service',
    'Billing',
    'Pricing & Plans',
    'Device and Equipment',
    'Store Experience',
    'Mobile App',
    'Other',
  ];
  const [selected, setSelected] = useState<Record<string, boolean>>(
    Object.fromEntries(categories.map(c => [c, true]))
  );
  useEffect(() => {
    (async () => {
      try {
        setError('');
        const res = await analyze({ query, limit });
        setData(res as AnalyzeResponse);
      } catch (e: any) {
        setError(e?.message || 'Failed to load insights');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // initial load
  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError('');
      // Start progress with an ETA based on limit (bounded 2–12s)
      const estimatedSec = Math.max(2, Math.min(12, 1.5 + limit * 0.25));
      estimateRef.current = estimatedSec;
      startRef.current = Date.now();
      setEta(estimatedSec);
      setProgress(0);
      setLoading(true);
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startRef.current) / 1000;
        const pct = Math.min(99, Math.round((elapsed / estimateRef.current) * 100));
        setProgress(pct);
        setEta(Math.max(0, Math.ceil(estimateRef.current - elapsed)));
      }, 150) as unknown as number;

      const res = await analyze({ query, limit });
      setData(res as AnalyzeResponse);
      // Finish progress
      if (timerRef.current) window.clearInterval(timerRef.current);
      setProgress(100);
      setEta(0);
      window.setTimeout(() => setLoading(false), 400);
    } catch (e: any) {
      setError(e?.message || 'Failed to load insights');
      if (timerRef.current) window.clearInterval(timerRef.current);
      setLoading(false);
    }
  }
  const filteredSentiments = (data?.sentiments || []).filter((s: any) => selected[s.category]);
  const filteredCounts = filteredSentiments.reduce<Record<string, number>>((acc, s: any) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {});
  return (
    <>
      <div className="mb-6">
        <FeedbackForm onAdded={() => { runSearch(new Event('submit') as any); onRefetchCHI?.(); }} />
      </div>
      <form onSubmit={runSearch} className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm mb-1">Search Query</label>
          <input className="border rounded px-3 py-2 w-72" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Limit</label>
          <input type="number" min={3} max={50} className="border rounded px-3 py-2 w-24" value={limit} onChange={e => setLimit(parseInt(e.target.value || '15', 10))} />
        </div>
        <button type="submit" className="px-4 py-2 bg-[#E20074] text-white rounded">Run</button>
        {error && <p className="text-sm text-red-600 ml-2">{error}</p>}
      </form>
      {loading && (
        <div className="mb-6">
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded">
            <div
              className="h-2 bg-[#E20074] rounded transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Fetching results… {eta > 0 ? `~${eta}s remaining` : 'finalizing'}
          </p>
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Category Filters</h3>
        <div className="flex flex-wrap gap-4">
          {categories.map(c => (
            <label key={c} className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={!!selected[c]} onChange={() => setSelected({ ...selected, [c]: !selected[c] })} />
              {c}
            </label>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Geospatial Map</h2>
          <GeoMap sentiments={filteredSentiments as any} />
          {error && <p className="text-sm text-red-600 mt-2">Error: {error}</p>}
        </div>
        <div className="space-y-6">
          <InsightCharts issueCounts={Object.keys(filteredCounts).length ? filteredCounts : (data?.issue_counts || {})} />
          <CategoryPie issueCounts={Object.keys(filteredCounts).length ? filteredCounts : (data?.issue_counts || {})} />
        </div>
      </div>
      <div className="mt-6">
        <FeedbackAnalyses />
      </div>
    </>
  );
}

