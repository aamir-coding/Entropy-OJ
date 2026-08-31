import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { IUser, UserStats, RegisterInput, LoginInput } from '@anti-oj/shared';

interface AuthContextType {
  user: IUser | null;
  stats: UserStats | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data.user);
        setStats(res.data.data.stats);
      }
    } catch {
      setUser(null);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (input: LoginInput) => {
    const res = await api.post('/auth/login', input);
    if (res.data.success) {
      setUser(res.data.data.user);
      setIsAuthModalOpen(false);
      // Asynchronously fetch stats
      api.get('/auth/me').then((meRes) => {
        if (meRes.data.success) {
          setStats(meRes.data.data.stats);
        }
      }).catch(() => {});
    }
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const res = await api.post('/auth/register', input);
    if (res.data.success) {
      setUser(res.data.data.user);
      setIsAuthModalOpen(false);
      api.get('/auth/me').then((meRes) => {
        if (meRes.data.success) {
          setStats(meRes.data.data.stats);
        }
      }).catch(() => {});
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      setStats(null);
    }
  }, []);

  const openAuthModal = useCallback((mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        stats,
        loading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
