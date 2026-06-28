import React from 'react';
import { Sparkles, Target, Zap, AlertTriangle, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../../context/useAuthStore';

export default function AITargetCard({ suggestion, loading }) {
  const { unit } = useAuthStore();

  if (loading) {
    return (
      <div className="w-full p-6 rounded-3xl glass-card animate-pulse flex items-center gap-4 text-gray-400">
        <Sparkles className="w-6 h-6 text-[#00E5FF] animate-spin" />
        <span>Computing progressive overload targets & e1RM calculations...</span>
      </div>
    );
  }

  if (!suggestion) return null;

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl p-6 md:p-8 transition-all shadow-2xl ${
      suggestion.isDeload
        ? 'bg-amber-950/20 border border-amber-500/30 shadow-orangeGlow'
        : 'bg-[#111118]/90 border border-[#00E5FF]/40 shadow-accentGlow'
    }`}>
      {/* Background glow overlay */}
      <div className={`absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
        suggestion.isDeload ? 'bg-amber-500/10' : 'bg-[#00E5FF]/10'
      }`} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
              suggestion.isDeload
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-[#00E5FF]/20 border-[#00E5FF]/40 text-[#00E5FF]'
            }`}>
              {suggestion.isDeload ? <AlertTriangle className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-2xl font-bold tracking-wide text-white">
                  {suggestion.title || '🎯 Target for Today'}
                </h3>
                {suggestion.isDeload && (
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300">
                    DELOAD RECOVERY
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">AI Progressive Overload Recommendation</p>
            </div>
          </div>

          {/* Estimated 1RM badge */}
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-3 font-mono">
            <TrendingUp className="w-5 h-5 text-[#00E5FF]" />
            <div>
              <span className="text-[10px] text-gray-400 uppercase block">Est. 1-Rep Max</span>
              <span className="text-sm font-bold text-white">
                {suggestion.estimated1RM || 0} {unit}{' '}
                {suggestion.e1RMChange !== undefined && (
                  <span className={`text-xs ${suggestion.e1RMChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ({suggestion.e1RMChange >= 0 ? '+' : ''}{suggestion.e1RMChange} {unit})
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Suggested Target Sets Pill List */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {suggestion.targets && suggestion.targets.map((tgt, idx) => (
            <div
              key={idx}
              className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 p-3.5 rounded-2xl flex items-center justify-between transition-colors font-mono"
            >
              <span className="text-xs font-semibold text-gray-400">Set {tgt.setNumber}</span>
              <span className="text-sm font-bold text-[#00E5FF]">
                {tgt.weight} {tgt.unit || unit} × {tgt.reps} reps
              </span>
            </div>
          ))}
        </div>

        {/* Explanation Text */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 text-xs md:text-sm text-gray-300 leading-relaxed flex items-start gap-3">
          <Zap className="w-5 h-5 text-[#00E5FF] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white block mb-1">AI Insight & Next Steps:</span>
            {suggestion.explanation}
          </div>
        </div>
      </div>
    </div>
  );
}
