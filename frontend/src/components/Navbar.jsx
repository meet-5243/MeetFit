import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dumbbell, LayoutDashboard, Flame, LogOut, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../context/useAuthStore';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, unit, setUnit } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#0088FF] p-0.5 shadow-accentGlow group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0A0A0F] rounded-[10px] flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-[#00E5FF]" />
            </div>
          </div>
          <span className="font-display text-2xl font-bold tracking-wider text-white">
            MEET<span className="text-[#00E5FF]">FIT</span>
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#111118]/80 p-1.5 rounded-2xl border border-white/5">
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              location.pathname === '/dashboard'
                ? 'bg-[#00E5FF] text-[#0A0A0F] shadow-accentGlow'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            to="/muscles"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              isActive('/muscles')
                ? 'bg-[#00E5FF] text-[#0A0A0F] shadow-accentGlow'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Flame className="w-4 h-4" />
            Muscle Groups
          </Link>
        </nav>

        {/* Actions & Profile */}
        <div className="flex items-center gap-3">
          {/* Unit Toggle */}
          <div className="flex items-center bg-[#111118] border border-white/10 rounded-xl p-1 text-xs font-mono">
            <button
              onClick={() => setUnit('kg')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                unit === 'kg' ? 'bg-[#00E5FF] text-[#0A0A0F]' : 'text-gray-400 hover:text-white'
              }`}
            >
              KG
            </button>
            <button
              onClick={() => setUnit('lbs')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                unit === 'lbs' ? 'bg-[#00E5FF] text-[#0A0A0F]' : 'text-gray-400 hover:text-white'
              }`}
            >
              LBS
            </button>
          </div>

          {/* User badge */}
          <div className="hidden sm:flex items-center gap-2 bg-[#111118] border border-white/10 px-3 py-1.5 rounded-xl">
            <UserIcon className="w-4 h-4 text-[#00E5FF]" />
            <span className="text-xs font-semibold text-gray-200">{user?.name || 'Athlete'}</span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-2.5 rounded-xl bg-[#111118] border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
