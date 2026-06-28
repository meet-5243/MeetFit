import React, { useState } from 'react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, TrendingUp, Award } from 'lucide-react';
import { useAuthStore } from '../../context/useAuthStore';

export default function ExerciseProgressCharts({ stats, loading }) {
  const [activeTab, setActiveTab] = useState('volume');
  const { unit } = useAuthStore();

  if (loading) {
    return (
      <div className="w-full h-80 rounded-3xl glass-card animate-pulse flex items-center justify-center text-gray-500">
        Loading exercise progression graphs...
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

  return (
    <div className="w-full bg-[#111118]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-display text-2xl font-bold text-white tracking-wide">
            Progression Analytics
          </h3>
          <p className="text-xs text-gray-400">Track strength and volume over time</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-black/40 p-1.5 rounded-2xl border border-white/10 font-mono text-xs">
          <button
            onClick={() => setActiveTab('volume')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'volume'
                ? 'bg-[#00E5FF] text-[#0A0A0F] shadow-accentGlow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            Volume
          </button>
          <button
            onClick={() => setActiveTab('e1rm')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'e1rm'
                ? 'bg-[#00E5FF] text-[#0A0A0F] shadow-accentGlow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Est. 1RM
          </button>
          <button
            onClick={() => setActiveTab('bestSet')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition-all ${
              activeTab === 'bestSet'
                ? 'bg-[#00E5FF] text-[#0A0A0F] shadow-accentGlow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            Best Set (PR)
          </button>
        </div>
      </div>

      {/* Chart Container */}
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
    </div>
  );
}
