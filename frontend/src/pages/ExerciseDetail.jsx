import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Trash2, Save, Sparkles, Trophy, CheckCircle2, Timer, Bell, RotateCcw, X, Check, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../api/axios';
import AITargetCard from '../components/ai/AITargetCard';
import ExerciseProgressCharts from '../components/charts/ExerciseProgressCharts';
import { useAuthStore } from '../context/useAuthStore';

// Web Audio API Synthesizer for a rich, premium chime sound + phone vibration
const playRestTimerAlert = () => {
  // 1. Trigger Vibration (3 pulses: vibrate 300ms, pause 150ms, vibrate 300ms, pause 150ms, vibrate 300ms)
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([300, 150, 300, 150, 300]);
    } catch (e) {
      console.warn('Vibration API blocked or not supported:', e);
    }
  }

  // 2. Play Premium Ascending Chime
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    const playChimeNote = (startTime, freq, duration, volume = 0.3) => {
      const osc1 = audioCtx.createOscillator(); // Main warm body (triangle)
      const osc2 = audioCtx.createOscillator(); // Bright overtone (sine)
      const gainNode = audioCtx.createGain();
      
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, audioCtx.currentTime + startTime); // Octave overtone
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      // Volume envelope: rapid attack, smooth exponential decay to avoid clicky sounds
      const t = audioCtx.currentTime + startTime;
      gainNode.gain.setValueAtTime(0, t);
      gainNode.gain.linearRampToValueAtTime(volume, t + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, t + duration);
      
      osc1.start(t);
      osc1.stop(t + duration);
      osc2.start(t);
      osc2.stop(t + duration);
    };

    // Ascending arpeggio sequence
    playChimeNote(0, 523.25, 0.4, 0.2);     // C5 note
    playChimeNote(0.2, 659.25, 0.4, 0.2);   // E5 note
    playChimeNote(0.4, 784.00, 0.8, 0.3);   // G5 note
    playChimeNote(0.4, 1046.50, 1.0, 0.15); // C6 chime overtone
  } catch (e) {
    console.error('AudioContext error', e);
  }
};

// Unlock AudioContext for mobile webviews/browsers on user interaction
const unlockAudio = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    osc.start(0);
    osc.stop(0.01);
  } catch (e) {
    console.error('Could not unlock audio', e);
  }
};

