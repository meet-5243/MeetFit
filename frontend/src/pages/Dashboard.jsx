import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, ArrowRight, Sparkles, Trophy, Zap, Activity } from 'lucide-react';
import GymCanvas from '../components/3d/GymCanvas';
import RotatingVolumeChart from '../components/charts/RotatingVolumeChart';
import { useAuthStore } from '../context/useAuthStore';

export default function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div className="relative min-h-[calc(100vh-65px)] overflow-hidden">
      {/* 3D Background Canvas */}
      <GymCanvas />

      {/* Foreground Hero UI */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-8 md:py-12">
        {/* Hero Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-[#111118]/80 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5" /> AI Overload Ready
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white tracking-wide">
              WELCOME BACK, <span className="text-[#00E5FF] uppercase">{user?.name || 'ATHLETE'}</span>!
            </h1>
            <p className="text-gray-400 text-sm md:text-base mt-2 max-w-xl">
              Track your strength progression, review AI target recommendations, and smash your personal records today.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link
              to="/muscles"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#0088FF] text-[#0A0A0F] font-bold text-sm shadow-accentGlow hover:scale-105 transition-all flex items-center gap-2"
            >
              <Flame className="w-5 h-5" />
              Start Workout
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Metric Quick Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card p-5 rounded-2xl border border-white/10 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono text-gray-400 block uppercase">Active System</span>
              <span className="text-lg font-bold text-white font-mono">Hypertrophy Engine</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-5 rounded-2xl border border-white/10 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/30 flex items-center justify-center text-[#FF6B35]">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono text-gray-400 block uppercase">Progression Logic</span>
              <span className="text-lg font-bold text-white font-mono">Double Progression</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card p-5 rounded-2xl border border-white/10 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono text-gray-400 block uppercase">Target Formula</span>
              <span className="text-lg font-bold text-white font-mono">Epley e1RM</span>
            </div>
          </motion.div>
        </div>

        {/* 2B Rotating Muscle Group Analytics Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <RotatingVolumeChart />
        </motion.div>
      </div>
    </div>
  );
}
