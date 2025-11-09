import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CustomerHappinessIndex: React.FC = () => {
  const [score] = useState(72);

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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-[100px] shadow-lg p-6 transition-all border border-[#E20074]/20 dark:border-[#E20074]/20 h-full flex flex-col items-center"
      style={{
        backgroundColor: 'rgba(226, 0, 116, 0.15)'
      }}
    >
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center mt-4">
        Customer Happiness Index (CHI)
      </h2>
      
      <div className="flex flex-col items-center mt-2">
        <div className="flex items-center gap-3 mb-4">
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
            className="text-4xl md:text-5xl font-bold"
          >
            <span className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent">
              {score}
            </span>
            <span className="text-gray-400 text-2xl md:text-3xl font-normal">
              {' / 100'}
            </span>
          </motion.div>
          <motion.span
            key={score}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.3, 1],
              opacity: 1,
            }}
            transition={{ 
              duration: 0.6,
              ease: "easeOut",
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
            className="text-3xl md:text-4xl"
          >
            {emoji}
          </motion.span>
        </div>

        {/* Capsule-shaped gradient progress bar */}
        <div className="relative w-full max-w-xs h-8 bg-gray-700 dark:bg-gray-800 rounded-full overflow-hidden">
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
                  '0 0 15px rgba(34, 197, 94, 0.5)',
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
        </div>
      </div>
    </motion.div>
  );
};

export default CustomerHappinessIndex;

