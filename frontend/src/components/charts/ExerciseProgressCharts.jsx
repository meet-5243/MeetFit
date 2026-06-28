import React, { useState } from 'react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, TrendingUp, Award, History, Calendar, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../context/useAuthStore';

export default function ExerciseProgressCharts({ stats, loading }) {
  const [activeTab, setActiveTab] = useState('volume');
  const [expandedSession, setExpandedSession] = useState(null);
  const { unit } = useAuthStore();

  if (loading) {
    return (
      <div className="w-full h-80 rounded-3xl glass-card animate-pulse flex items-center justify-center text-gray-500">
        Loading exercise progression analytics...
      </div>
    );
  }

  if (!stats || !stats.sessions || stats.sessions.length === 0) {
    return (
      <div className="w-full p-8 rounded-3xl glass-card text-center text-gray-400">
        <Activity className="w-8 h-8 text-gray-600 mx-auto mb-2" />
        <p className="text-sm">No workout sessions recorded yet. Log your first set above to trigger progression charts!</p>
      </div>
    );
  }

  const toggleExpand = (sessionId) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  // Sort sessions descending for history log view
  const historySessions = [...stats.sessions].reverse();

  return (
    <div className="w-full bg-[#111118]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-display text-2xl font-bold text-white tracking-wide">
            Progression Analytics & History
          </h3>
          <p className="text-xs text-gray-400">Track strength trends, e1RM, and full session logs</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center flex-wrap gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/10 font-mono text-xs">
          <button
            onClick={() => setActiveTab('volume')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'volume'
                ? 'bg-[#00E5FF] text-[#0A0A0F] shadow-accentGlow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Volume
          </button>
          <button
            onClick={() => setActiveTab('e1rm')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'e1rm'
                ? 'bg-[#00E5FF] text-[#0A0A0F] shadow-accentGlow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Est. 1RM
          </button>
          <button
            onClick={() => setActiveTab('bestSet')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'bestSet'
                ? 'bg-[#00E5FF] text-[#0A0A0F] shadow-accentGlow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Best Set
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-[#00E5FF] text-[#0A0A0F] shadow-accentGlow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            History ({stats.sessions.length})
          </button>
        </div>
      </div>

      {/* View Switcher Output */}
      {activeTab === 'history' ? (
        <div className="space-y-3 mt-4 max-h-[450px] overflow-y-auto pr-1">
          {historySessions.map((sess, idx) => {
            const isExpanded = expandedSession === sess.sessionId;
            return (
              <div
                key={sess.sessionId || idx}
                className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-white/20"
              >
                <div
                  onClick={() => toggleExpand(sess.sessionId)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{sess.date}</span>
                        {sess.isPR && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold">
                            <Trophy className="w-3 h-3 text-amber-400" /> All-Time PR
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        Best: <span className="text-white font-bold">{sess.bestWeight} {unit} × {sess.bestReps} reps</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block font-mono">
                      <span className="text-xs text-gray-400 block">Total Volume</span>
                      <span className="text-sm font-bold text-[#00E5FF]">{sess.volume.toLocaleString()} {unit}</span>
                    </div>
                    <button className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Sets Table */}
                <AnimatePresence>
                  {isExpanded && sess.sets && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 bg-black/30 p-4 font-mono text-xs"
                    >
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-gray-500 uppercase border-b border-white/5 pb-2">
                            <th className="py-1">Set</th>
                            <th className="py-1">Weight ({unit})</th>
                            <th className="py-1">Reps</th>
                            <th className="py-1 text-right">Volume</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sess.sets.map((s, sIdx) => (
                            <tr key={sIdx} className="border-b border-white/[0.02] text-gray-300">
                              <td className="py-2 font-bold text-[#00E5FF]">Set {s.setNumber || sIdx + 1}</td>
                              <td className="py-2 font-bold text-white">{s.weight}</td>
                              <td className="py-2">{s.reps}</td>
                              <td className="py-2 text-right text-gray-400">{(s.weight * s.reps).toLocaleString()} {unit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      ) : (
        /* Recharts Chart Container */
        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'volume' ? (
              <AreaChart data={stats.sessions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="exVolGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#111118] border border-[#00E5FF]/40 p-3 rounded-xl shadow-2xl font-mono text-xs">
                          <p className="text-gray-400 mb-1">{data.date}</p>
                          <p className="font-bold text-[#00E5FF]">Total Volume: {data.volume.toLocaleString()} {unit}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="volume" stroke="#00E5FF" strokeWidth={3} fillOpacity={1} fill="url(#exVolGrad)" />
              </AreaChart>
            ) : activeTab === 'e1rm' ? (
              <LineChart data={stats.sessions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#111118] border border-[#00E5FF]/40 p-3 rounded-xl shadow-2xl font-mono text-xs">
                          <p className="text-gray-400 mb-1">{data.date}</p>
                          <p className="font-bold text-[#00E5FF]">Est. 1RM: {data.e1RM} {unit}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="e1RM" stroke="#00E5FF" strokeWidth={3} dot={{ r: 4, fill: '#00E5FF' }} activeDot={{ r: 6 }} />
              </LineChart>
            ) : (
              <BarChart data={stats.sessions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#111118] border border-white/20 p-3 rounded-xl shadow-2xl font-mono text-xs">
                          <p className="text-gray-400 mb-1">{data.date}</p>
                          <p className="font-bold text-white">Best Set: {data.bestWeight} {unit} × {data.bestReps} reps</p>
                          {data.isPR && <p className="text-[#FFD700] font-bold mt-1">🏆 Personal Record!</p>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="bestWeight" radius={[6, 6, 0, 0]}>
                  {stats.sessions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isPR ? '#FFD700' : '#00E5FF'} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
