import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
  avatar?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser, timestamp, avatar }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {!isUser && avatar && (
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#E20074]">
          <img 
            src={avatar} 
            alt="Joy" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
        <div
          className={`
            px-4 py-3 rounded-2xl
            ${isUser 
              ? 'bg-[#E20074] text-white rounded-br-sm' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'
            }
            shadow-sm
          `}
        >
          <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">
            {message}
          </p>
        </div>
        {timestamp && (
          <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-2">
            {timestamp}
          </span>
        )}
      </div>
      {isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E20074] to-[#FF0066] flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;

