import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChatbotIcon: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/chatbot');
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="rounded-full p-3 shadow-md bg-white dark:bg-[#0B0B0B] border border-gray-200 dark:border-gray-700 hover:bg-[#E20074] hover:border-[#E20074] transition-all group"
    >
      <MessageCircle className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors" />
    </motion.button>
  );
};

export default ChatbotIcon;

