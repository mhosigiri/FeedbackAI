import React from 'react';
import { motion } from 'framer-motion';
import { Ticket, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FeedbackForm from '../components/FeedbackForm';

const CreateTicket: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0B0B0B] dark:via-gray-900 dark:to-[#0B0B0B]">
      <div className="max-w-5xl mx-auto p-6 md:p-8">
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
          
          <div className="flex items-center gap-4 mb-3">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
              className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#E20074] to-[#FF0066] flex items-center justify-center shadow-xl"
            >
              <Ticket className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                Create Ticket
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                Submit your feedback or report an issue
              </p>
            </div>
          </div>
        </motion.div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-xl"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"
            />
            <div className="relative z-10">
              <p className="text-3xl mb-2">⚡</p>
              <h3 className="text-white font-bold text-lg mb-1">Fast Response</h3>
              <p className="text-white/90 text-sm">We'll get back to you within 24 hours</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 shadow-xl"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"
            />
            <div className="relative z-10">
              <p className="text-3xl mb-2">🤖</p>
              <h3 className="text-white font-bold text-lg mb-1">AI-Powered</h3>
              <p className="text-white/90 text-sm">Automatic routing to the right team</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 to-green-600 p-6 shadow-xl"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
              className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"
            />
            <div className="relative z-10">
              <p className="text-3xl mb-2">🔒</p>
              <h3 className="text-white font-bold text-lg mb-1">Secure</h3>
              <p className="text-white/90 text-sm">Your information is encrypted and safe</p>
            </div>
          </motion.div>
        </div>

        {/* Feedback Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-[32px] bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8 shadow-2xl border border-gray-200 dark:border-gray-700"
        >
          <FeedbackForm onAdded={() => {
            // Optional: Add success callback
            console.log('Ticket created successfully!');
          }} />
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 rounded-3xl bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-900/10 dark:via-yellow-900/10 dark:to-amber-900/10 p-6 border border-amber-200 dark:border-amber-800"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <span>💡</span>
            Tips for Better Support
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-[#E20074] font-bold mt-1">•</span>
              <span>Be specific about the issue you're experiencing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#E20074] font-bold mt-1">•</span>
              <span>Include any error messages or screenshots if applicable</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#E20074] font-bold mt-1">•</span>
              <span>Mention your device model and location if relevant</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#E20074] font-bold mt-1">•</span>
              <span>Let us know if the issue is urgent or time-sensitive</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateTicket;

