import React, { useMemo } from 'react';

const COLORS: Record<string, string> = {
  'Network Coverage': '#ef4444',
  'Customer Service': '#f97316',
  'Billing': '#eab308',
  'Pricing & Plans': '#84cc16',
  'Device and Equipment': '#22c55e',
  'Store Experience': '#06b6d4',
  'Mobile App': '#3b82f6',
  'Other': '#a855f7',
};

export default function CategoryPie({ issueCounts }: { issueCounts: Record<string, number> }) {
  const { gradient, entries, total } = useMemo(() => {
    const es = Object.entries(issueCounts || {}).filter(([, v]) => v > 0);
    const sum = es.reduce((a, [, v]) => a + v, 0) || 1;
    let start = 0;
    const segs: string[] = [];
    es.forEach(([k, v]) => {
      const color = COLORS[k] || '#999';
      const pct = (v / sum) * 100;
      const end = start + pct;
      segs.push(`${color} ${start}% ${end}%`);
      start = end;
    });
    return { gradient: segs.join(', '), entries: es, total: sum };
  }, [issueCounts]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Category Mix</h2>
      <div className="flex items-center gap-6">
        <div
          className="w-40 h-40 rounded-full"
          style={{ background: `conic-gradient(${gradient || '#ddd 0% 100%'})` }}
          aria-label="Category pie chart"
          role="img"
        />
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {entries.map(([k, v]) => {
            const color = COLORS[k] || '#999';
            const pct = Math.round((v / total) * 100);
            return (
              <div key={k} className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: color }} />
                <span className="text-gray-700 dark:text-gray-300">{k}</span>
                <span className="text-gray-500">({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


