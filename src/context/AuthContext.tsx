import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { User } from '../types/Product';

interface RegisterData {
  full_name: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = '@football_boots_user';
const STORAGE_KEY_TOKEN = '@football_boots_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(STORAGE_KEY_USER);
      const storedToken = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);

      if (storedUser && storedToken) {
        const parsed = JSON.parse(storedUser);
        // Normalize role to lowercase
        parsed.role = (parsed.role || 'customer').toLowerCase();
        setUser(parsed);
      }
    } catch (e) {
      console.error('Failed to load auth status from storage:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.login(username, password);
      if (res.success && res.user && res.token) {
        const normalizedUser: User = {
          ...res.user,
          role: (res.user.role || 'customer').toLowerCase() as any,
          name: res.user.full_name || res.user.name || res.user.username,
        };

        setUser(normalizedUser);
        await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(normalizedUser));
        await AsyncStorage.setItem(STORAGE_KEY_TOKEN, res.token);
        return normalizedUser;
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      if (res.success && res.user && res.token) {
        const normalizedUser: User = {
          ...res.user,
          role: 'customer',
          name: res.user.full_name || res.user.username,
        };

        setUser(normalizedUser);
        await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(normalizedUser));
        await AsyncStorage.setItem(STORAGE_KEY_TOKEN, res.token);
        return normalizedUser;
      } else {
        throw new Error(res.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<User> => {
    if (!user) throw new Error('No user logged in');
    try {
      const res = await api.updateUser(user.id, data);
      const updated: User = {
        ...user,
        ...res.user,
        name: res.user.full_name || res.user.name || user.username,
      };
      setUser(updated);
      await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
      return updated;
    } catch (err: any) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem(STORAGE_KEY_USER);
      await AsyncStorage.removeItem(STORAGE_KEY_TOKEN);
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const isAdmin = !!user && user.role.toLowerCase() === 'admin';
  const isCustomer = !!user && user.role.toLowerCase() === 'customer';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isAdmin,
        isCustomer,
        login,
        register,
        logout,
        updateProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
