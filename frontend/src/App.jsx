import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedLayout from './components/ProtectedLayout';
import Dashboard from './pages/Dashboard';
import MuscleGroups from './pages/MuscleGroups';
import MuscleGroupDetail from './pages/MuscleGroupDetail';
import ExerciseDetail from './pages/ExerciseDetail';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Application Routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/muscles" element={<MuscleGroups />} />
          <Route path="/muscles/:groupId" element={<MuscleGroupDetail />} />
          <Route path="/muscles/:groupId/exercises/:exerciseId" element={<ExerciseDetail />} />
        </Route>

        {/* Default Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
