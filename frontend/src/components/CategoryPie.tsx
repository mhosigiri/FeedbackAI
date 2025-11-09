import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart } from 'lucide-react';

const COLORS: Record<string, string> = {
  'Network Coverage': '#3b82f6',
  'Customer Service': '#10b981',
  'Billing': '#8b5cf6',
  'Pricing & Plans': '#f59e0b',
  'Device and Equipment': '#ef4444',
  'Store Experience': '#06b6d4',
  'Mobile App': '#ec4899',
  'Other': '#6b7280',
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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 p-6 shadow-xl border border-gray-200 dark:border-gray-700">
      {/* Animated background gradient orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#E20074]/20 to-[#FF0066]/20 rounded-full blur-3xl"
      />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E20074] to-[#FF0066] flex items-center justify-center">
            <PieChart className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Category Distribution</h2>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Animated Pie Chart */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, type: "spring", bounce: 0.3 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#E20074]/10 to-[#FF0066]/10 blur-xl" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="relative w-48 h-48 rounded-full shadow-2xl border-4 border-white dark:border-gray-800"
              style={{ background: `conic-gradient(${gradient || '#ddd 0% 100%'})` }}
              aria-label="Category pie chart"
              role="img"
            />
            
            {/* Center circle with total */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white dark:bg-gray-900 shadow-lg flex flex-col items-center justify-center border-4 border-gray-100 dark:border-gray-800"
            >
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{total}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Total</span>
            </motion.div>
          </motion.div>
          
          {/* Legend */}
          <div className="flex-1 space-y-3">
            {entries.map(([k, v], index) => {
              const color = COLORS[k] || '#999';
              const pct = Math.round((v / total) * 100);
              
              return (
                <motion.div
                  key={k}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <motion.div
                      animate={{
                        boxShadow: [
                          `0 0 0px ${color}00`,
                          `0 0 15px ${color}80`,
                          `0 0 0px ${color}00`,
                        ],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.3
                      }}
                      className="w-4 h-4 rounded-full shadow-lg"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">{k}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{v}</span>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="px-2 py-1 rounded-lg text-xs font-bold text-white shadow-md"
                      style={{ backgroundColor: color }}
                    >
                      {pct}%
                    </motion.span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


