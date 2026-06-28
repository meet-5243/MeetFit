import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Flame, Shield, Zap, Activity, Target, Award, Dumbbell } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';
import { useAuthStore } from '../../context/useAuthStore';

const ICON_MAP = {
  Flame: Flame,
  Shield: Shield,
  Zap: Zap,
  Biceps: Dumbbell,
  Dumbbell: Dumbbell,
  Activity: Activity,
  Target: Target,
  Award: Award,
};

export default function RotatingVolumeChart() {
  const { unit } = useAuthStore();
  const [groups, setGroups] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch list of muscle groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get('/muscle-groups');
        setGroups(res.data);
        setLoading(false);
      } catch (e) {
        console.error('Failed to load muscle groups', e);
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  // Fetch stats for current active muscle group
  useEffect(() => {
    if (groups.length === 0) return;
    const activeGroup = groups[currentIndex];
    
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const res = await api.get(`/stats/muscle-group/${activeGroup._id}`);
        setStats(res.data);
      } catch (e) {
        console.error('Failed to fetch group stats', e);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [currentIndex, groups]);

  // Auto rotation timer (2.5 seconds)
  useEffect(() => {
    if (groups.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % groups.length);
    }, 2500);

    return () => clearInterval(timer);
  }, [groups]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % groups.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + groups.length) % groups.length);
  };

  if (loading) {
    return (
      <div className="w-full h-80 rounded-2xl glass-card animate-pulse flex items-center justify-center text-gray-500">
        Loading analytics engine...
      </div>
    );
  }

  if (groups.length === 0) return null;

  const activeGroup = groups[currentIndex];
  const IconComponent = ICON_MAP[activeGroup.icon] || Flame;

  return (
    <div className="relative w-full max-w-4xl mx-auto my-6">
      <div className="relative overflow-hidden rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-6 md:p-8 shadow-2xl">
        {/* Navigation Arrows & Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] shadow-accentGlow">
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-2xl font-bold tracking-wide text-white">
                  {activeGroup.name} Progress
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-400">
                  {currentIndex + 1} / {groups.length}
                </span>
              </div>
              <p className="text-xs text-gray-400">Aggregated Weekly Training Volume</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all"
              title="Previous group"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all"
              title="Next group"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Animated Carousel Card Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeGroup._id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-full"
          >
            {/* Stats Header */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-mono">This Week Volume</span>
                <div className="text-2xl font-bold font-mono text-white mt-1">
                  {stats ? stats.currentVolume.toLocaleString() : 0}{' '}
                  <span className="text-xs text-[#00E5FF] font-normal">{unit}</span>
                </div>
              </div>

              <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-mono">Weekly Trend</span>
                <div className="flex items-center gap-2 mt-1">
                  {stats && stats.percentChange >= 0 ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold text-lg">
                      <TrendingUp className="w-5 h-5" /> +{stats.percentChange}%
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-400 font-mono font-bold text-lg">
                      <TrendingDown className="w-5 h-5" /> {stats?.percentChange}%
                    </span>
                  )}
                  <span className="text-xs text-gray-500 font-mono">vs last week</span>
                </div>
              </div>

              <div className="hidden md:block bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-mono">Exercises Logged</span>
                <div className="text-2xl font-bold font-mono text-white mt-1">
                  {activeGroup.exerciseCount || 0} <span className="text-xs text-gray-400 font-normal">exercises</span>
                </div>
              </div>
            </div>

            {/* Recharts Chart */}
            <div className="h-64 w-full mt-4">
              {statsLoading ? (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                  Fetching trend lines...
                </div>
              ) : stats && stats.weeklyData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="week"
                      stroke="#475569"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#475569"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#111118]/95 border border-[#00E5FF]/30 p-3 rounded-xl shadow-2xl backdrop-blur-md font-mono">
                              <p className="text-xs text-gray-400 mb-1">{label}</p>
                              <p className="text-sm font-bold text-[#00E5FF]">
                                Volume: {payload[0].value.toLocaleString()} {unit}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      stroke="#00E5FF"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#volumeGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                  No weekly history recorded yet. Start logging sessions!
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 2.5s Countdown Progress Bar at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden rounded-b-3xl">
          <motion.div
            key={currentIndex}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.5, ease: 'linear' }}
            className="h-full bg-gradient-to-r from-[#00E5FF] to-[#0088FF]"
          />
        </div>
      </div>
    </div>
  );
}
