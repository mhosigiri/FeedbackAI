import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import CustomerHappinessIndex from './components/CustomerHappinessIndex';
import { Search, X, Bell } from 'lucide-react';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle click outside to collapse search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        if (isSearchExpanded && !searchQuery) {
          setIsSearchExpanded(false);
        }
      }
    };

    if (isSearchExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus input when expanded
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchExpanded, searchQuery]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0B0B]">
      <Sidebar />
      <main className="min-h-screen transition-all duration-300 md:ml-[250px]">
        {/* Dashboard Section */}
        <section id="dashboard" className="min-h-screen p-8">
          <div className="max-w-4xl w-full">
            <div className="flex items-center justify-between mb-4 gap-4">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <div className="flex items-center justify-end gap-3">
                <div ref={searchRef} className="relative">
                  {!isSearchExpanded ? (
                    <button
                      onClick={() => setIsSearchExpanded(true)}
                      className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0B0B0B] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                      <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </button>
                  ) : (
                    <motion.div
                      initial={{ width: 40 }}
                      animate={{ width: 320 }}
                      exit={{ width: 40 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="relative"
                    >
                      <div className="relative flex items-center">
                        <Search className="absolute left-3 w-5 h-5 text-gray-400 dark:text-gray-500 z-10" />
                        <input
                          ref={inputRef}
                          type="text"
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0B0B0B] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E20074] focus:border-transparent transition-all"
                        />
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setIsSearchExpanded(false);
                          }}
                          className="absolute right-3 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
                <button
                  className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0B0B0B] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all relative"
                >
                  <Bell className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  {/* Optional notification badge */}
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E20074] rounded-full"></span>
                </button>
              </div>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Welcome to your T-Mobile Feedback AI Dashboard. Monitor customer feedback and insights in real-time.
            </p>
            
            {/* Dashboard Grid - 4 Equal Parts */}
            <div className="grid grid-cols-2 grid-rows-2 gap-6 h-[600px]">
              {/* Top Left - Live Map */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-white dark:bg-[#0B0B0B] rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-800 flex flex-col cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Live Map</h3>
                  <button className="px-4 py-2 bg-[#E20074] text-white rounded-lg text-sm font-medium hover:bg-[#C20064] transition-colors">
                    View Map
                  </button>
                </div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Map visualization will appear here</p>
                </div>
              </motion.div>
              
              {/* Top Right */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-white dark:bg-[#0B0B0B] rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-800 cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Top Right</h3>
              </motion.div>
              
              {/* Bottom Left - Customer Happiness Index */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-transparent cursor-pointer"
              >
                <CustomerHappinessIndex />
              </motion.div>
              
              {/* Bottom Right */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-white dark:bg-[#0B0B0B] rounded-2xl shadow-md p-6 border border-gray-200 dark:border-gray-800 cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Bottom Right</h3>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Insights Section */}
        <section id="insights" className="min-h-screen flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl w-full">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Insights
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Analyze customer feedback patterns, sentiment trends, and key metrics to make data-driven decisions.
            </p>
          </div>
        </section>

        {/* Settings Section */}
        <section id="settings" className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-4xl w-full">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Settings
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Configure your preferences, notification settings, and account details.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;

