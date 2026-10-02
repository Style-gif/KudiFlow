import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, NotificationItem } from '../types';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  register: (payload: { name: string; email: string; phone: string; password: string; pin: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  quickLoginAs: (identifier: string, pass: string) => Promise<void>;
  notifications: NotificationItem[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(apiClient.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const refreshUser = useCallback(async () => {
    try {
      const res = await apiClient.getCurrentUser();
      setUser(res.user);
    } catch (err) {
      console.warn('Failed to load current user, clearing session', err);
      apiClient.clearToken();
      setToken(null);
      setUser(null);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    if (!apiClient.getToken()) return;
    try {
      const res = await apiClient.getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {
      // Ignore background notification fetch errors
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = apiClient.getToken();
      if (savedToken) {
        setToken(savedToken);
        await refreshUser();
        await refreshNotifications();
      } else {
        // Auto log in as Adaeze Okafor demo user so the app immediately shows rich, active financial state on first boot!
        try {
          const res = await apiClient.login('adaeze@kudiflow.ng', 'NaijaFlow2026!');
          setToken(res.token);
          setUser(res.user);
          await refreshNotifications();
        } catch (e) {
          console.warn('Initial demo login fallback', e);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [refreshUser, refreshNotifications]);

  const login = async (identifier: string, pass: string) => {
    const res = await apiClient.login(identifier, pass);
    setToken(res.token);
    setUser(res.user);
    await refreshNotifications();
  };

  const register = async (payload: { name: string; email: string; phone: string; password: string; pin: string }) => {
    const res = await apiClient.register(payload);
    setToken(res.token);
    setUser(res.user);
    await refreshNotifications();
  };

  const logout = () => {
    apiClient.clearToken();
    setToken(null);
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
  };

  const quickLoginAs = async (identifier: string, pass: string) => {
    setIsLoading(true);
    try {
      await login(identifier, pass);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await apiClient.markNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        quickLoginAs,
        notifications,
        unreadCount,
        refreshNotifications,
        markAllNotificationsRead
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
