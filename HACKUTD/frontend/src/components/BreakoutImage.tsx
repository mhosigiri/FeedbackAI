import React from 'react';
import { motion } from 'framer-motion';
import breakoutImage from '../images/2.png';

interface BreakoutImageProps {
  title?: string;
  description?: string;
  className?: string;
}

const BreakoutImage: React.FC<BreakoutImageProps> = ({ 
  title = "Breakout Image",
  description = "This image breaks out of its container for a dynamic visual effect.",
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative bg-white dark:bg-[#0B0B0B] rounded-2xl shadow-md p-6 overflow-visible ${className}`}
    >
      {/* Content inside container */}
      <div className="relative z-10">
        {title && (
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>

      {/* Breakout Image */}
      <motion.img
        src={breakoutImage}
        alt="Breakout image"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        whileHover={{ scale: 1.05 }}
        className="absolute bottom-[-20px] right-[-20px] w-32 h-auto object-contain shadow-lg rounded-lg md:w-40 lg:w-48 md:bottom-[-30px] md:right-[-30px] sm:bottom-[-15px] sm:right-[-15px] sm:w-24"
      />
    </motion.div>
  );
};

export default BreakoutImage;

