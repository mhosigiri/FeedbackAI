import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { analyze } from '../api';
import type { AnalyzeResponse } from '../types';

const CustomerHappinessIndex: React.FC = () => {
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setError('');
      try {
        const data = (await analyze({ query: 'T-Mobile network', limit: 9 })) as AnalyzeResponse;
        if (!mounted) return;
        setScore(Math.round(data.csi_score ?? 0));
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load CHI');
        setScore(0);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, []);

  const scorePercentage = Math.min(100, Math.max(0, score));

  // Determine emoji based on score
  const getEmoji = (scoreValue: number): string => {
    if (scoreValue >= 0 && scoreValue <= 39) return '😞';
    if (scoreValue >= 40 && scoreValue <= 69) return '😐';
    return '😄';
  };

  const emoji = getEmoji(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden"
    >
      {/* Animated background gradient orbs */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-0 right-0 w-64 h-64 bg-[#E20074]/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-0 left-0 w-72 h-72 bg-[#FF0066]/20 rounded-full blur-3xl"
      />
      
      <div className="relative z-10">
        {loading && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium"
          >
            Loading live score…
          </motion.p>
        )}
        {error && (
          <motion.p 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm text-red-600 dark:text-red-400 mb-4 font-medium"
          >
            Error: {error}
          </motion.p>
        )}
      
        <div className="flex flex-col items-center mb-6">
          <motion.div
            key={score}
            initial={{ scale: 1 }}
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              duration: 0.6,
              ease: "easeInOut"
            }}
            className="text-6xl md:text-7xl font-bold mb-2"
          >
            <span className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent drop-shadow-lg">
              {score}
            </span>
            <span className="text-gray-400 dark:text-gray-500 text-4xl md:text-5xl font-normal">
              {' / 100'}
            </span>
          </motion.div>
        </div>

        {/* Gradient Progress Bar */}
        <div className="relative w-full h-8 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-full overflow-visible mt-4 shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${scorePercentage}%` }}
            transition={{ 
              duration: 1.2,
              ease: "easeOut"
            }}
            className="absolute top-0 left-0 h-full rounded-full shadow-lg"
            style={{
              background: `linear-gradient(to right, 
                #ef4444 0%, 
                #f97316 25%, 
                #eab308 50%, 
                #84cc16 75%, 
                #22c55e 100%)`
            }}
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0px rgba(34, 197, 94, 0)',
                  '0 0 25px rgba(34, 197, 94, 0.6)',
                  '0 0 0px rgba(34, 197, 94, 0)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-full h-full rounded-full"
            />
          </motion.div>
          
          {/* Live Emoji Indicator */}
          <motion.div
            key={score}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              left: `${scorePercentage}%`,
              scale: [0, 1.4, 1.1],
              opacity: 1,
              y: [-12, -8]
            }}
            transition={{ 
              duration: 0.7,
              ease: "easeOut",
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
            className="absolute top-[-28px] text-3xl md:text-4xl pointer-events-none"
            style={{
              transform: 'translateX(-50%)',
            }}
          >
            <motion.span
              animate={{
                scale: [1, 1.15, 1],
              }}
              transition={{
                duration: 0.6,
                delay: 0.4,
                ease: "easeInOut"
              }}
              className="drop-shadow-lg"
            >
              {emoji}
            </motion.span>
          </motion.div>
        </div>

        {/* Score Indicator Labels */}
        <div className="grid grid-cols-4 gap-2 mt-4 text-xs text-gray-600 dark:text-gray-400 font-medium">
          <div className="text-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mx-auto mb-1"></div>
            <span>Poor (0-40)</span>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mx-auto mb-1"></div>
            <span>Fair (41-70)</span>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 rounded-full bg-lime-500 mx-auto mb-1"></div>
            <span>Good (71-85)</span>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mx-auto mb-1"></div>
            <span>Excellent (86+)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CustomerHappinessIndex;

