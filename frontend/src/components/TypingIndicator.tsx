import React from 'react';
import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  avatar?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ avatar }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-start gap-3 mb-4"
    >
      {avatar && (
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#E20074]">
          <img 
            src={avatar} 
            alt="Joy" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1">
          <motion.div
            className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;

