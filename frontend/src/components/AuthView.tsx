import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Sparkles, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthViewProps {
  onSuccess: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const { login, signup, error, clearError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (localError) setLocalError(null);
    clearError();
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setLocalError("All fields are required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setLocalError("Please enter a valid email address.");
      return false;
    }
    if (formData.password.length < 6) {
      setLocalError("Password must be at least 6 characters long.");
      return false;
    }
    if (!isLogin && !formData.name) {
      setLocalError("Name is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setLocalError(null);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.name, formData.email, formData.password);
      }
      onSuccess();
    } catch (err: any) {
      // Error is already captured by AuthContext and will be displayed via 'error'
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setLocalError(null);
    clearError();
    setFormData({ name: '', email: '', password: '' });
  };

  const displayedError = localError || error;

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 py-12 relative z-20">
      
      {/* Glow Decorator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-600/20 blur-[80px] pointer-events-none select-none" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        {/* Glow border */}
        <div className="absolute -inset-[1px] rounded-[24px] bg-gradient-to-r from-blue-500/30 via-purple-600/30 to-purple-500/30 blur-[4px] pointer-events-none" />

        {/* Form Container */}
        <div className="relative rounded-[24px] p-[1.5px] bg-gradient-to-r from-blue-500/30 via-purple-600/20 to-purple-500/30 shadow-[0_0_50px_-15px_rgba(99,102,241,0.25)] overflow-hidden">
          <div className="w-full rounded-[23px] bg-[#050508]/90 backdrop-blur-xl p-8 sm:p-10 flex flex-col relative select-text">
            
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative mb-4">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 blur-md opacity-40" />
                <div className="relative w-12 h-12 rounded-xl bg-[#09090c] border border-white/10 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight text-white font-display">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-xs text-gray-400 mt-2 font-medium tracking-wide">
                {isLogin ? 'Access your intelligent AI workspace' : 'Get started with IntelliMind'}
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {displayedError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 text-xs text-red-400 font-semibold leading-relaxed"
                >
                  {displayedError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider pl-1">Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your name"
                      className="w-full bg-white/[0.02] border border-white/5 focus:border-indigo-500/50 hover:border-white/10 outline-none text-white text-sm pl-11 pr-4 py-3 rounded-xl transition-all font-medium placeholder-gray-600 focus:ring-1 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider pl-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@example.com"
                    className="w-full bg-white/[0.02] border border-white/5 focus:border-indigo-500/50 hover:border-white/10 outline-none text-white text-sm pl-11 pr-4 py-3 rounded-xl transition-all font-medium placeholder-gray-600 focus:ring-1 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Password</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Min. 6 characters"
                    className="w-full bg-white/[0.02] border border-white/5 focus:border-indigo-500/50 hover:border-white/10 outline-none text-white text-sm pl-11 pr-11 py-3 rounded-xl transition-all font-medium placeholder-gray-600 focus:ring-1 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-all"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-indigo-500/20 active:scale-[0.98] disabled:from-white/5 disabled:to-transparent disabled:text-gray-600 disabled:shadow-none transition-all duration-200 mt-6"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Sign Up'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Link */}
            <div className="mt-8 text-center text-xs text-gray-400 font-semibold tracking-wide">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={toggleAuthMode}
                className="text-indigo-400 hover:text-indigo-300 font-bold transition-all ml-1 underline underline-offset-4"
              >
                {isLogin ? 'Create one' : 'Sign In'}
              </button>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};
