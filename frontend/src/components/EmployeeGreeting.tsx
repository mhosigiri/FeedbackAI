import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Award, Heart, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fs } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

interface EmployeeStats {
  problemsSolved: number;
  customersSatisfied: number;
  recentPraises: Array<{
    customer: string;
    category: string;
    feedback: string;
    timestamp: Date;
  }>;
}

const EmployeeGreeting: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<EmployeeStats>({
    problemsSolved: 0,
    customersSatisfied: 0,
    recentPraises: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeStats = async () => {
      if (!user) return;

      try {
        // Fetch feedback that mentions this employee
        const feedbackRef = collection(fs, 'feedback');
        const snapshot = await getDocs(feedbackRef);
        
        const employeeName = user.displayName || 'Anish K';
        const relevantFeedback: any[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.text && data.text.includes(employeeName)) {
            relevantFeedback.push({
              id: doc.id,
              ...data,
            });
          }
        });

        // Get analyses for these feedback items
        const analysesRef = collection(fs, 'feedback_analyses');
        const analysesSnapshot = await getDocs(analysesRef);
        
        let solvedCount = 0;
        const praises: any[] = [];

        analysesSnapshot.forEach((doc) => {
          const data = doc.data();
          const matchingFeedback = relevantFeedback.find(f => f.id === data.feedback_id);
          
          if (matchingFeedback) {
            if (data.resolved) {
              solvedCount++;
            }
            
            if (data.sentiment?.tone === 'positive') {
              praises.push({
                customer: data.name || matchingFeedback.author || 'Anonymous',
                category: data.intake?.classification || 'General',
                feedback: matchingFeedback.text.substring(0, 150) + '...',
                timestamp: new Date(data.analyzed_at * 1000),
              });
            }
          }
        });

        // Sort praises by timestamp
        praises.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        setStats({
          problemsSolved: solvedCount,
          customersSatisfied: relevantFeedback.length,
          recentPraises: praises.slice(0, 6),
        });
      } catch (error) {
        console.error('Error fetching employee stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeStats();
  }, [user]);

  if (!user || loading) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#E20074] via-[#FF0066] to-[#FF4D8C] p-8 shadow-2xl"
      >
        {/* Animated Background Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
        />

        {/* Content */}
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <Sparkles className="w-8 h-8 text-yellow-300" />
            <span className="text-2xl">🎉</span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            YAY! {user.displayName || 'Employee'}!
          </h1>

          <div className="flex flex-wrap gap-6 items-center mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-5xl font-bold text-white">{stats.problemsSolved}</p>
                <p className="text-white/90 text-sm font-medium">Problems Fixed</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-5xl font-bold text-white">{stats.customersSatisfied}</p>
                <p className="text-white/90 text-sm font-medium">Customers Satisfied</p>
              </div>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-white/95 font-medium"
          >
            You're making a difference! 🚀
          </motion.p>
        </div>
      </motion.div>

      {/* Moment of Delights */}
      {stats.recentPraises.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-6 h-6 text-[#E20074]" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recent Moments of Delight
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.recentPraises.map((praise, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                {/* Category Badge with Gradient */}
                <motion.div
                  initial={{ x: -100 }}
                  animate={{ x: 0 }}
                  transition={{ delay: 0.2 * index, type: "spring" }}
                  className="absolute top-4 right-4"
                >
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(praise.category)}`}>
                    <Award className="w-3 h-3" />
                    {praise.category}
                  </span>
                </motion.div>

                <div className="mb-3">
                  <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {praise.customer}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {praise.timestamp.toLocaleDateString()} at {praise.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  "{praise.feedback}"
                </p>

                {/* Decorative Gradient Bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E20074] via-[#FF0066] to-[#FFB800]" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Helper function for category colors
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'Network Coverage': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'Customer Service': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    'Billing': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    'Pricing & Plans': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    'Device & Equipment': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    'Store Experience': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    'Mobile App': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  };
  return colors[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
};

export default EmployeeGreeting;

