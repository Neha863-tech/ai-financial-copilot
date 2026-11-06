import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/auth';
import {
  loginUser,
  registerUser,
  requestOTP as apiRequestOTP,
  verifyOTP as apiVerifyOTP,
  getMyProfile,
} from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<User>;
  register: (payload: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    whatsappOptIn?: boolean;
  }) => Promise<User>;
  logout: () => void;
  requestOTP: (target: string, targetType: 'email' | 'phone', purpose?: string) => Promise<any>;
  verifyOTP: (target: string, otp: string, purpose?: string) => Promise<any>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'trustcart_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await getMyProfile(token);
        setUser(profile);
      } catch (err) {
        console.warn('Failed to load profile with stored token:', err);
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email: string, pass: string): Promise<User> => {
    const res = await loginUser({ email, password: pass });
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
    setIsAuthModalOpen(false);
    return res.user;
  };

  const register = async (payload: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    whatsappOptIn?: boolean;
  }): Promise<User> => {
    const res = await registerUser(payload);
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
    setIsAuthModalOpen(false);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const requestOTP = async (target: string, targetType: 'email' | 'phone', purpose: string = 'verification') => {
    return await apiRequestOTP({ target, targetType, purpose });
  };

  const verifyOTP = async (target: string, otp: string, purpose: string = 'verification') => {
    const res = await apiVerifyOTP({ target, otp, purpose });
    if (token) {
      await refreshProfile();
    }
    return res;
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const updated = await getMyProfile(token);
      setUser(updated);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        register,
        logout,
        requestOTP,
        verifyOTP,
        refreshProfile,
      }}
    >
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
