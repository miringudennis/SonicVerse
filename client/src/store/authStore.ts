import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

export interface LinkedAccount {
  platform: 'spotify' | 'youtube' | 'apple';
  username: string;
  connectedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  linkedAccounts: LinkedAccount[];
  setAuth: (user: User, token: string) => void;
  linkAccount: (account: LinkedAccount) => void;
  unlinkAccount: (platform: string) => void;
  logout: () => void;
}

const getStoredUser = () => {
  const user = localStorage.getItem('user');
  if (user === 'undefined' || !user) return null;
  try {
    return JSON.parse(user);
  } catch (e) {
    return null;
  }
};

const getStoredLinks = (): LinkedAccount[] => {
  const links = localStorage.getItem('linkedAccounts');
  if (!links) return [];
  try {
    return JSON.parse(links);
  } catch (e) {
    return [];
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem('token'),
  linkedAccounts: getStoredLinks(),
  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token });
  },
  linkAccount: (account) => set((state) => {
    const next = [...state.linkedAccounts.filter(a => a.platform !== account.platform), account];
    localStorage.setItem('linkedAccounts', JSON.stringify(next));
    return { linkedAccounts: next };
  }),
  unlinkAccount: (platform) => set((state) => {
    const next = state.linkedAccounts.filter(a => a.platform !== platform);
    localStorage.setItem('linkedAccounts', JSON.stringify(next));
    return { linkedAccounts: next };
  }),
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('linkedAccounts');
    set({ user: null, token: null, linkedAccounts: [] });
  },
}));
