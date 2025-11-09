import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  'Network Coverage': 'from-blue-500 to-blue-600',
  'Customer Service': 'from-green-500 to-green-600',
  'Billing': 'from-purple-500 to-purple-600',
  'Pricing & Plans': 'from-yellow-500 to-yellow-600',
  'Device and Equipment': 'from-red-500 to-red-600',
  'Store Experience': 'from-cyan-500 to-cyan-600',
  'Mobile App': 'from-pink-500 to-pink-600',
  'Other': 'from-gray-500 to-gray-600',
};

export default function InsightCharts({ issueCounts }: { issueCounts: Record<string, number> }) {
  const entries = Object.entries(issueCounts || {});
  const max = Math.max(1, ...entries.map(([, v]) => v));
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E20074] to-[#FF0066] flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Insights by Category</h2>
      </div>
      
      <div className="space-y-4">
        {entries.map(([k, v], index) => {
          const percentage = (v / max) * 100;
          const gradientClass = CATEGORY_COLORS[k] || 'from-gray-500 to-gray-600';
          
          return (
            <motion.div
              key={k}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 p-4 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              {/* Background gradient orb */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.1, 0.15, 0.1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.2
                }}
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradientClass} rounded-full blur-3xl`}
              />
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${gradientClass} shadow-lg`} />
                    <span className="font-semibold text-gray-900 dark:text-white">{k}</span>
                  </div>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                    className="text-2xl font-bold text-gray-900 dark:text-white"
                  >
                    {v}
                  </motion.span>
                </div>
                
                <div className="relative w-full h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 1, ease: "easeOut" }}
                    className={`h-full bg-gradient-to-r ${gradientClass} rounded-full shadow-lg`}
                  >
                    <motion.div
                      animate={{
                        boxShadow: [
                          '0 0 0px rgba(226, 0, 116, 0)',
                          '0 0 20px rgba(226, 0, 116, 0.5)',
                          '0 0 0px rgba(226, 0, 116, 0)',
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.3
                      }}
                      className="w-full h-full rounded-full"
                    />
                  </motion.div>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {Math.round(percentage)}% of total
                  </span>
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.2
                    }}
                    className={`px-2 py-1 rounded-lg bg-gradient-to-r ${gradientClass} text-white text-xs font-bold shadow-md`}
                  >
                    Active
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}


