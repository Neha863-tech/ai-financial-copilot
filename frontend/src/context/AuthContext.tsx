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
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY) || localStorage.getItem('finsight_token'));
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
        const res = await getMyProfile(token);
        const profile = res.user || res.data?.user || res;
        setUser(profile);
      } catch (err) {
        console.warn('Failed to load profile with stored token:', err);
        // Do not force logout on temporary network glitch
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email: string, pass: string): Promise<User> => {
    const res = await loginUser({ email, password: pass });
    const authToken = res.accessToken || res.token || res.data?.token || '';
    const authUser = res.user || res.data?.user || { id: 'u1', email, fullName: email.split('@')[0] };
    if (authToken) {
      localStorage.setItem(TOKEN_KEY, authToken);
      localStorage.setItem('finsight_token', authToken);
      setToken(authToken);
    }
    setUser(authUser);
    setIsAuthModalOpen(false);
    return authUser;
  };

  const register = async (payload: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    whatsappOptIn?: boolean;
  }): Promise<User> => {
    const res = await registerUser(payload);
    const authToken = res.accessToken || res.token || res.data?.token || '';
    const authUser = res.user || res.data?.user || { id: 'u1', email: payload.email, fullName: payload.fullName };
    if (authToken) {
      localStorage.setItem(TOKEN_KEY, authToken);
      localStorage.setItem('finsight_token', authToken);
      setToken(authToken);
    }
    setUser(authUser);
    setIsAuthModalOpen(false);
    return authUser;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('finsight_token');
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
      const res = await getMyProfile(token);
      const profile = res.user || res.data?.user || res;
      setUser(profile);
    } catch (e) {
      console.warn('Failed to refresh profile:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user || token),
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
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
