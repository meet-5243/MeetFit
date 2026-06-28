import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Trash2, Save, Sparkles, Trophy, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../api/axios';
import AITargetCard from '../components/ai/AITargetCard';
import ExerciseProgressCharts from '../components/charts/ExerciseProgressCharts';
import { useAuthStore } from '../context/useAuthStore';

export default function ExerciseDetail() {
  const { groupId, exerciseId } = useParams();
  const { unit } = useAuthStore();

  const [exercise, setExercise] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Current active working session sets state
  const [sets, setSets] = useState([
    { setNumber: 1, weight: 60, reps: 10, unit },
    { setNumber: 2, weight: 65, reps: 8, unit },
  ]);

  const fetchExerciseData = async () => {
    try {
      const [exRes, sugRes, statsRes] = await Promise.all([
        api.get(`/exercises?muscleGroupId=${groupId}`),
        api.get(`/stats/suggestion/${exerciseId}`),
        api.get(`/stats/exercise/${exerciseId}`),
      ]);

      const foundEx = exRes.data.find((e) => e._id === exerciseId);
      setExercise(foundEx);
      setSuggestion(sugRes.data);
      setStats(statsRes.data);

      // If AI has targets, populate initial working sets with AI targets!
      if (sugRes.data && sugRes.data.targets && sugRes.data.targets.length > 0) {
        setSets(sugRes.data.targets.map(t => ({ ...t, unit })));
      }
    } catch (e) {
      console.error('Error loading exercise details', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExerciseData();
  }, [exerciseId]);

  // Handle unit changes
  useEffect(() => {
    setSets(prev => prev.map(s => ({ ...s, unit })));
  }, [unit]);

  const handleAddSet = () => {
    const lastSet = sets[sets.length - 1] || { weight: 50, reps: 10 };
    setSets([
      ...sets,
      {
        setNumber: sets.length + 1,
        weight: lastSet.weight,
        reps: lastSet.reps,
        unit,
      },
    ]);
  };

  const handleUpdateSet = (index, field, value) => {
    const updated = [...sets];
    updated[index][field] = Number(value);
    setSets(updated);
  };

  const handleDeleteSet = (index) => {
    const filtered = sets.filter((_, i) => i !== index);
    const reindexed = filtered.map((s, i) => ({ ...s, setNumber: i + 1 }));
    setSets(reindexed);
  };

  const handleSaveSession = async () => {
    if (sets.length === 0) return;
    setSaving(true);
    try {
      await api.post('/sessions', {
        exerciseId,
        date: new Date(),
        sets,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);

      // Check if current max weight beats historical PR
      const maxWeightLogged = Math.max(...sets.map(s => s.weight));
      const historicalMax = stats?.sessions?.length > 0 
        ? Math.max(...stats.sessions.map(s => s.bestWeight))
        : 0;

      if (maxWeightLogged > historicalMax && historicalMax > 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // Refresh stats & suggestions
      fetchExerciseData();
    } catch (e) {
      console.error('Failed to save session', e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="h-10 w-48 bg-white/5 rounded-xl animate-pulse mb-8" />
        <div className="h-64 rounded-3xl glass-card animate-pulse mb-8" />
        <div className="h-80 rounded-3xl glass-card animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Navigation & Header */}
      <div>
        <Link to={`/muscles/${groupId}`} className="inline-flex items-center gap-1 text-xs font-mono text-[#00E5FF] hover:underline mb-2">
          <ChevronLeft className="w-4 h-4" /> Back to Exercises
        </Link>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white tracking-wide flex items-center gap-3">
          {exercise ? exercise.name : 'Exercise Tracker'}
        </h1>
        {exercise?.notes && <p className="text-gray-400 text-sm mt-1">{exercise.notes}</p>}
      </div>

      {/* 🤖 1. AI Smart Target Suggestion Card */}
      <AITargetCard suggestion={suggestion} loading={loading} />

      {/* 💪 2. Sets & Reps Logger */}
      <div className="bg-[#111118]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display text-2xl font-bold text-white tracking-wide">
              Logged Workout Session
            </h3>
            <p className="text-xs text-gray-400">Record today's sets with real-time target adjustments</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAddSet}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-[#00E5FF]" /> Add Set
            </button>

            <button
              onClick={handleSaveSession}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#0088FF] text-[#0A0A0F] font-bold text-xs shadow-accentGlow hover:scale-105 transition-all flex items-center gap-2"
            >
              {saving ? 'Logging...' : savedSuccess ? 'Session Logged!' : 'Save Workout Session'}
              {savedSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs text-gray-400 uppercase">
                <th className="py-3 px-4">Set #</th>
                <th className="py-3 px-4">Weight ({unit})</th>
                <th className="py-3 px-4">Reps</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {sets.map((s, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 px-4 font-bold text-[#00E5FF]">Set {s.setNumber}</td>
                    <td className="py-4 px-4">
                      <input
                        type="number"
                        step="0.5"
                        value={s.weight}
                        onChange={(e) => handleUpdateSet(idx, 'weight', e.target.value)}
                        className="w-24 px-3 py-1.5 rounded-xl glass-input text-white text-sm font-bold text-center"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <input
                        type="number"
                        value={s.reps}
                        onChange={(e) => handleUpdateSet(idx, 'reps', e.target.value)}
                        className="w-20 px-3 py-1.5 rounded-xl glass-input text-white text-sm font-bold text-center"
                      />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleDeleteSet(idx)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                        title="Remove set"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* 📈 3. Exercise Progress Charts */}
      <ExerciseProgressCharts stats={stats} loading={loading} />
    </div>
  );
}
