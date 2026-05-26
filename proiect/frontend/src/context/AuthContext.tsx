import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, startTransition, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { authApi } from '@/api/services';
import type { User } from '@/types';

const STORAGE_KEY = 'focusflow.auth';

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function hydrate() {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(raw) as { token: string; user: User };
        setToken(parsed.token);
        setUser(parsed.user);
        const me = await authApi.me(parsed.token);
        startTransition(() => {
          setUser(me.user);
        });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token: parsed.token, user: me.user }));
      } catch {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    hydrate();
  }, []);

  async function persist(nextToken: string, nextUser: User) {
    setToken(nextToken);
    setUser(nextUser);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
  }

  async function login(email: string, password: string) {
    const response = await authApi.login({ email, password });
    await persist(response.token, response.user);
  }

  async function register(name: string, email: string, password: string) {
    await authApi.register({ name, email, password });
    await login(email, password);
  }

  async function logout() {
    if (token) {
      try {
        await authApi.logout(token);
      } catch {
        // Prefer local logout even if the backend call fails.
      }
    }

    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  async function refreshUser() {
    if (!token) {
      return;
    }

    const response = await authApi.me(token);
    setUser(response.user);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user: response.user }));
  }

  const value = useMemo<AuthState>(() => ({
    token,
    user,
    loading,
    login,
    register,
    logout,
    refreshUser
  }), [loading, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
