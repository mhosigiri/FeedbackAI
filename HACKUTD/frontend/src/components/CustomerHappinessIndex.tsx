import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CustomerHappinessIndex: React.FC = () => {
  const [score, setScore] = useState(72);

  // Simulate score updates (optional - can be removed if score comes from props/API)
  useEffect(() => {
    // This is just for demonstration - in production, score would come from API
    // Uncomment below to simulate score changes every 5 seconds
    // const interval = setInterval(() => {
    //   setScore(prev => Math.min(100, Math.max(0, prev + Math.floor(Math.random() * 10 - 5))));
    // }, 5000);
    // return () => clearInterval(interval);
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
      className="bg-white dark:bg-[#0B0B0B] rounded-2xl shadow-md p-6 mb-6 transition-all border border-gray-200 dark:border-gray-800"
    >
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Customer Happiness Index (CHI)
      </h2>
      
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
          className="text-5xl md:text-6xl font-bold mb-2"
        >
          <span className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent">
            {score}
          </span>
          <span className="text-gray-400 dark:text-gray-500 text-3xl md:text-4xl font-normal">
            {' / 100'}
          </span>
        </motion.div>
      </div>

      {/* Gradient Progress Bar */}
      <div className="relative w-full h-6 bg-gray-200 dark:bg-gray-800 rounded-full overflow-visible mt-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${scorePercentage}%` }}
          transition={{ 
            duration: 1,
            ease: "easeOut"
          }}
          className="absolute top-0 left-0 h-full rounded-full"
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
                '0 0 20px rgba(34, 197, 94, 0.5)',
                '0 0 0px rgba(34, 197, 94, 0)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-full h-full"
          />
        </motion.div>
        
        {/* Live Emoji Indicator */}
        <motion.div
          key={score}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            left: `${scorePercentage}%`,
            scale: [0, 1.3, 1],
            opacity: 1,
            y: [-10, 0]
          }}
          transition={{ 
            duration: 0.6,
            ease: "easeOut",
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
          className="absolute top-[-20px] text-2xl md:text-3xl pointer-events-none"
          style={{
            transform: 'translateX(0%)',
          }}
        >
          <motion.span
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 0.5,
              delay: 0.3,
              ease: "easeInOut"
            }}
          >
            {emoji}
          </motion.span>
        </motion.div>
      </div>

      {/* Score Indicator Labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
        <span>Poor (0-40)</span>
        <span>Fair (41-70)</span>
        <span>Good (71-85)</span>
        <span>Excellent (86-100)</span>
      </div>
    </motion.div>
  );
};

export default CustomerHappinessIndex;

