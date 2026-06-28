import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, ChevronLeft, Dumbbell, Calendar, Activity, X, Check, AlertTriangle } from 'lucide-react';
import api from '../api/axios';

export default function MuscleGroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupInfo, setGroupInfo] = useState(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExNotes, setNewExNotes] = useState('');
  
  const [editExId, setEditExId] = useState(null);
  const [editExName, setEditExName] = useState('');
  const [editExNotes, setEditExNotes] = useState('');

  const [deleteExId, setDeleteExId] = useState(null);

  const fetchData = async () => {
    try {
      const [groupsRes, exRes] = await Promise.all([
        api.get('/muscle-groups'),
        api.get(`/exercises?muscleGroupId=${groupId}`),
      ]);

      const foundGroup = groupsRes.data.find((g) => g._id === groupId);
      setGroupInfo(foundGroup);
      setExercises(exRes.data);
    } catch (e) {
      console.error('Failed to load exercise details', e);
    } fontSettled: {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const handleCreateExercise = async (e) => {
    e.preventDefault();
    if (!newExName.trim()) return;
    try {
      await api.post('/exercises', {
        muscleGroupId: groupId,
        name: newExName,
        notes: newExNotes,
      });
      setNewExName('');
      setNewExNotes('');
      setIsAddModalOpen(false);
      fetchData();
    } catch (e) {
      console.error('Error creating exercise', e);
    }
  };

  const handleUpdateExercise = async (e) => {
    e.preventDefault();
    if (!editExId || !editExName.trim()) return;
    try {
      await api.put(`/exercises/${editExId}`, {
        name: editExName,
        notes: editExNotes,
      });
      setEditExId(null);
      fetchData();
    } catch (e) {
      console.error('Error updating exercise', e);
    }
  };

  const handleDeleteExercise = async () => {
    if (!deleteExId) return;
    try {
      await api.delete(`/exercises/${deleteExId}`);
      setDeleteExId(null);
      fetchData();
    } catch (e) {
      console.error('Error deleting exercise', e);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="h-10 w-64 bg-white/5 rounded-xl animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-3xl glass-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 md:py-12">
      {/* Back button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link to="/muscles" className="inline-flex items-center gap-1 text-xs font-mono text-[#00E5FF] hover:underline mb-2">
            <ChevronLeft className="w-4 h-4" /> Back to Muscle Groups
          </Link>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white tracking-wide">
            {groupInfo ? groupInfo.name : 'Muscle Group'} Exercises
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage exercises and view detailed progression history.</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#0088FF] text-[#0A0A0F] font-bold text-sm shadow-accentGlow hover:scale-105 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-5 h-5" /> Add Exercise
        </button>
      </div>

      {/* Exercises List */}
      {exercises.length === 0 ? (
        <div className="w-full py-16 text-center rounded-3xl glass-card border border-white/10">
          <Dumbbell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-1">No exercises yet</h3>
          <p className="text-sm text-gray-400 mb-6">Add your first exercise for {groupInfo?.name} to begin logging sets!</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#00E5FF]/20 text-[#00E5FF] font-semibold text-sm hover:bg-[#00E5FF]/30 transition-colors"
          >
            ＋ Add Exercise
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((ex) => (
            <motion.div
              key={ex._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-[#111118]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 glass-card-hover relative flex flex-col justify-between shadow-xl"
            >
              <div>
                {/* Header & Actions */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div
                    onClick={() => navigate(`/muscles/${groupId}/exercises/${ex._id}`)}
                    className="cursor-pointer flex-1"
                  >
                    <h3 className="font-display text-2xl font-bold text-white group-hover:text-[#00E5FF] transition-colors">
                      {ex.name}
                    </h3>
                    {ex.notes && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{ex.notes}</p>}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditExId(ex._id);
                        setEditExName(ex.name);
                        setEditExNotes(ex.notes || '');
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      title="Edit Exercise"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteExId(ex._id)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete Exercise"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Footer Metrics */}
              <div
                onClick={() => navigate(`/muscles/${groupId}/exercises/${ex._id}`)}
                className="cursor-pointer mt-6 pt-4 border-t border-white/5 space-y-2 text-xs font-mono"
              >
                <div className="flex items-center justify-between text-gray-400">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" /> Sessions Logged:
                  </span>
                  <span className="text-white font-bold">{ex.totalSessions}</span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>Last Best Set:</span>
                  <span className="text-[#00E5FF] font-bold">{ex.lastSessionBestSet}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 1. Add Exercise Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#111118] border border-white/10 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-2xl font-bold text-white">Add New Exercise</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateExercise} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Exercise Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Incline Barbell Press"
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl glass-input text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Optional Notes / Form Cue</label>
                  <textarea
                    rows={3}
                    placeholder="Focus on controlled 3-second eccentric..."
                    value={newExNotes}
                    onChange={(e) => setNewExNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl glass-input text-white text-sm resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#0088FF] text-[#0A0A0F] font-bold text-sm shadow-accentGlow"
                >
                  Save Exercise
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Edit Exercise Modal */}
      <AnimatePresence>
        {editExId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#111118] border border-white/10 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-2xl font-bold text-white">Edit Exercise</h3>
                <button onClick={() => setEditExId(null)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateExercise} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Exercise Name</label>
                  <input
                    type="text"
                    required
                    value={editExName}
                    onChange={(e) => setEditExName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl glass-input text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Notes</label>
                  <textarea
                    rows={3}
                    value={editExNotes}
                    onChange={(e) => setEditExNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl glass-input text-white text-sm resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#0088FF] text-[#0A0A0F] font-bold text-sm shadow-accentGlow"
                >
                  Update Exercise
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteExId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-[#111118] border border-red-500/30 rounded-3xl p-6 shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">Delete Exercise?</h3>
              <p className="text-xs text-gray-400 mb-6">
                This action cannot be undone. All recorded sessions and sets for this exercise will be permanently deleted.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDeleteExId(null)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteExercise}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-lg"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
