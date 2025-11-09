import React from 'react';

export default function InsightCharts({ issueCounts }: { issueCounts: Record<string, number> }) {
  const entries = Object.entries(issueCounts || {});
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold mb-2">Insights by Category</h2>
      {entries.map(([k, v]) => (
        <div key={k}>
          <div className="flex justify-between text-sm mb-1">
            <span>{k}</span>
            <span>{v}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 h-3 rounded">
            <div className="h-3 bg-[#E20074] rounded" style={{ width: `${(v / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}


