import React from 'react';
import Sidebar from '../components/Sidebar';
import ChatbotHeader from '../components/ChatbotHeader';

const Chatbot: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0B0B]">
      <Sidebar />
      <main className="min-h-screen transition-all duration-300 md:ml-[250px]">
        <ChatbotHeader />
        <div className="flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            <div className="bg-white dark:bg-[#121212] rounded-2xl shadow-md p-8 border border-gray-200 dark:border-gray-800">
              <p className="text-lg text-gray-600 dark:text-gray-400 text-center">
                This is where you will chat with Joy.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chatbot;

