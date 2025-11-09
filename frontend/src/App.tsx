import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import CustomerHappinessIndex from './components/CustomerHappinessIndex';
import EmployeeGreeting from './components/EmployeeGreeting';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AIAssistant from './pages/AIAssistant';
import AIWorkflow from './pages/AIWorkflow';
import Feed from './pages/Feed';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CreateTicket from './pages/CreateTicket';
import GeoMap from './components/GeoMap';
import InsightCharts from './components/InsightCharts';
import CategoryPie from './components/CategoryPie';
import FeedbackAnalyses from './components/FeedbackAnalyses';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect, useState } from 'react';
import { analyze } from './api';
import type { AnalyzeResponse } from './types';
import { useAuth } from './contexts/AuthContext';
import logoImage from './images/fai.png';

const App: React.FC = () => {
  const [chiKey, setChiKey] = useState(0);
  const location = useLocation();

  // Hide sidebar on login and signup pages
  const hideSidebar = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0B0B]">
      {!hideSidebar && <Sidebar />}
      <main className={`min-h-screen transition-all duration-300 ${!hideSidebar ? 'md:ml-[250px]' : ''}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/assistant" element={<AIAssistant />} />
          <Route
            path="/workflow"
            element={
              <ProtectedRoute>
                <AIWorkflow />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage chiKey={chiKey} onRefetchCHI={() => setChiKey((k) => k + 1)} />
            </ProtectedRoute>
          } />
          <Route path="/feed" element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          } />
          <Route path="/create-ticket" element={
            <ProtectedRoute>
              <CreateTicket />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;

function DashboardPage({ chiKey, onRefetchCHI }: { chiKey: number; onRefetchCHI: () => void }) {
  const { isEmployee } = useAuth();

  return (
    <section id="dashboard" className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto w-full space-y-8">
        {/* Dashboard Header with Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-6 mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800"
            style={{
              background: 'linear-gradient(135deg, rgba(226, 0, 116, 0.1) 0%, rgba(255, 0, 102, 0.05) 100%)'
            }}
          >
            <img 
              src={logoImage} 
              alt="FeedbackAI Logo" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-to-r from-[#E20074] to-[#FF0066] bg-clip-text text-transparent">
                FeedbackAI Dashboard
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
              {isEmployee ? 'Employee Analytics & Management' : 'Customer Insights & Analytics'}
            </p>
          </div>
        </motion.div>

        {/* Employee Greeting - Only for employees */}
        {isEmployee && <EmployeeGreeting />}
        
        <div className="grid grid-cols-1 gap-8">
          {/* Customer Happiness Index */}
          <div className="rounded-[32px] bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-gradient-to-b from-[#E20074] to-[#FF4D8C] rounded-full"></span>
              Customer Happiness Index
            </h2>
            <CustomerHappinessIndex key={chiKey} />
          </div>
          
          {/* Analytics & Insights */}
          <div className="rounded-[32px] bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8 shadow-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-gradient-to-b from-[#FF0066] to-[#FFB800] rounded-full"></span>
              Analytics & Insights
            </h2>
            <DashboardInsights onRefetchCHI={onRefetchCHI} />
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardInsights({ onRefetchCHI }: { onRefetchCHI?: () => void }) {
  const { isEmployee, user } = useAuth();
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('T-Mobile network');
  const [limit, setLimit] = useState(15);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState(0);
  const timerRef = React.useRef<number | null>(null);
  const startRef = React.useRef<number>(0);
  const estimateRef = React.useRef<number>(0);
  const categories = [
    'Network Coverage',
    'Customer Service',
    'Billing',
    'Pricing & Plans',
    'Device and Equipment',
    'Store Experience',
    'Mobile App',
    'Other',
  ];
  const [selected, setSelected] = useState<Record<string, boolean>>(
    Object.fromEntries(categories.map(c => [c, true]))
  );
  useEffect(() => {
    (async () => {
      try {
        setError('');
        const res = await analyze({ query, limit });
        setData(res as AnalyzeResponse);
      } catch (e: any) {
        setError(e?.message || 'Failed to load insights');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // initial load
  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError('');
      // Start progress with an ETA based on limit (bounded 2–12s)
      const estimatedSec = Math.max(2, Math.min(12, 1.5 + limit * 0.25));
      estimateRef.current = estimatedSec;
      startRef.current = Date.now();
      setEta(estimatedSec);
      setProgress(0);
      setLoading(true);
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startRef.current) / 1000;
        const pct = Math.min(99, Math.round((elapsed / estimateRef.current) * 100));
        setProgress(pct);
        setEta(Math.max(0, Math.ceil(estimateRef.current - elapsed)));
      }, 150) as unknown as number;

      const res = await analyze({ query, limit });
      setData(res as AnalyzeResponse);
      // Finish progress
      if (timerRef.current) window.clearInterval(timerRef.current);
      setProgress(100);
      setEta(0);
      window.setTimeout(() => setLoading(false), 400);
    } catch (e: any) {
      setError(e?.message || 'Failed to load insights');
      if (timerRef.current) window.clearInterval(timerRef.current);
      setLoading(false);
    }
  }
  const filteredSentiments = (data?.sentiments || []).filter((s: any) => selected[s.category]);
  const filteredCounts = filteredSentiments.reduce<Record<string, number>>((acc, s: any) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {});
  return (
    <>
      {/* Search Query Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#E20074] via-[#FF0066] to-[#FF4D8C] p-8 shadow-2xl"
      >
        {/* Animated background orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl"
        />
        
        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-2xl">🔍</span>
            </div>
            Search & Analyze
          </h3>
          
          <form onSubmit={runSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white/90 mb-2">Search Query</label>
                <input 
                  className="w-full rounded-2xl px-4 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-2 border-white/30 text-gray-900 dark:text-white placeholder-gray-400 focus:border-white focus:ring-2 focus:ring-white/50 transition-all outline-none shadow-lg"
                  value={query} 
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Enter search terms..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">Result Limit</label>
                <input 
                  type="number" 
                  min={3} 
                  max={50} 
                  className="w-full rounded-2xl px-4 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-2 border-white/30 text-gray-900 dark:text-white focus:border-white focus:ring-2 focus:ring-white/50 transition-all outline-none shadow-lg"
                  value={limit} 
                  onChange={e => setLimit(parseInt(e.target.value || '15', 10))} 
                />
              </div>
            </div>
            
            <motion.button 
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-white text-[#E20074] rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#E20074] border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Run Analysis</span>
                </>
              )}
            </motion.button>
            
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-white bg-red-500/30 backdrop-blur-sm rounded-2xl p-3 border border-white/30"
              >
                ⚠️ {error}
              </motion.p>
            )}
          </form>
          
          {/* Progress Bar */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6"
            >
              <div className="relative h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-white rounded-full shadow-lg"
                />
              </div>
              <p className="text-sm text-white/90 mt-2 font-medium">
                {eta > 0 ? `⏱️ ~${eta}s remaining` : '✨ Finalizing results...'}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Category Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 rounded-[32px] bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 shadow-xl border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>🎯</span>
          Category Filters
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((c, index) => (
            <motion.label
              key={c}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                selected[c]
                  ? 'bg-[#E20074]/10 border-2 border-[#E20074] shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <input 
                type="checkbox" 
                checked={!!selected[c]} 
                onChange={() => setSelected({ ...selected, [c]: !selected[c] })}
                className="w-5 h-5 rounded-lg accent-[#E20074] cursor-pointer"
              />
              <span className={`text-sm font-medium ${selected[c] ? 'text-[#E20074] dark:text-[#FF0066]' : 'text-gray-700 dark:text-gray-300'}`}>
                {c}
              </span>
            </motion.label>
          ))}
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Geospatial Map */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E20074] to-[#FF0066] flex items-center justify-center">
              <span className="text-xl">🗺️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Geospatial Map</h2>
          </div>
          <GeoMap sentiments={filteredSentiments as any} />
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <InsightCharts issueCounts={Object.keys(filteredCounts).length ? filteredCounts : (data?.issue_counts || {})} />
        </motion.div>
      </div>

      {/* Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <CategoryPie issueCounts={Object.keys(filteredCounts).length ? filteredCounts : (data?.issue_counts || {})} />
      </motion.div>

      {/* Feedback Analyses - Employee only */}
      {isEmployee && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-[32px] bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8 shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <FeedbackAnalyses employeeName={user?.displayName || undefined} />
        </motion.div>
      )}
    </>
  );
}

