import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, AlertCircle, UserCircle, Users } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginAsCustomer } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const validateForm = (): boolean => {
    let isValid = true;
    
    if (!email.trim()) {
      setEmailError(true);
      isValid = false;
    } else {
      setEmailError(false);
    }

    if (!password.trim()) {
      setPasswordError(true);
      isValid = false;
    } else {
      setPasswordError(false);
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Please try again.');
        setEmailError(true);
        setPasswordError(true);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerLogin = () => {
    loginAsCustomer();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0B0B0B] dark:via-gray-900 dark:to-[#0B0B0B] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-[#E20074] to-[#FF0066] bg-clip-text text-transparent">
              Welcome to FeedbackAI
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Choose how you'd like to continue
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Employee Login */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
              {/* Background orb */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-0 right-0 w-64 h-64 bg-[#E20074]/20 rounded-full blur-3xl"
              />

              <div className="relative z-10">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#E20074] to-[#FF0066] flex items-center justify-center shadow-xl">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Employee Login
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Access full dashboard and analytics
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </motion.div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className={`w-5 h-5 ${emailError ? 'text-red-500' : 'text-gray-400'}`} />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError(false);
                          setError('');
                        }}
                        className={`
                          w-full pl-10 pr-4 py-3 rounded-2xl border-2 transition-colors bg-white dark:bg-gray-900
                          ${emailError 
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-200 dark:border-gray-700 focus:ring-[#E20074] focus:border-[#E20074]'
                          }
                          focus:outline-none focus:ring-2 text-gray-900 dark:text-white
                        `}
                        placeholder="employee@tmobile.com"
                        aria-label="Email address"
                        aria-invalid={emailError}
                        aria-describedby={emailError ? 'email-error' : undefined}
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className={`w-5 h-5 ${passwordError ? 'text-red-500' : 'text-gray-400'}`} />
                      </div>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setPasswordError(false);
                          setError('');
                        }}
                        className={`
                          w-full pl-10 pr-4 py-3 rounded-2xl border-2 transition-colors bg-white dark:bg-gray-900
                          ${passwordError 
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-200 dark:border-gray-700 focus:ring-[#E20074] focus:border-[#E20074]'
                          }
                          focus:outline-none focus:ring-2 text-gray-900 dark:text-white
                        `}
                        placeholder="Enter your password"
                        aria-label="Password"
                        aria-invalid={passwordError}
                        aria-describedby={passwordError ? 'password-error' : undefined}
                      />
                    </div>
                  </div>

                  {/* Login Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className={`
                      w-full py-3 rounded-2xl font-bold text-white transition-colors
                      ${isLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-[#E20074] to-[#FF0066] hover:shadow-xl'
                      }
                      shadow-lg
                    `}
                    aria-label="Login"
                  >
                    {isLoading ? 'Logging in...' : 'Login as Employee'}
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Customer Login (Skip Login) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#E20074] via-[#FF0066] to-[#FF4D8C] shadow-2xl p-8 h-full flex flex-col">
              {/* Background orb */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl"
              />

              <div className="relative z-10 flex flex-col flex-1">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
                    <UserCircle className="w-10 h-10 text-white" />
                  </div>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Customer Portal
                  </h2>
                  <p className="text-white/90">
                    Access customer dashboard and support
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">View Analytics</p>
                      <p className="text-white/80 text-sm">Access customer happiness metrics and insights</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">AI Assistant</p>
                      <p className="text-white/80 text-sm">Chat with JOY for instant support</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Create Tickets</p>
                      <p className="text-white/80 text-sm">Submit feedback and report issues</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">No Login Required</p>
                      <p className="text-white/80 text-sm">Get started immediately without an account</p>
                    </div>
                  </div>
                </div>

                {/* Continue as Customer Button */}
                <motion.button
                  onClick={handleCustomerLogin}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-2xl font-bold bg-white text-[#E20074] shadow-xl hover:shadow-2xl transition-all"
                >
                  Continue as Customer
                </motion.button>

                <p className="text-center text-white/80 text-sm mt-4">
                  No registration needed • Instant access
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sign Up Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-gray-600 dark:text-gray-400">
            New employee?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-[#E20074] hover:text-[#FF0066] font-semibold transition-colors"
            >
              Create an account
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

