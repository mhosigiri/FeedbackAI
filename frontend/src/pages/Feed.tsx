import React, { useEffect, useMemo, useState } from 'react';
import { analyze } from '../api';
import type { AnalyzeResponse, SentimentResult } from '../types';

export default function Feed() {
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [query, setQuery] = useState('T-Mobile network');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  // Sitewide search: leave subreddits empty; extract keywords from query/search
  const subreddits = useMemo<string[]>(() => [], []);
  const keywords = useMemo(
    () => Array.from(new Set((query || '').toLowerCase().split(/\s+/).filter(Boolean))),
    [query]
  );

  useEffect(() => {
    let timerId: number | undefined;
    (async () => {
      try {
        setError('');
        setLoading(true);
        setProgress(1);
        const tickStart = Date.now();
        timerId = window.setInterval(() => {
          setProgress((p) => (p < 95 ? Math.min(95, p + Math.max(1, Math.round((Date.now() - tickStart) / 800))) : p));
        }, 400);
        const res = await analyze({ query, limit: 3, subreddits, keywords });
        setData(res as AnalyzeResponse);
        setProgress(100);
      } catch (e: any) {
        setError(e?.message || 'Failed to load feed');
        setProgress(0);
      } finally {
        if (typeof timerId === 'number') {
          window.clearInterval(timerId);
        }
        setLoading(false);
      }
    })();
    return () => {
      if (typeof timerId === 'number') {
        window.clearInterval(timerId);
      }
    };
  }, [query, keywords, subreddits]);

  const sentiments = (data?.sentiments || []);
  const uniqueById = Array.from(new Map(sentiments.map((s: SentimentResult) => [s.post.id, s])).values());
  const items = uniqueById.filter((s: SentimentResult) => s.post.source === 'reddit').slice(0, 3);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = (search || '').trim();
    if (!input) return;
    // Keep T‑Mobile relevance while searching all of Reddit
    setQuery(`T-Mobile ${input}`);
  };

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-4">Feed (Reddit)</h1>
      {loading && (
        <div className="mb-3">
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded">
            <div
              className="h-2 bg-[#E20074] rounded transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Loading… {progress}%</div>
        </div>
      )}
      <form onSubmit={onSubmit} className="mb-4 flex gap-2">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Search Reddit for T‑Mobile issues and solutions (e.g., 'wifi calling not working')"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="px-4 py-2 bg-[#E20074] text-white rounded">Search</button>
      </form>
      {error && <p className="text-sm text-red-600 mb-2">Error: {error}</p>}
      {!loading && data?.timings?.reddit_ms != null && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Reddit fetch time: {(data.timings.reddit_ms / 1000).toFixed(2)}s
        </p>
      )}
      <div className="space-y-4">
        {items.map((s) => (
          <div key={s.post.id} className="p-4 border rounded-lg">
            <div className="text-sm text-gray-500 mb-1">
              {s.post.author} • {new Date(s.post.posted_at).toLocaleString()} • {s.category} • {s.sentiment}
            </div>
            <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{s.post.text}</p>
            {s.solution && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                <span className="font-medium">Proposed solution:</span> {s.solution}
              </p>
            )}
            {s.post.permalink && (
              <a className="text-[#E20074] text-sm" href={s.post.permalink} target="_blank" rel="noreferrer">View on Reddit</a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


