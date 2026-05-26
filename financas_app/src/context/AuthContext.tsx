import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehidrata sessão ao abrir o app
  useEffect(() => {
    async function loadSession() {
      const stored = await AsyncStorage.getItem('@FinancasApp:user');
      if (stored) setUser(JSON.parse(stored));
      setLoading(false);
    }
    loadSession();
  }, []);

  async function signIn(email: string, password: string): Promise<boolean> {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      await AsyncStorage.setItem('@FinancasApp:token', data.token);
      await AsyncStorage.setItem('@FinancasApp:user', JSON.stringify(data.user));
      setUser(data.user);
      return true;
    } catch {
      return false;
    }
  }

  async function signUp(name: string, email: string, password: string): Promise<boolean> {
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      await AsyncStorage.multiSet([
        ['@FinancasApp:token', data.token],
        ['@FinancasApp:user', JSON.stringify(data.user)],
      ]);
      setUser(data.user);
      return true;
    } catch {
      return false;
    }
  }

  async function signOut() {
    await AsyncStorage.multiRemove(['@FinancasApp:token', '@FinancasApp:user']);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
