import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Shield, Zap, Activity, Target, Award, Dumbbell, ArrowRight, Calendar } from 'lucide-react';
import api from '../api/axios';

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

export default function MuscleGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get('/muscle-groups');
        setGroups(res.data);
      } catch (e) {
        console.error('Failed to fetch muscle groups', e);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="h-10 w-48 bg-white/5 rounded-xl animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-48 rounded-3xl glass-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-mono text-[#00E5FF] uppercase tracking-wider block mb-1">Target Training</span>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white tracking-wide">
          MUSCLE GROUPS
        </h1>
        <p className="text-gray-400 text-sm mt-1">Select a muscle group to log exercises, sets, and view AI recommendations.</p>
      </div>

      {/* Grid of 8 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {groups.map((group, index) => {
          const IconComp = ICON_MAP[group.icon] || Flame;
          const lastTrainedStr = group.lastTrained
            ? new Date(group.lastTrained).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'Never';

          return (
            <motion.div
              key={group._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link
                to={`/muscles/${group._id}`}
                className="group block h-full bg-[#111118]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 glass-card-hover relative overflow-hidden shadow-xl"
              >
                {/* Accent glow on hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/10 rounded-full blur-2xl group-hover:bg-[#00E5FF]/20 transition-all pointer-events-none" />

                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] group-hover:scale-110 transition-transform shadow-accentGlow">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                        {group.bodyPart}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl font-bold text-white group-hover:text-[#00E5FF] transition-colors mb-2">
                      {group.name}
                    </h3>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-gray-400">
                      <span>Exercises:</span>
                      <span className="text-white font-bold">{group.exerciseCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Last Trained:
                      </span>
                      <span className="text-[#00E5FF] font-bold">{lastTrainedStr}</span>
                    </div>

                    <div className="pt-2 flex items-center justify-end text-[#00E5FF] text-xs font-bold gap-1 group-hover:translate-x-1 transition-transform">
                      View Exercises <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
