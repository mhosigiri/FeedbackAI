import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, User, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { BASE_URL } from '../api';

interface Props {
  onAdded?: () => void;
}

const FeedbackForm: React.FC<Props> = ({ onAdded }) => {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [locationHint, setLocationHint] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) {
      setStatus('Please enter feedback text.');
      setIsSuccess(false);
      return;
    }
    setBusy(true);
    setStatus('Submitting…');
    setIsSuccess(false);
    try {
      const res = await fetch(`${BASE_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          author: author.trim() || 'customer',
          location_hint: locationHint.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `HTTP ${res.status}`);
      }
      // Mark the moment feedback was received
      const now = Date.now();
      try {
        localStorage.setItem('feedbackLastSubmittedAt', String(now));
        window.dispatchEvent(new CustomEvent('feedback:submitted', { detail: { at: now } }));
      } catch {}
      setText('');
      setAuthor('');
      setLocationHint('');
      setStatus('Ticket created successfully! Our team will review it shortly.');
      setIsSuccess(true);
      setTimeout(() => {
        setStatus('');
        setIsSuccess(false);
      }, 4000);
      onAdded?.();
    } catch (err: any) {
      setStatus(`Error: ${err?.message || 'Failed to submit'}`);
      setIsSuccess(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E20074] to-[#FF0066] flex items-center justify-center shadow-lg">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Submit Your Feedback</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">We value your voice and will respond promptly</p>
        </div>
      </div>

      {/* Feedback Text */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#E20074]" />
          <span>Your Feedback</span>
          <span className="text-[#E20074]">*</span>
        </label>
        <textarea
          className="w-full rounded-2xl px-4 py-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#E20074] focus:ring-2 focus:ring-[#E20074]/20 transition-all outline-none resize-none shadow-sm"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe your experience in detail... Tell us what happened and how we can help."
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Be specific to help us address your concern quickly
        </p>
      </div>

      {/* Author and Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-[#E20074]" />
            <span>Your Name</span>
          </label>
          <input 
            className="w-full rounded-2xl px-4 py-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#E20074] focus:ring-2 focus:ring-[#E20074]/20 transition-all outline-none shadow-sm"
            value={author} 
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#E20074]" />
            <span>Location</span>
          </label>
          <input 
            className="w-full rounded-2xl px-4 py-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#E20074] focus:ring-2 focus:ring-[#E20074]/20 transition-all outline-none shadow-sm"
            value={locationHint} 
            onChange={(e) => setLocationHint(e.target.value)} 
            placeholder="e.g., Dallas, TX"
          />
        </div>
      </div>

      {/* Status Message */}
      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-3 p-4 rounded-2xl ${
              isSuccess
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
            }`}
          >
            {isSuccess ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            )}
            <p className={`text-sm font-medium ${
              isSuccess ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'
            }`}>
              {status}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={busy || !text.trim()}
        whileHover={!busy && text.trim() ? { scale: 1.02 } : {}}
        whileTap={!busy && text.trim() ? { scale: 0.98 } : {}}
        className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold shadow-xl transition-all ${
          busy || !text.trim()
            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-[#E20074] to-[#FF0066] text-white hover:shadow-2xl'
        }`}
      >
        {busy ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Submitting...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>Submit Ticket</span>
          </>
        )}
      </motion.button>
    </form>
  );
};

export default FeedbackForm;


