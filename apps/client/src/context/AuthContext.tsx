import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api, setOnUnauthorizedCallback } from '../api/client';
import { IUser, UserStats, RegisterInput, LoginInput } from '@anti-oj/shared';

const TAB_ID = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

interface AuthContextType {
  user: IUser | null;
  stats: UserStats | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  notifyStatsUpdated: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const activeSessionIdRef = useRef<number>(0);

  const refreshUser = useCallback(async () => {
    const currentSessionId = ++activeSessionIdRef.current;
    try {
      const res = await api.get('/auth/me');
      if (activeSessionIdRef.current === currentSessionId && res.data.success) {
        setUser(res.data.data.user);
        setStats(res.data.data.stats);
      }
    } catch {
      if (activeSessionIdRef.current === currentSessionId) {
        setUser(null);
        setStats(null);
      }
    } finally {
      if (activeSessionIdRef.current === currentSessionId) {
        setLoading(false);
      }
    }
  }, []);

  const notifyStatsUpdated = useCallback(() => {
    refreshUser();
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('anti-oj-sync');
        bc.postMessage({ type: 'STATS_UPDATED', senderId: TAB_ID, timestamp: Date.now() });
        bc.close();
      }
      localStorage.setItem('anti-oj-last-ac-time', String(Date.now()));
    } catch {}
  }, [refreshUser]);

  // Hook 401 unauthorized responses to clear stale auth and open login modal (Issue H-3)
  useEffect(() => {
    setOnUnauthorizedCallback(() => {
      setUser(null);
      setStats(null);
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
    });

    return () => {
      setOnUnauthorizedCallback(null);
    };
  }, []);

  // Initial fetch and cross-tab synchronization
  useEffect(() => {
    refreshUser();

    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('anti-oj-sync');
        channel.onmessage = (event) => {
          // High 5: Avoid self-messaging in the origin tab
          if (event.data?.type === 'STATS_UPDATED' && event.data?.senderId !== TAB_ID) {
            refreshUser();
          }
        };
      }
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'anti-oj-last-ac-time') {
        refreshUser();
      }
    };

    let lastFocusRefresh = 0;
    const FOCUS_COOLDOWN_MS = 30000; // Low 4: 30s minimum cooldown on window focus
    const handleFocus = () => {
      const now = Date.now();
      if (now - lastFocusRefresh >= FOCUS_COOLDOWN_MS) {
        lastFocusRefresh = now;
        refreshUser();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleFocus);

    return () => {
      if (channel) {
        try {
          channel.close();
        } catch {}
      }
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshUser]);

  const login = useCallback(async (input: LoginInput) => {
    const currentSessionId = ++activeSessionIdRef.current;
    const res = await api.post('/auth/login', input);
    if (res.data.success) {
      if (activeSessionIdRef.current === currentSessionId) {
        setUser(res.data.data.user);
        setIsAuthModalOpen(false);
      }
      try {
        const meRes = await api.get('/auth/me');
        if (activeSessionIdRef.current === currentSessionId && meRes.data.success) {
          setStats(meRes.data.data.stats);
        }
      } catch {}
    }
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const currentSessionId = ++activeSessionIdRef.current;
    const res = await api.post('/auth/register', input);
    if (res.data.success) {
      if (activeSessionIdRef.current === currentSessionId) {
        setUser(res.data.data.user);
        setIsAuthModalOpen(false);
      }
      try {
        const meRes = await api.get('/auth/me');
        if (activeSessionIdRef.current === currentSessionId && meRes.data.success) {
          setStats(meRes.data.data.stats);
        }
      } catch {}
    }
  }, []);

  const logout = useCallback(async () => {
    activeSessionIdRef.current++;
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

  const isAdmin = Boolean(user && user.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        stats,
        loading,
        isAdmin,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        refreshUser,
        notifyStatsUpdated,
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
