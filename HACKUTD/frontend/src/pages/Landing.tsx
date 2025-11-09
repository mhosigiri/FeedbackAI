import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, MessageSquare, Bot, GitBranch, Send, CheckCircle, LogIn, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  // Feedback form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [emotion, setEmotion] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const menuItems = [
    { label: 'Login as Employee', path: '/login' },
  ];

  const categories = [
    'Network',
    'Billing',
    'Customer Service',
    'Technical Issue',
    'Other',
  ];

  const emotions = [
    { emoji: '😢', label: 'Very Negative', value: 'very_negative' },
    { emoji: '😞', label: 'Negative', value: 'negative' },
    { emoji: '😐', label: 'Neutral', value: 'neutral' },
    { emoji: '😊', label: 'Positive', value: 'positive' },
    { emoji: '😍', label: 'Very Positive', value: 'very_positive' },
  ];

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !phone || !category || !emotion || !feedback.trim()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const formData = {
        firstName,
        lastName,
        email,
        phone,
        category,
        emotion,
        feedback,
        timestamp: new Date().toISOString(),
      };

      console.log('Feedback submitted:', formData);

      setIsSubmitting(false);
      setShowSuccess(true);

      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setCategory('');
      setEmotion('');
      setFeedback('');

      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    }, 1000);
  };

  const isFormValid = firstName && lastName && email && phone && category && emotion && feedback.trim();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0B0B]">
      {/* Menu Button - Top Right */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <motion.button
          onClick={toggleDarkMode}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-xl bg-white dark:bg-[#121212] shadow-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <Sun className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          ) : (
            <Moon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          )}
        </motion.button>

        {/* Menu Button */}
        <motion.button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={isMenuOpen ? { rotate: 90 } : { rotate: 0 }}
          transition={{ duration: 0.2 }}
          className="p-3 rounded-xl bg-white dark:bg-[#121212] shadow-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          )}
        </motion.button>

        {/* Menu Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              />
              
              {/* Menu Panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-16 right-0 w-56 bg-white dark:bg-[#121212] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50"
              >
                <div className="py-2">
                  {menuItems.map((item, index) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Landing Page Content */}
      <div className="min-h-screen flex flex-col items-center px-4 py-8 md:px-8">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-[#E20074] to-[#FF0066] bg-clip-text text-transparent">
                Feedback AI
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Understand customer happiness. In real time.
            </p>
          </motion.div>

          {/* 2x2 Grid Layout */}
          <div className="grid grid-cols-2 grid-rows-2 gap-6 h-[600px]">
            {/* Top Left - Share Feedback Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                setShowFeedbackForm(!showFeedbackForm);
                // Scroll to form instantly after state update
                setTimeout(() => {
                  const formElement = document.getElementById('feedback-form');
                  if (formElement) {
                    formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }}
              className="bg-white dark:bg-[#121212] rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E20074] to-[#FF0066] flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">Share Feedback</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">Share your thoughts with us</p>
            </motion.div>

            {/* Top Right - AI Assistant */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/ai-assistant')}
              className="bg-white dark:bg-[#121212] rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E20074] to-[#FF0066] flex items-center justify-center mb-4">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">AI Assistant</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">Chat with our AI assistant</p>
            </motion.div>

            {/* Bottom Left - AI Workflow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/ai-workflow')}
              className="bg-white dark:bg-[#121212] rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E20074] to-[#FF0066] flex items-center justify-center mb-4">
                <GitBranch className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">AI Workflow</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">Automated workflow solutions</p>
            </motion.div>

            {/* Bottom Right - Employee Login */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/login')}
              className="bg-white dark:bg-[#121212] rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center cursor-pointer"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E20074] to-[#FF0066] flex items-center justify-center mb-4">
                <LogIn className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">Employee Login</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">Access employee dashboard</p>
            </motion.div>
          </div>

          {/* Feedback Form - Below Grid */}
          <AnimatePresence>
            {showFeedbackForm && (
              <motion.div
                id="feedback-form"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-2xl mx-auto mt-8"
              >
                <motion.div
                  className="bg-white dark:bg-[#121212] rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-800"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Share Your Feedback 💬
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    We value your voice — help us improve your T-Mobile experience.
                  </p>

                  {/* Success Message */}
                  <AnimatePresence>
                    {showSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3"
                      >
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Thank you! Your feedback has been submitted successfully.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                    {/* First Name and Last Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* First Name */}
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          First Name <span className="text-[#E20074]">*</span>
                        </label>
                        <input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-[#E20074] focus:outline-none transition-all bg-white dark:bg-[#0B0B0B] text-gray-900 dark:text-white"
                          placeholder="John"
                        />
                      </div>

                      {/* Last Name */}
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Last Name <span className="text-[#E20074]">*</span>
                        </label>
                        <input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-[#E20074] focus:outline-none transition-all bg-white dark:bg-[#0B0B0B] text-gray-900 dark:text-white"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address <span className="text-[#E20074]">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-[#E20074] focus:outline-none transition-all bg-white dark:bg-[#0B0B0B] text-gray-900 dark:text-white"
                        placeholder="john.doe@example.com"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number <span className="text-[#E20074]">*</span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-[#E20074] focus:outline-none transition-all bg-white dark:bg-[#0B0B0B] text-gray-900 dark:text-white"
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category <span className="text-[#E20074]">*</span>
                      </label>
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-[#E20074] focus:outline-none transition-all bg-white dark:bg-[#0B0B0B] text-gray-900 dark:text-white"
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat.toLowerCase().replace(' ', '_')}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Emotion / Feeling */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        How are you feeling? <span className="text-[#E20074]">*</span>
                      </label>
                      <div className="grid grid-cols-5 gap-3">
                        {emotions.map((emotionOption) => (
                          <motion.button
                            key={emotionOption.value}
                            type="button"
                            onClick={() => setEmotion(emotionOption.value)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                              flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                              ${
                                emotion === emotionOption.value
                                  ? 'border-[#E20074] bg-[#E20074]/10'
                                  : 'border-gray-300 dark:border-gray-700 hover:border-[#E20074]/50 bg-white dark:bg-[#0B0B0B]'
                              }
                            `}
                          >
                            <span className="text-2xl">{emotionOption.emoji}</span>
                            <span className={`text-xs font-medium text-center ${
                              emotion === emotionOption.value
                                ? 'text-[#E20074]'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {emotionOption.label}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Feedback Message */}
                    <div>
                      <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Feedback Message <span className="text-[#E20074]">*</span>
                      </label>
                      <textarea
                        id="feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        required
                        rows={5}
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-[#E20074] focus:outline-none transition-all resize-none bg-white dark:bg-[#0B0B0B] text-gray-900 dark:text-white"
                        placeholder="Share your thoughts with us..."
                      />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      whileHover={isFormValid && !isSubmitting ? { scale: 1.02 } : {}}
                      whileTap={isFormValid && !isSubmitting ? { scale: 0.98 } : {}}
                      className={`
                        w-full py-3 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2
                        ${
                          isFormValid && !isSubmitting
                            ? 'bg-[#E20074] hover:bg-[#c90065] shadow-lg'
                            : 'bg-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Send Feedback</span>
                        </>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Landing;
