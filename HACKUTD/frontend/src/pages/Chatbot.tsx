import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import ChatbotHeader from '../components/ChatbotHeader';
import ChatMessage from '../components/ChatMessage';
import TypingIndicator from '../components/TypingIndicator';
import { Send } from 'lucide-react';
import dashboardImage from '../images/2.png';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const formatTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: formatTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response after delay
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for your message! I'm here to help you with any questions about T-Mobile services, feedback, or support. How can I assist you today?",
        isUser: false,
        timestamp: formatTime(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0B0B]">
      <Sidebar />
      <main className="min-h-screen transition-all duration-300 md:ml-[250px] flex flex-col">
        <ChatbotHeader />
        
        {/* Top Section - Joy Mascot */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center py-8 px-4"
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-[#E20074] shadow-lg mb-6">
              <img 
                src={dashboardImage} 
                alt="Joy" 
                className="w-full h-full object-cover"
              />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-medium"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              What can I help you with?
            </motion.p>
          </motion.div>
        )}

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          <div className="max-w-3xl mx-auto py-6">
            <AnimatePresence>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.text}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                  avatar={!message.isUser ? dashboardImage : undefined}
                />
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <TypingIndicator avatar={dashboardImage} />
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Section - Fixed at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 md:left-[250px] bg-white dark:bg-[#0B0B0B] border-t border-gray-200 dark:border-gray-800 shadow-lg pb-safe">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message…"
                  aria-label="Type your message"
                  disabled={isTyping}
                  className="w-full px-4 py-3 pr-12 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#121212] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E20074] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Arial, sans-serif' }}
                />
              </div>
              <motion.button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-full bg-[#E20074] text-white hover:bg-[#C20064] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#E20074] shadow-md"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chatbot;

