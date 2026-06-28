import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, Calendar, FileSpreadsheet, FileText, CalendarDays, X, ChevronRight } from 'lucide-react';
import api from '../../api/axios';
import { exportWorkoutCSV, exportWorkoutPDF } from '../../utils/exportUtils';
import { useAuthStore } from '../../context/useAuthStore';

export default function WorkoutHeatmap() {
  const [stats, setStats] = useState({ currentStreak: 0, longestStreak: 0, totalWorkouts: 0, dateMap: {} });
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { user, unit } = useAuthStore();

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const res = await api.get('/stats/streak-heatmap');
        setStats(res.data);
      } catch (e) {
        console.error('Failed to fetch heatmap stats', e);
      } finally {
        setLoading(false);
      }
    };
    fetchHeatmap();
  }, []);

  // Generate grid for past 60 days
  const daysGrid = [];
  const today = new Date();
  for (let i = 59; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const activity = stats.dateMap[dateStr] || { count: 0, volume: 0 };
    daysGrid.push({
      date: dateStr,
      displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: activity.count,
      volume: activity.volume,
    });
  }

  if (loading) {
    return <div className="h-16 rounded-2xl glass-card animate-pulse mb-8" />;
  }

  return (
    <>
      {/* Attractive Compact Streak Badge / Clickable Trigger */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="mb-8 cursor-pointer bg-[#111118]/90 backdrop-blur-xl border border-[#00E5FF]/30 hover:border-[#00E5FF] p-4 md:p-5 rounded-2xl shadow-accentGlow flex items-center justify-between gap-4 transition-all group relative overflow-hidden"
      >
        {/* Glow background */}
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-[#00E5FF]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-500/20 to-amber-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0 shadow-lg group-hover:scale-110 transition-transform">
            <Flame className="w-6 h-6 animate-pulse text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#00E5FF] font-bold uppercase tracking-wider flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5" /> Consistency Tracker
              </span>
            </div>
            <h3 className="font-display text-xl md:text-2xl font-extrabold text-white tracking-wide flex items-center gap-2">
              <span>{stats.currentStreak} DAY{stats.currentStreak === 1 ? '' : 'S'} STREAK</span>
              <span className="text-xs font-normal text-gray-400 font-sans hidden sm:inline">(Click to view activity)</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#00E5FF] font-bold shrink-0 bg-[#00E5FF]/10 px-3 py-2 rounded-xl border border-[#00E5FF]/30 group-hover:bg-[#00E5FF] group-hover:text-[#0A0A0F] transition-all">
          <span>View Heatmap</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </motion.div>

      {/* Full Modal Popup for Workout Streak & Activity Heatmap */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#111118] border border-white/15 rounded-3xl p-6 md:p-8 max-w-4xl w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Glow background */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />

              {/* Header with Close Button */}
              <div className="flex items-center justify-between gap-4 mb-6 relative z-10 border-b border-white/10 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-mono font-bold shadow-accentGlow mb-1">
                    <CalendarDays className="w-4 h-4 text-[#00E5FF]" />
                    <span>Consistency Tracker</span>
                  </div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-wide">
                    WORKOUT STREAK & ACTIVITY HEATMAP
                  </h2>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Streak Stat Badges */}
              <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
                <div className="bg-[#181824] border border-white/5 p-3.5 md:p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-gray-400 block uppercase">Current Streak</span>
                    <span className="text-lg md:text-xl font-bold text-white font-mono">{stats.currentStreak} Days</span>
                  </div>
                </div>

                <div className="bg-[#181824] border border-white/5 p-3.5 md:p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] shrink-0">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-gray-400 block uppercase">Longest Streak</span>
                    <span className="text-lg md:text-xl font-bold text-white font-mono">{stats.longestStreak} Days</span>
                  </div>
                </div>

                <div className="bg-[#181824] border border-white/5 p-3.5 md:p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-gray-400 block uppercase">Total Sessions</span>
                    <span className="text-lg md:text-xl font-bold text-white font-mono">{stats.totalWorkouts}</span>
                  </div>
                </div>
              </div>

              {/* 60-Day Interactive Activity Heatmap Grid */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-2">
                  <span>Past 60 Days Workout History</span>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span>Less</span>
                    <span className="w-2.5 h-2.5 rounded bg-white/5 border border-white/10 inline-block" />
                    <span className="w-2.5 h-2.5 rounded bg-[#00E5FF]/30 inline-block" />
                    <span className="w-2.5 h-2.5 rounded bg-[#00E5FF] inline-block" />
                    <span>More</span>
                  </div>
                </div>

                <div className="grid grid-cols-10 sm:grid-cols-12 md:grid-cols-20 gap-1.5 md:gap-2 pt-2">
                  {daysGrid.map((day, idx) => {
                    let bgClass = 'bg-white/5 border-white/10';
                    if (day.count > 0) {
                      if (day.count >= 3 || day.volume > 3000) {
                        bgClass = 'bg-[#00E5FF] text-[#0A0A0F] shadow-accentGlow font-bold';
                      } else if (day.count >= 2 || day.volume > 1000) {
                        bgClass = 'bg-[#00E5FF]/70 text-[#0A0A0F] font-bold';
                      } else {
                        bgClass = 'bg-[#00E5FF]/30 border-[#00E5FF]/50 text-[#00E5FF]';
                      }
                    }

                    return (
                      <motion.div
                        key={day.date}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.003 }}
                        title={`${day.displayDate}: ${day.count} session(s), ${day.volume} ${unit} volume`}
                        className={`h-7 rounded-lg border flex items-center justify-center text-[10px] font-mono cursor-pointer hover:scale-110 transition-transform ${bgClass}`}
                      >
                        {day.count > 0 ? '✓' : ''}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Export Buttons Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                <span className="text-xs text-gray-400">Download progression reports for backup or sharing</span>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={exportWorkoutCSV}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/10 text-xs font-semibold text-gray-300 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#00E5FF]" />
                    CSV Export
                  </button>

                  <button
                    onClick={() => exportWorkoutPDF(user?.name, unit)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 hover:bg-[#00E5FF]/20 text-xs font-semibold text-[#00E5FF] transition-all flex items-center justify-center gap-2 shadow-accentGlow"
                  >
                    <FileText className="w-4 h-4" />
                    PDF Report
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
