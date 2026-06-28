import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, CheckCircle2, AlertCircle, ShieldCheck, Dumbbell, Save } from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';

export default function Profile() {
  const { user, unit, updateProfile, updatePassword } = useAuthStore();

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [selectedUnit, setSelectedUnit] = useState(unit || 'kg');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null);

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileStatus(null);

    const res = await updateProfile(name, email, selectedUnit);
    setProfileStatus(res);
    setProfileLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordStatus(null);

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ success: false, message: 'New passwords do not match' });
      setPasswordLoading(false);
      return;
    }

    const res = await updatePassword(currentPassword, newPassword);
    setPasswordStatus(res);
    setPasswordLoading(false);
    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'MF';

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-6 bg-[#111118]/80 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#00E5FF] to-[#0088FF] flex items-center justify-center text-[#0A0A0F] font-display font-extrabold text-3xl shadow-accentGlow shrink-0">
          {initials}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] text-xs font-mono font-bold border border-[#00E5FF]/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Athlete
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white tracking-wide">
            {user?.name || 'Athlete Profile'}
          </h1>
          <p className="text-gray-400 text-sm">{user?.email}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. Edit Personal Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#111118]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">Personal Information</h3>
                <p className="text-xs text-gray-400">Update your account name and email address</p>
              </div>
            </div>

            {profileStatus && (
              <div
                className={`p-4 rounded-2xl mb-6 flex items-center gap-3 text-xs font-semibold ${
                  profileStatus.success
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                }`}
              >
                {profileStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {profileStatus.message}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-4 top-3.5 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-4 top-3.5 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Preferred Weight Unit</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedUnit('kg')}
                    className={`py-3 rounded-2xl font-mono font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                      selectedUnit === 'kg'
                        ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] shadow-accentGlow'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Dumbbell className="w-4 h-4" /> Kilograms (kg)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedUnit('lbs')}
                    className={`py-3 rounded-2xl font-mono font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                      selectedUnit === 'lbs'
                        ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] shadow-accentGlow'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Dumbbell className="w-4 h-4" /> Pounds (lbs)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#0088FF] text-[#0A0A0F] font-bold text-sm shadow-accentGlow hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </motion.div>

        {/* 2. Security & Password Update */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111118]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#FF6B35]/10 border border-[#FF6B35]/30 flex items-center justify-center text-[#FF6B35]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">Security & Password</h3>
                <p className="text-xs text-gray-400">Ensure your account uses a strong password</p>
              </div>
            </div>

            {passwordStatus && (
              <div
                className={`p-4 rounded-2xl mb-6 flex items-center gap-3 text-xs font-semibold ${
                  passwordStatus.success
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                }`}
              >
                {passwordStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {passwordStatus.message}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Current Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-3.5 text-gray-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase mb-2">New Password (min 8 chars)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-3.5 text-gray-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-3.5 text-gray-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-white text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full mt-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/10 font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-[#FF6B35]" />
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