export default function ExerciseDetail() {
  const { groupId, exerciseId } = useParams();
  const { unit } = useAuthStore();

  const [exercise, setExercise] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // PWA Rest Timer States
  const [isTimerEnabled, setIsTimerEnabled] = useState(() => {
    const saved = localStorage.getItem('meetfit_timer_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [completedSets, setCompletedSets] = useState({});
  const [timerActive, setTimerActive] = useState(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(80);
  const [timerEndTime, setTimerEndTime] = useState(null);

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

      // Reset completed sets and cancel active timer when loading new exercise
      setCompletedSets({});
      setTimerActive(false);
      setTimerEndTime(null);
      setTimerSecondsLeft(80);

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

  // Rest Timer background-safe ticking logic
  useEffect(() => {
    if (!timerActive || !timerEndTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.round((timerEndTime - now) / 1000));
      
      setTimerSecondsLeft(remaining);

      if (remaining <= 0) {
        setTimerActive(false);
        setTimerEndTime(null);
        playRestTimerAlert();
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [timerActive, timerEndTime]);

  const startRestTimer = (seconds) => {
    setTimerSecondsLeft(seconds);
    setTimerEndTime(Date.now() + seconds * 1000);
    setTimerActive(true);
  };

  const handleToggleSetComplete = (index) => {
    // Unlock Audio Context on user click for mobile browsers
    unlockAudio();

    // Subtle 40ms haptic feedback vibrate when completing a set
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(40);
      } catch (e) {}
    }

    const updatedCompleted = { ...completedSets };
    const isNowComplete = !updatedCompleted[index];
    updatedCompleted[index] = isNowComplete;
    setCompletedSets(updatedCompleted);

    // If set is marked complete and timer is enabled, start/reset countdown to 80s
    if (isNowComplete && isTimerEnabled) {
      startRestTimer(80);
    }
  };

  const handleAdjustTimer = (amount) => {
    if (!timerActive) {
      const newDuration = Math.max(10, 80 + amount);
      startRestTimer(newDuration);
    } else {
      const newSeconds = Math.max(0, timerSecondsLeft + amount);
      if (newSeconds <= 0) {
        setTimerActive(false);
        setTimerEndTime(null);
        setTimerSecondsLeft(80);
      } else {
        setTimerSecondsLeft(newSeconds);
        setTimerEndTime(Date.now() + newSeconds * 1000);
      }
    }
  };

  const handleResetTimer = () => {
    startRestTimer(80);
  };

  const handleSkipTimer = () => {
    setTimerActive(false);
    setTimerEndTime(null);
    setTimerSecondsLeft(80);
  };

  const handleToggleTimerEnabled = () => {
    const newVal = !isTimerEnabled;
    setIsTimerEnabled(newVal);
    localStorage.setItem('meetfit_timer_enabled', JSON.stringify(newVal));
    if (!newVal) {
      handleSkipTimer();
    }
  };

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

    // Reindex completedSets to match new array indices
    const newCompleted = {};
    let offset = 0;
    for (let i = 0; i < sets.length; i++) {
      if (i === index) {
        offset = 1;
        continue;
      }
      if (completedSets[i]) {
        newCompleted[i - offset] = true;
      }
    }
    setCompletedSets(newCompleted);
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
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
              <p className="text-xs text-gray-400">Record today's sets with real-time target adjustments</p>
              <div className="h-4 w-px bg-white/10 hidden sm:block" />
              <button
                onClick={handleToggleTimerEnabled}
                className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md border transition-all ${
                  isTimerEnabled 
                    ? 'bg-[#00E5FF]/10 border-[#00E5FF]/30 text-[#00E5FF] shadow-accentGlow/10' 
                    : 'bg-white/5 border-white/10 text-gray-400'
                }`}
              >
                <Timer className="w-3.5 h-3.5" />
                Auto Rest: {isTimerEnabled ? 'ON (80s)' : 'OFF'}
              </button>
            </div>
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
                <th className="py-3 px-4 w-12 text-center">Done</th>
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
                    className={`border-b border-white/5 transition-colors ${
                      completedSets[idx]
                        ? 'bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleSetComplete(idx)}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                          completedSets[idx]
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950 font-bold shadow-emeraldGlow'
                            : 'border-white/20 hover:border-[#00E5FF] text-transparent hover:text-white/40'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </td>
                    <td className={`py-4 px-4 font-bold transition-all ${completedSets[idx] ? 'text-emerald-400' : 'text-[#00E5FF]'}`}>
                      Set {s.setNumber}
                    </td>
                    <td className="py-4 px-4">
                      <input
                        type="number"
                        step="0.5"
                        value={s.weight}
                        onChange={(e) => handleUpdateSet(idx, 'weight', e.target.value)}
                        disabled={completedSets[idx]}
                        className={`w-24 px-3 py-1.5 rounded-xl glass-input text-white text-sm font-bold text-center transition-all ${
                          completedSets[idx] ? 'opacity-50 cursor-not-allowed border-transparent' : ''
                        }`}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <input
                        type="number"
                        value={s.reps}
                        onChange={(e) => handleUpdateSet(idx, 'reps', e.target.value)}
                        disabled={completedSets[idx]}
                        className={`w-20 px-3 py-1.5 rounded-xl glass-input text-white text-sm font-bold text-center transition-all ${
                          completedSets[idx] ? 'opacity-50 cursor-not-allowed border-transparent' : ''
                        }`}
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

      {/* ⏱️ Floating Rest Timer Panel */}
      <AnimatePresence>
        {timerActive && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-[280px] md:max-w-[320px] bg-[#111118]/95 backdrop-blur-2xl border border-[#00E5FF]/30 rounded-3xl p-5 shadow-[0_10px_50px_rgba(0,229,255,0.15)] flex flex-col gap-4 font-mono"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
                <span className="text-[10px] font-bold text-white tracking-widest uppercase">Rest Period</span>
              </div>
              <button 
                onClick={handleSkipTimer}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Timer Counter */}
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-4xl md:text-5xl font-bold font-mono tracking-tight text-white flex items-baseline">
                  {String(Math.floor(timerSecondsLeft / 60)).padStart(2, '0')}
                  <span className="text-[#00E5FF] animate-pulse">:</span>
                  {String(timerSecondsLeft % 60).padStart(2, '0')}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Get ready for Set {Object.values(completedSets).filter(Boolean).length + 1}!</p>
              </div>
              <button
                onClick={playRestTimerAlert}
                className="p-2 rounded-2xl bg-white/5 hover:bg-[#00E5FF]/15 text-[#00E5FF]/60 hover:text-[#00E5FF] border border-white/5 hover:border-[#00E5FF]/30 transition-all shadow-md active:scale-95 flex items-center justify-center"
                title="Test Alert Chime & Vibration"
              >
                <Volume2 className="w-5 h-5 stroke-[1.5] animate-pulse" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#00E5FF] to-[#0088FF]"
                initial={{ width: '100%' }}
                animate={{ width: `${Math.min(100, (timerSecondsLeft / 80) * 100)}%` }}
                transition={{ duration: 0.5, ease: 'linear' }}
              />
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleAdjustTimer(-30)}
                className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 font-semibold text-xs transition-all"
                title="Subtract 30 seconds"
              >
                -30s
              </button>
              <button
                onClick={handleResetTimer}
                className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 font-semibold text-xs transition-all flex items-center justify-center gap-1"
                title="Reset timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleAdjustTimer(30)}
                className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 font-semibold text-xs transition-all"
                title="Add 30 seconds"
              >
                +30s
              </button>
              <button
                onClick={handleSkipTimer}
                className="py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-xs transition-all"
                title="Skip rest"
              >
                Skip
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
