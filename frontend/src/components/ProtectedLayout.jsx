import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../context/useAuthStore';
import Navbar from './Navbar';

export default function ProtectedLayout() {
  const { token, fetchMe } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F] text-[#F0F0F5] relative selection:bg-[#00E5FF]/30">
      <Navbar />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
