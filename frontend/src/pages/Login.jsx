import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0A0F] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Backdrops */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#111118]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#0088FF] p-0.5 shadow-accentGlow mb-4">
            <div className="w-full h-full bg-[#0A0A0F] rounded-[14px] flex items-center justify-center">
              <Dumbbell className="w-8 h-8 text-[#00E5FF]" />
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-wider text-white">
            WELCOME TO <span className="text-[#00E5FF]">MEETFIT</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to access your AI gym progress tracker</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="athlete@meetfit.com"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-input text-white text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl glass-input text-white text-sm transition-all"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-4 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#0088FF] text-[#0A0A0F] font-bold text-base shadow-accentGlow flex items-center justify-center gap-2 transition-all"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </motion.button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#00E5FF] font-semibold hover:underline">
            Create Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
