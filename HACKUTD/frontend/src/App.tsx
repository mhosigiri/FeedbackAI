import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import CustomerHappinessIndex from './components/CustomerHappinessIndex';
import AlreadyWorkingOn from './components/AlreadyWorkingOn';
import ProtectedRoute from './components/ProtectedRoute';
import Chatbot from './pages/Chatbot';
import AIAssistant from './pages/AIAssistant';
import AIWorkflow from './pages/AIWorkflow';
import Community from './pages/Community';
import Landing from './pages/Landing';
import Login from './pages/Login';
import { Search, X, Bell } from 'lucide-react';
import dashboardImage from './images/2.png';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false); // Start as false so red dot shows initially
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

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

  // Handle click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  // Dummy notification data
  const notifications = [
    { id: 1, title: 'New Feedback Received', message: 'Customer submitted feedback about network coverage', time: '5 min ago' },
    { id: 2, title: 'System Update', message: 'Dashboard metrics have been updated', time: '1 hour ago' },
    { id: 3, title: 'Alert', message: 'High priority issue reported in downtown area', time: '2 hours ago' },
  ];

  // Track the last notification count to detect new notifications
  const [lastNotificationCount, setLastNotificationCount] = useState(3);

  // Reset notificationsRead when new notifications arrive
  useEffect(() => {
    // If notification count increases, it means there are new notifications
    if (notifications.length > lastNotificationCount) {
      setNotificationsRead(false); // Show red dot for new notifications
      setLastNotificationCount(notifications.length);
    }
  }, [notifications.length, lastNotificationCount]);

  // Handle notification dropdown open/close
  const handleNotificationToggle = () => {
    const newState = !isNotificationOpen;
    setIsNotificationOpen(newState);
    if (newState && notifications.length > 0) {
      // Mark notifications as read when dropdown is opened
      setNotificationsRead(true);
    }
  };

  // Check if there are new notifications (for future use when notifications update)
  const hasNewNotifications = notifications.length > 0 && !notificationsRead;

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
                <div ref={notificationRef} className="relative">
                  <motion.button
                    onClick={handleNotificationToggle}
                    whileTap={{ scale: 0.9 }}
                    animate={isNotificationOpen ? { rotate: [0, -10, 10, -10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0B0B0B] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all relative"
                  >
                    <Bell className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    {/* Notification badge - only show if there are new notifications */}
                    {hasNewNotifications && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E20074] rounded-full"
                      />
                    )}
                  </motion.button>
                  
                  {/* Notification Dropdown */}
                  {isNotificationOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#121212] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white" style={{ fontFamily: 'Arial, sans-serif' }}>
                          Notifications
                        </h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                              className="p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                            >
                              <div className="flex flex-col gap-1">
                                <h4 className="font-medium text-gray-900 dark:text-white text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>
                                  {notification.title}
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Arial, sans-serif' }}>
                                  {notification.message}
                                </p>
                                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1" style={{ fontFamily: 'Arial, sans-serif' }}>
                                  {notification.time}
                                </span>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400" style={{ fontFamily: 'Arial, sans-serif' }}>
                            No notifications
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Welcome to your T-Mobile Feedback AI Dashboard. Monitor customer feedback and insights in real-time.
            </p>
            
            {/* Dashboard Grid - 4 Equal Parts */}
            <div className="grid grid-cols-2 grid-rows-2 gap-6 h-[600px]">
              {/* Top Left - Customer Happiness Index */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-transparent cursor-pointer relative z-20"
              >
                <CustomerHappinessIndex />
              </motion.div>
              
              {/* Top Right - Chatbot Icon with Image */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="rounded-2xl p-6 border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center relative overflow-hidden z-0 shadow-lg" 
                style={{ backgroundColor: '#E20074' }}
              >
                <div 
                  className="absolute top-2 right-[25%] z-30 cursor-pointer pointer-events-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    navigate('/chatbot');
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <h2 className="text-right text-white">
                    <div className="font-avallon text-[2.475rem] md:text-[3.3rem] lg:text-[4.125rem] italic hover:opacity-80 transition-opacity">
                      Talk
                    </div>
                    <div className="font-avallon text-[2.475rem] md:text-[3.3rem] lg:text-[4.125rem] italic hover:opacity-80 transition-opacity">
                      To
                    </div>
                    <div className="font-avallon text-[2.475rem] md:text-[3.3rem] lg:text-[4.125rem] font-bold hover:opacity-80 transition-opacity">
                      JOY!
                    </div>
                  </h2>
                </div>
                <img 
                  src={dashboardImage} 
                  alt="Dashboard" 
                  className="absolute bottom-0 left-[-20%] w-[381px] h-auto object-contain rounded-lg z-0 md:w-[475px] lg:w-[570px]"
                />
              </motion.div>
              
              {/* Bottom Left - Live Map */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-white dark:bg-[#0B0B0B] rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800 flex flex-col cursor-pointer"
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
              
              {/* Bottom Right - Already Working On */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="cursor-pointer"
              >
                <AlreadyWorkingOn />
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

        {/* Community Section */}
        <section id="community" className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-4xl w-full">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Community
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Connect with other users, share feedback, and participate in community discussions.
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

const App: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chatbot" 
          element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          } 
        />
            <Route 
              path="/ai-assistant" 
              element={<AIAssistant />} 
            />
            <Route 
              path="/ai-workflow" 
              element={<AIWorkflow />} 
            />
            <Route 
              path="/community" 
              element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              } 
            />
      </Routes>
    </AnimatePresence>
  );
};

export default App;

