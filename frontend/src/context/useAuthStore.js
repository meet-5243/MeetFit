import { create } from 'zustand';
import api from '../api/axios';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('meetfit_user')) || null,
  token: localStorage.getItem('meetfit_token') || null,
  loading: false,
  error: null,
  unit: localStorage.getItem('meetfit_unit') || 'kg',

  setUnit: (newUnit) => {
    localStorage.setItem('meetfit_unit', newUnit);
    set({ unit: newUnit });
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { accessToken, ...userData } = res.data;
      
      localStorage.setItem('meetfit_token', accessToken);
      localStorage.setItem('meetfit_user', JSON.stringify(userData));
      
      set({ user: userData, token: accessToken, loading: false });
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || (err.message === 'Network Error' ? 'Cannot connect to backend server on port 5000' : 'Registration failed');
      set({ error: msg, loading: false });
      return false;
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { accessToken, ...userData } = res.data;
      
      localStorage.setItem('meetfit_token', accessToken);
      localStorage.setItem('meetfit_user', JSON.stringify(userData));
      
      set({ user: userData, token: accessToken, loading: false });
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || (err.message === 'Network Error' ? 'Cannot connect to backend server on port 5000' : 'Invalid email or password');
      set({ error: msg, loading: false });
      return false;
    }
  },

  updateProfile: async (name, email, unit) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put('/auth/profile', { name, email, unit });
      const updatedUser = { ...get().user, ...res.data };
      
      localStorage.setItem('meetfit_user', JSON.stringify(updatedUser));
      if (unit) {
        localStorage.setItem('meetfit_unit', unit);
      }
      
      set({ user: updatedUser, unit: unit || get().unit, loading: false });
      return { success: true, message: 'Profile updated successfully!' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  updatePassword: async (currentPassword, newPassword) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put('/auth/password', { currentPassword, newPassword });
      set({ loading: false });
      return { success: true, message: res.data.message || 'Password updated successfully!' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password';
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem('meetfit_token');
      localStorage.removeItem('meetfit_user');
      set({ user: null, token: null });
    }
  },

  fetchMe: async () => {
    if (!get().token) return;
    try {
      const res = await api.get('/auth/me');
      localStorage.setItem('meetfit_user', JSON.stringify(res.data));
      set({ user: res.data });
    } catch (e) {
      get().logout();
    }
  }
}));
