import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, MessageCircle, ExternalLink, Clock, User, Tag, Lightbulb, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { analyze } from '../api';
import type { AnalyzeResponse, SentimentResult } from '../types';

export default function Feed() {
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [query, setQuery] = useState('T-Mobile network');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const subreddits = useMemo<string[]>(() => [], []);
  const keywords = useMemo(
    () => Array.from(new Set((query || '').toLowerCase().split(/\s+/).filter(Boolean))),
    [query]
  );

  useEffect(() => {
    let timerId: number | undefined;
    (async () => {
      try {
        setError('');
        setLoading(true);
        setProgress(1);
        const tickStart = Date.now();
        timerId = window.setInterval(() => {
          setProgress((p) => (p < 95 ? Math.min(95, p + Math.max(1, Math.round((Date.now() - tickStart) / 800))) : p));
        }, 400);
        const res = await analyze({ query, limit: 6, subreddits, keywords });
        setData(res as AnalyzeResponse);
        setProgress(100);
      } catch (e: any) {
        setError(e?.message || 'Failed to load feed');
        setProgress(0);
      } finally {
        if (typeof timerId === 'number') {
          window.clearInterval(timerId);
        }
        setLoading(false);
      }
    })();
    return () => {
      if (typeof timerId === 'number') {
        window.clearInterval(timerId);
      }
    };
  }, [query, keywords, subreddits]);

  const sentiments = (data?.sentiments || []);
  const uniqueById = Array.from(new Map(sentiments.map((s: SentimentResult) => [s.post.id, s])).values());
  const items = uniqueById.filter((s: SentimentResult) => s.post.source === 'reddit').slice(0, 6);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = (search || '').trim();
    if (!input) return;
    setQuery(`T-Mobile ${input}`);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'from-green-500 to-emerald-600';
      case 'negative': return 'from-red-500 to-rose-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return { text: 'Positive', emoji: '😊', bg: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' };
      case 'negative': return { text: 'Negative', emoji: '😞', bg: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' };
      default: return { text: 'Neutral', emoji: '😐', bg: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0B0B0B] dark:via-gray-900 dark:to-[#0B0B0B]">
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#E20074] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          
          <div className="flex items-center gap-4">
            <motion.div
              animate={{
                rotate: [0, 5, -5, 5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
              className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#E20074] to-[#FF0066] flex items-center justify-center shadow-xl"
            >
              <TrendingUp className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                Reddit Feed
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                Real-time T-Mobile discussions and sentiment
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#E20074] via-[#FF0066] to-[#FF4D8C] p-8 shadow-2xl"
        >
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
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Search Reddit</h2>
            </div>
            
            <form onSubmit={onSubmit} className="flex flex-col md:flex-row gap-4">
              <input
                className="flex-1 rounded-2xl px-4 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-2 border-white/30 text-gray-900 dark:text-white placeholder-gray-400 focus:border-white focus:ring-2 focus:ring-white/50 transition-all outline-none shadow-lg"
                placeholder="Search for T-Mobile topics (e.g., 'wifi calling not working')"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <motion.button 
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white text-[#E20074] rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
              </motion.button>
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
                  Fetching from Reddit... {progress}%
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Stats Card */}
        {!loading && data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 rounded-3xl bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 shadow-xl border border-gray-200 dark:border-gray-700"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{items.length}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Posts Found</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{Math.round(data.csi_score)}</p>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">CSI Score</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {items.filter(s => s.sentiment === 'positive').length}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Positive</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {data.timings?.reddit_ms ? (data.timings.reddit_ms / 1000).toFixed(1) : '0'}s
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Fetch Time</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-6 border border-red-200 dark:border-red-800"
          >
            <p className="text-red-700 dark:text-red-300 font-medium">⚠️ {error}</p>
          </motion.div>
        )}

        {/* Feed Items */}
        <div className="space-y-6">
          <AnimatePresence>
            {items.map((s, index) => {
              const sentimentBadge = getSentimentBadge(s.sentiment);
              const gradientClass = getSentimentColor(s.sentiment);
              
              return (
                <motion.div
                  key={s.post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-xl border border-gray-200 dark:border-gray-700"
                >
                  {/* Gradient accent bar */}
                  <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${gradientClass}`} />
                  
                  {/* Animated background orb */}
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.05, 0.1, 0.05],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.5
                    }}
                    className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${gradientClass} rounded-full blur-3xl`}
                  />
                  
                  <div className="relative z-10 p-6 md:p-8 ml-2">
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">u/{s.post.author}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{new Date(s.post.posted_at).toLocaleDateString()}</span>
                      </div>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${sentimentBadge.bg} flex items-center gap-1`}
                      >
                        <span>{sentimentBadge.emoji}</span>
                        <span>{sentimentBadge.text}</span>
                      </motion.span>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E20074]/10 text-[#E20074] border border-[#E20074]/20 flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        {s.category}
                      </motion.span>
                    </div>

                    {/* Content */}
                    <p className="text-gray-900 dark:text-gray-100 leading-relaxed mb-4 whitespace-pre-wrap">
                      {s.post.text.length > 300 ? s.post.text.substring(0, 300) + '...' : s.post.text}
                    </p>

                    {/* Solution */}
                    {s.solution && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.4 }}
                        className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800"
                      >
                        <div className="flex items-start gap-3">
                          <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-1 uppercase tracking-wide">
                              Proposed Solution
                            </p>
                            <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                              {s.solution}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Footer */}
                    {s.post.permalink && (
                      <motion.a
                        href={s.post.permalink}
                        target="_blank"
                        rel="noreferrer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#E20074] to-[#FF0066] text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>View on Reddit</span>
                      </motion.a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty State */}
          {!loading && items.length === 0 && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-[32px] bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-12 shadow-xl border border-gray-200 dark:border-gray-700 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E20074] to-[#FF0066] flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No discussions found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try a different search term or check back later
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}


