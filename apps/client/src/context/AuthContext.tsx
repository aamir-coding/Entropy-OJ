import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api, setOnUnauthorizedCallback } from '../api/client';
import { IUser, UserStats, RegisterInput, LoginInput } from '@entropy-oj/shared';

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
  const [user, setUser] = useState<IUser | null>(() => {
    try {
      const savedUser = typeof window !== 'undefined' ? localStorage.getItem('entropy-user') : null;
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const activeSessionIdRef = useRef<number>(0);

  const updateStoredUser = (newUser: IUser | null) => {
    setUser(newUser);
    try {
      if (newUser) {
        localStorage.setItem('entropy-user', JSON.stringify(newUser));
      } else {
        localStorage.removeItem('entropy-user');
      }
    } catch {}
  };

  const refreshUser = useCallback(async () => {
    const currentSessionId = ++activeSessionIdRef.current;
    try {
      const res = await api.get('/auth/me');
      if (activeSessionIdRef.current === currentSessionId && res.data.success) {
        updateStoredUser(res.data.data.user);
        setStats(res.data.data.stats);
      }
    } catch {
      if (activeSessionIdRef.current === currentSessionId) {
        updateStoredUser(null);
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
        const bc = new BroadcastChannel('entropy-oj-sync');
        bc.postMessage({ type: 'STATS_UPDATED', senderId: TAB_ID, timestamp: Date.now() });
        bc.close();
      }
      localStorage.setItem('entropy-oj-last-ac-time', String(Date.now()));
    } catch {}
  }, [refreshUser]);

  // Hook 401 unauthorized responses to clear stale auth and open login modal (Issue H-3)
  useEffect(() => {
    setOnUnauthorizedCallback(() => {
      try {
        localStorage.removeItem('entropy-token');
        localStorage.removeItem('entropy-user');
      } catch {}
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
        channel = new BroadcastChannel('entropy-oj-sync');
        channel.onmessage = (event) => {
          // High 5: Avoid self-messaging in the origin tab
          if (event.data?.type === 'STATS_UPDATED' && event.data?.senderId !== TAB_ID) {
            refreshUser();
          }
        };
      }
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'entropy-oj-last-ac-time') {
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
      if (res.data.data?.token) {
        try {
          localStorage.setItem('entropy-token', res.data.data.token);
        } catch {}
      }
      if (activeSessionIdRef.current === currentSessionId && res.data.data?.user) {
        updateStoredUser(res.data.data.user);
      }
      // Non-blocking stats synchronization in background (does not delay modal dismissal)
      api.get('/auth/me')
        .then((meRes) => {
          if (activeSessionIdRef.current === currentSessionId && meRes.data?.success) {
            setStats(meRes.data.data.stats);
          }
        })
        .catch(() => {});
    }
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const currentSessionId = ++activeSessionIdRef.current;
    const res = await api.post('/auth/register', input);
    if (res.data.success) {
      if (res.data.data?.token) {
        try {
          localStorage.setItem('entropy-token', res.data.data.token);
        } catch {}
      }
      if (activeSessionIdRef.current === currentSessionId && res.data.data?.user) {
        updateStoredUser(res.data.data.user);
        setStats({
          totalSubmissions: 0,
          acceptedSubmissions: 0,
          solvedProblemsCount: 0,
          easySolved: 0,
          mediumSolved: 0,
          hardSolved: 0,
          acceptanceRate: 0,
        });
      }
      // Non-blocking background sync
      api.get('/auth/me')
        .then((meRes) => {
          if (activeSessionIdRef.current === currentSessionId && meRes.data?.success) {
            setStats(meRes.data.data.stats);
          }
        })
        .catch(() => {});
    }
  }, []);

  const logout = useCallback(async () => {
    activeSessionIdRef.current++;
    try {
      localStorage.removeItem('entropy-token');
      localStorage.removeItem('entropy-user');
    } catch {}
    try {
      await api.post('/auth/logout');
    } finally {
      updateStoredUser(null);
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
