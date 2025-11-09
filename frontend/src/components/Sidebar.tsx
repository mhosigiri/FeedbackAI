import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  User,
  Edit2,
  Sun,
  Moon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {}

const Sidebar: React.FC<SidebarProps> = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('/dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage or system preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  useEffect(() => {
    setActiveSection(window.location.pathname || '/dashboard');
    const pop = () => setActiveSection(window.location.pathname || '/dashboard');
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const goTo = (path: string) => {
    navigate(path);
    setActiveSection(path);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const navItems = [
    { id: '/dashboard', label: 'Dashboard', icon: Home },
    { id: '/feed', label: 'Feed', icon: BarChart3 },
    { id: '/assistant', label: 'AI Assistant', icon: User },
    ...(isLoggedIn ? [{ id: '/workflow', label: 'AI Workflow', icon: Edit2 }] : []),
    { id: '/settings', label: 'Settings', icon: Settings },
  ];

  const sidebarVariants = {
    expanded: { width: '250px' },
    collapsed: { width: '80px' },
  };

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 },
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-white dark:bg-[#0B0B0B] border-r border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                key="logo"
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                variants={contentVariants}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E20074] to-[#FF0066] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                    T-Mobile
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Feedback AI
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {isCollapsed && !isMobile && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E20074] to-[#FF0066] flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">T</span>
            </div>
          )}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isCollapsed ? (
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* User Profile */}
      {isLoggedIn && (
        <div className="px-4 py-6 border-b border-gray-200 dark:border-gray-800">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
              <motion.div
                key="profile-expanded"
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                variants={contentVariants}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E20074] to-[#FF0066] flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="flex flex-col items-center min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white text-center">
                    {user?.displayName || user?.email || 'Employee'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Employee
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="profile-collapsed"
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                variants={contentVariants}
                className="flex justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E20074] to-[#FF0066] flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <motion.button
                  onClick={() => goTo(item.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-[#E20074] text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        variants={contentVariants}
                        className="text-sm font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Dark Mode Toggle */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="toggle-expanded"
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              variants={contentVariants}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                {isDarkMode ? (
                  <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isDarkMode ? 'Dark' : 'Light'}
                </span>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`
                  relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#E20074] focus:ring-offset-2
                  ${isDarkMode ? 'bg-[#E20074]' : 'bg-gray-300 dark:bg-gray-600'}
                `}
              >
                <motion.div
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                  animate={{
                    x: isDarkMode ? 24 : 0,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="toggle-collapsed"
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              variants={contentVariants}
              className="flex justify-center"
            >
              <button
                onClick={toggleDarkMode}
                className={`
                  relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#E20074] focus:ring-offset-2
                  ${isDarkMode ? 'bg-[#E20074]' : 'bg-gray-300 dark:bg-gray-600'}
                `}
              >
                <motion.div
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                  animate={{
                    x: isDarkMode ? 24 : 0,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-[#0B0B0B] shadow-md border border-gray-200 dark:border-gray-800"
        >
          <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={toggleSidebar}
                className="fixed inset-0 bg-black/50 z-40"
              />
              <motion.div
                initial={{ x: -250 }}
                animate={{ x: 0 }}
                exit={{ x: -250 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 h-screen w-[250px] z-50"
              >
                <div className="h-full flex flex-col bg-white dark:bg-[#0B0B0B] border-r border-gray-200 dark:border-gray-800">
                  {/* Mobile Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E20074] to-[#FF0066] flex items-center justify-center">
                        <span className="text-white font-bold text-sm">T</span>
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                          T-Mobile
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Feedback AI
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={toggleSidebar}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>

                  {/* Mobile User Profile */}
                  <div className="px-4 py-6 border-b border-gray-200 dark:border-gray-800">
                    {isLoggedIn && (
                      <div className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E20074] to-[#FF0066] flex items-center justify-center flex-shrink-0">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex flex-col items-center min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white text-center">
                            {user?.displayName || user?.email || 'Employee'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            Employee
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex-1 py-4 px-2">
                    <ul className="space-y-1">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;
                        
                        return (
                          <li key={item.id}>
                            <button
                              onClick={() => goTo(item.id)}
                              className={`
                                w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl
                                transition-all duration-200
                                ${
                                  isActive
                                    ? 'bg-[#E20074] text-white shadow-md'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }
                              `}
                            >
                              <Icon className="w-5 h-5 flex-shrink-0" />
                              <span className="text-sm font-medium">{item.label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>

                  {/* Mobile Dark Mode Toggle */}
                  <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {isDarkMode ? (
                          <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        ) : (
                          <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        )}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {isDarkMode ? 'Dark' : 'Light'}
                        </span>
                      </div>
                      <button
                        onClick={toggleDarkMode}
                        className={`
                          relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#E20074] focus:ring-offset-2
                          ${isDarkMode ? 'bg-[#E20074]' : 'bg-gray-300 dark:bg-gray-600'}
                        `}
                      >
                        <motion.div
                          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                          animate={{
                            x: isDarkMode ? 24 : 0,
                          }}
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <motion.aside
      initial={false}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed left-0 top-0 h-screen z-30"
    >
      <SidebarContent />
    </motion.aside>
  );
};

export default Sidebar;

