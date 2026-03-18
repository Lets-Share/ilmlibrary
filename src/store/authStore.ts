import { create } from 'zustand';
import { User } from 'firebase/auth';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  savedBooks: string[];
  readingProgress: Record<string, number>;
  bookmarks?: Record<string, number[]>;
  theme: 'light' | 'dark';
  createdAt: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAuthReady: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setAuthReady: (isReady: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isAuthReady: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setAuthReady: (isReady) => set({ isAuthReady: isReady }),
}));
