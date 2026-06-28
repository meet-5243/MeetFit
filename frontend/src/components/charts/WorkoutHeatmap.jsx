import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Calendar, Download, FileSpreadsheet, FileText, Activity, CalendarDays } from 'lucide-react';
import api from '../../api/axios';
import { exportWorkoutCSV, exportWorkoutPDF } from '../../utils/exportUtils';
import { useAuthStore } from '../../context/useAuthStore';

export default function WorkoutHeatmap() {
  const [stats, setStats] = useState({ currentStreak: 0, longestStreak: 0, totalWorkouts: 0, dateMap: {} });
  const [loading, setLoading] = useState(true);
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
    return <div className="h-48 rounded-3xl glass-card animate-pulse mb-8" />;
  }

  return (
    <div className="bg-[#111118]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl mb-8 relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Header + Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-mono font-bold shadow-accentGlow mb-1">
            <CalendarDays className="w-4 h-4 text-[#00E5FF] animate-pulse" />
            <span>Consistency Tracker</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-wide mt-0.5">
            WORKOUT STREAK & ACTIVITY
          </h2>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportWorkoutCSV}
            title="Export raw workout logs to Excel/CSV"
            className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/10 text-xs font-semibold text-gray-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#00E5FF]" />
            CSV Export
          </button>

          <button
            onClick={() => exportWorkoutPDF(user?.name, unit)}
            title="Generate print-ready PDF Progression Report"
            className="px-3.5 py-2 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 hover:bg-[#00E5FF]/20 text-xs font-semibold text-[#00E5FF] transition-all flex items-center gap-1.5 shadow-accentGlow"
          >
            <FileText className="w-4 h-4" />
            PDF Report
          </button>
        </div>
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
      <div>
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
                transition={{ delay: idx * 0.005 }}
                title={`${day.displayDate}: ${day.count} session(s), ${day.volume} ${unit} volume`}
                className={`h-7 rounded-lg border flex items-center justify-center text-[10px] font-mono cursor-pointer hover:scale-110 transition-transform ${bgClass}`}
              >
                {day.count > 0 ? '✓' : ''}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
