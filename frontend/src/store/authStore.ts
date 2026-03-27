import { create } from 'zustand';
import type { User } from '../types';
import client from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPendingVerification: boolean;
  pendingEmail: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setPendingVerification: (isPending: boolean, email?: string | null) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateMe: (updates: Partial<User>) => void;
  verifyOtp: (code: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: true,
  isPendingVerification: false,
  pendingEmail: null,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token, isAuthenticated: !!token });
  },
  setPendingVerification: (isPending, email = null) => 
    set({ isPendingVerification: isPending, pendingEmail: email }),
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, isPendingVerification: false, pendingEmail: null });
  },
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const response = await client.get('/auth/me');
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
  updateMe: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },
  verifyOtp: async (code) => {
    const { pendingEmail } = get();
    if (!pendingEmail) throw new Error('No pending email found');

    const response = await client.post('/auth/verify-otp', {
      email: pendingEmail,
      code,
    });

    const { accessToken, user } = response.data;
    localStorage.setItem('token', accessToken);
    set({ 
      user, 
      token: accessToken, 
      isAuthenticated: true, 
      isPendingVerification: false, 
      pendingEmail: null 
    });
  },
}));
