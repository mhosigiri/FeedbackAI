import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Save, LogOut, ShieldCheck, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { BASE_URL } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { updateProfile } from 'firebase/auth';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const [empId, setEmpId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setEmpId(user.uid);
      setName(user.displayName || '');
      setEmail(user.email || '');
    } else {
      setEmpId('');
      setName('');
      setEmail('');
    }
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Saving...');
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch(`${BASE_URL}/employees/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emp_id: empId.trim(),
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          new_password: newPassword ? newPassword : undefined,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      if (auth.currentUser && name.trim()) {
        await updateProfile(auth.currentUser, { displayName: name.trim() });
      }
      setStatus('Changes saved successfully!');
      setSuccess(true);
      setNewPassword('');
      setTimeout(() => {
        setSuccess(false);
        setStatus('');
      }, 3000);
    } catch (e: any) {
      setStatus(`Error: ${e?.message || 'Failed to save changes'}`);
      setSuccess(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0B0B0B] dark:via-gray-900 dark:to-[#0B0B0B]">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
            Manage your account preferences and security
          </p>
        </motion.div>

        {!isLoggedIn ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[32px] bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8 shadow-2xl border border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-col items-center text-center py-12">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E20074] to-[#FF0066] flex items-center justify-center mb-6"
              >
                <ShieldCheck className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                You're not signed in
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                Please log in to access your account settings and preferences
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-[#E20074] to-[#FF0066] text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  onClick={() => navigate('/login')}
                >
                  Login
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-2xl font-semibold hover:border-[#E20074] transition-all"
                  onClick={() => navigate('/signup')}
                >
                  Sign up
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Profile Section */}
            <div className="rounded-[32px] bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E20074] to-[#FF0066] flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Profile Information
                </h2>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                {/* Employee ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Employee ID
                  </label>
                  <input
                    className="w-full rounded-2xl px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    value={empId}
                    readOnly
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  <input
                    className="w-full rounded-2xl px-4 py-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:border-[#E20074] focus:ring-2 focus:ring-[#E20074]/20 transition-all outline-none"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input
                    className="w-full rounded-2xl px-4 py-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:border-[#E20074] focus:ring-2 focus:ring-[#E20074]/20 transition-all outline-none"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your.email@tmobile.com"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    New Password
                  </label>
                  <input
                    className="w-full rounded-2xl px-4 py-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:border-[#E20074] focus:ring-2 focus:ring-[#E20074]/20 transition-all outline-none"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Only fill this if you want to change your password
                  </p>
                </div>

                {/* Status Message */}
                {status && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-3 p-4 rounded-2xl ${
                      success
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    }`}
                  >
                    {success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    )}
                    <p className={`text-sm font-medium ${
                      success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                    }`}>
                      {status}
                    </p>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 pt-4">
                  <motion.button
                    type="submit"
                    disabled={saving}
                    whileHover={!saving ? { scale: 1.02 } : {}}
                    whileTap={!saving ? { scale: 0.98 } : {}}
                    className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all ${
                      saving
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#E20074] to-[#FF0066] hover:shadow-xl text-white'
                    }`}
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 transition-all"
                    onClick={() => {
                      logout();
                      setStatus('Logged out successfully');
                      setTimeout(() => navigate('/'), 1000);
                    }}
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </motion.button>
                </div>
              </form>
            </div>

            {/* Additional Info Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="rounded-[32px] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10 p-6 border border-blue-200 dark:border-blue-800"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                🔒 Security & Privacy
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Your data is encrypted and secure. We never share your personal information with third parties.
                If you need to reset your password or have security concerns, please contact IT support.
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Settings;


