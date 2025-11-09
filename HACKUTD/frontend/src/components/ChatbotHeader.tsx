import React from 'react';

const ChatbotHeader: React.FC = () => {
  return (
    <header className="w-full flex items-center justify-center py-8 px-4" role="banner">
      <h1 className="text-center">
        <span 
          className="font-amsterdam text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-gray-800 dark:text-gray-200 leading-[1.2] tracking-tight"
          aria-label="Talk to"
        >
          Talk to{' '}
        </span>
        <span 
          className="font-avallon text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#E20074] leading-[1.2] tracking-tight"
          aria-label="Joy"
        >
          Joy
        </span>
      </h1>
    </header>
  );
};

export default ChatbotHeader;

