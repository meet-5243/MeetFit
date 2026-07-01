import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, ChevronDown, ChevronUp, FileText, Dumbbell, Flame, Shield, Zap, Activity, Target, Award, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../context/useAuthStore';
import api from '../../api/axios';
import { exportCustomPDF } from '../../utils/exportUtils';

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

export default function ExportPDFModal({ isOpen, onClose }) {
  const { user, unit } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // Lists from server
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [sessions, setSessions] = useState([]);

  // Selections
  const [dateRange, setDateRange] = useState('all'); // '7d', '30d', '90d', '365d', 'all'
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    const fetchAllData = async () => {
      setDataLoading(true);
      try {
        const [mgRes, exRes, sRes] = await Promise.all([
          api.get('/muscle-groups'),
          api.get('/exercises'),
          api.get('/sessions?limit=1000')
        ]);
        setMuscleGroups(mgRes.data);
        setExercises(exRes.data);
        setSessions(sRes.data);
      } catch (err) {
        console.error('Failed to fetch report customization data', err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchAllData();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleMuscleGroup = (mgId) => {
    setSelectedMuscleGroups((prev) => {
      if (prev.includes(mgId)) {
        return prev.filter((id) => id !== mgId);
      } else {
        return [...prev, mgId];
      }
    });
  };

  const handleToggleExercise = (exId) => {
    setSelectedExercises((prev) => {
      if (prev.includes(exId)) {
        return prev.filter((id) => id !== exId);
      } else {
        return [...prev, exId];
      }
    });
  };

  const toggleExpandGroup = (mgId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [mgId]: !prev[mgId]
    }));
  };

  const handleSelectAll = (select) => {
    if (select) {
      setSelectedMuscleGroups(muscleGroups.map((g) => g._id));
      setSelectedExercises(exercises.map((e) => e._id));
    } else {
      setSelectedMuscleGroups([]);
      setSelectedExercises([]);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      await exportCustomPDF(
        user?.name || 'Athlete',
        unit || 'kg',
        dateRange,
        selectedMuscleGroups,
        selectedExercises,
        sessions,
        muscleGroups
      );
      onClose();
    } catch (err) {
      console.error('Error generating custom report', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0A0A0F]/80 backdrop-blur-md"
        />

        {/* Modal content wrapper */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-2xl bg-[#111118]/95 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">Custom PDF Report Builder</h3>
                <p className="text-xs text-gray-400">Design your personalized workout report</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {dataLoading ? (
            <div className="flex-1 py-20 flex flex-col items-center justify-center text-gray-400 gap-3 font-mono text-sm">
              <Loader2 className="w-8 h-8 text-[#00E5FF] animate-spin" />
              <span>Fetching your workout records...</span>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Date Range Selector */}
              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" /> Select Date Range
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: '7d', label: '7 Days' },
                    { id: '30d', label: '30 Days' },
                    { id: '90d', label: '90 Days' },
                    { id: '365d', label: '1 Year' },
                    { id: 'all', label: 'All Time' },
                  ].map((range) => (
                    <button
                      key={range.id}
                      type="button"
                      onClick={() => setDateRange(range.id)}
                      className={`py-2 rounded-xl text-center font-mono font-bold text-xs border transition-all ${
                        dateRange === range.id
                          ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] shadow-accentGlow'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selection Controls */}
              <div className="flex items-center justify-between border-t border-b border-white/5 py-3">
                <span className="text-xs text-gray-400 font-mono">
                  {selectedMuscleGroups.length} Muscle Groups, {selectedExercises.length} Exercises selected
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectAll(true)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-[10px] font-mono font-semibold text-gray-300 hover:text-white transition-all"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectAll(false)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-[10px] font-mono font-semibold text-gray-300 hover:text-white transition-all"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Muscle Groups Accordion Checklist */}
              <div className="space-y-3">
                <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-1">
                  Muscle Groups & Exercises
                </label>

                {muscleGroups.length === 0 ? (
                  <p className="text-sm text-gray-500 font-mono">No muscle groups synced.</p>
                ) : (
                  muscleGroups.map((group) => {
                    const groupExercises = exercises.filter((e) => e.muscleGroupId === group._id);
                    const isExpanded = !!expandedGroups[group._id];
                    const isSelected = selectedMuscleGroups.includes(group._id);
                    const IconComp = ICON_MAP[group.icon] || Flame;

                    return (
                      <div
                        key={group._id}
                        className="bg-[#181824]/40 border border-white/5 rounded-2xl overflow-hidden transition-all hover:border-white/10"
                      >
                        {/* Muscle Group Header */}
                        <div className="flex items-center justify-between p-4 gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Muscle Group Selector */}
                            <label className="relative flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleMuscleGroup(group._id)}
                                className="sr-only peer"
                              />
                              <div className="w-5 h-5 rounded bg-white/5 border border-white/20 peer-checked:bg-[#00E5FF] peer-checked:border-[#00E5FF] flex items-center justify-center transition-colors">
                                <svg
                                  className="w-3.5 h-3.5 text-black font-bold hidden peer-checked:block"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="3"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            </label>

                            {/* Icon & Name */}
                            <div className="w-8 h-8 rounded-xl bg-[#00E5FF]/5 border border-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF] shrink-0">
                              <IconComp className="w-4 h-4" />
                            </div>

                            <div className="truncate">
                              <span className="font-display font-bold text-sm text-white hover:text-[#00E5FF] cursor-pointer" onClick={() => toggleExpandGroup(group._id)}>
                                {group.name}
                              </span>
                              <span className="text-[10px] text-gray-500 font-mono ml-2">
                                ({groupExercises.length} Exercises)
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleExpandGroup(group._id)}
                            className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Exercises List (Expanded) */}
                        {isExpanded && (
                          <div className="bg-[#111118]/50 border-t border-white/5 p-4 space-y-3">
                            {groupExercises.length === 0 ? (
                              <p className="text-xs text-gray-500 font-mono italic pl-8">
                                No exercises added yet for this muscle group.
                              </p>
                            ) : (
                              groupExercises.map((ex) => {
                                const isExSelected = selectedExercises.includes(ex._id);
                                return (
                                  <div
                                    key={ex._id}
                                    className="flex items-start gap-3 pl-8 py-1"
                                  >
                                    {/* Exercise Selector */}
                                    <label className="relative flex items-center cursor-pointer mt-0.5">
                                      <input
                                        type="checkbox"
                                        checked={isExSelected}
                                        onChange={() => handleToggleExercise(ex._id)}
                                        className="sr-only peer"
                                      />
                                      <div className="w-4 h-4 rounded bg-white/5 border border-white/20 peer-checked:bg-[#0088FF] peer-checked:border-[#0088FF] flex items-center justify-center transition-colors">
                                        <svg
                                          className="w-3 h-3 text-white font-bold hidden peer-checked:block"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="3"
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                      </div>
                                    </label>

                                    <div className="min-w-0">
                                      <span
                                        onClick={() => handleToggleExercise(ex._id)}
                                        className={`text-xs font-semibold cursor-pointer ${
                                          isExSelected ? 'text-white' : 'text-gray-400'
                                        }`}
                                      >
                                        {ex.name}
                                      </span>
                                      {ex.notes && (
                                        <p className="text-[10px] text-gray-500 truncate max-w-md">
                                          {ex.notes}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-[#111118]/80">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-gray-400 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerateReport}
              disabled={loading || dataLoading || (selectedMuscleGroups.length === 0 && selectedExercises.length === 0)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#0088FF] text-[#0A0A0F] font-bold text-xs shadow-accentGlow hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Report PDF
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
