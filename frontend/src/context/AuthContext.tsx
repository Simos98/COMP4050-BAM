import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/auth';
import type { User } from '../types';

type Context = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<User | null>;
};

const AuthContext = createContext<Context | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async (): Promise<User | null> => {
    try {
      setLoading(true);
      const u = await authService.me();
      setUser(u ?? null);
      return u ?? null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUser();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    await authService.login(username, password);
    const u = await fetchUser();
    return !!u;
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): Context => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
