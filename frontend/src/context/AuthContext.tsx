import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "../types/auth";
import {
  getMyProfile,
  loginUser,
  logoutUser,
  registerUser,
  updateMyProfile,
} from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: { email: string; password: string; fullName: string }) => Promise<User>;
  logout: () => void;
  updateProfile: (payload: {
    fullName?: string;
    preferredCurrency?: string;
    timezone?: string;
  }) => Promise<User>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_KEY = "finsight_token";

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const result = await getMyProfile(token);
        if (active) setUser(result.user);
      } catch (error) {
        if ((error as Error & { status?: number }).status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          if (active) {
            setToken(null);
            setUser(null);
          }
        } else {
          console.error("Could not load the signed-in profile.", error);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadUser();
    return () => {
      active = false;
    };
  }, [token]);

  const saveSession = (authToken: string, authUser: User): User => {
    if (!authToken) throw new Error("The server did not return an authentication token.");
    localStorage.setItem(TOKEN_KEY, authToken);
    setToken(authToken);
    setUser(authUser);
    setIsAuthModalOpen(false);
    return authUser;
  };

  const login = async (email: string, password: string): Promise<User> => {
    const result = await loginUser({ email, password });
    return saveSession(result.token, result.user);
  };

  const register = async (payload: {
    email: string;
    password: string;
    fullName: string;
  }): Promise<User> => {
    const result = await registerUser(payload);
    return saveSession(result.token, result.user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    void logoutUser().catch((error: unknown) => {
      console.warn("The local session ended, but the server logout request failed.", error);
    });
  };

  const updateProfile = async (payload: {
    fullName?: string;
    preferredCurrency?: string;
    timezone?: string;
  }): Promise<User> => {
    if (!token) throw new Error("Sign in to update your profile.");
    const result = await updateMyProfile(payload, token);
    setUser(result.user);
    return result.user;
  };

  const refreshProfile = async () => {
    if (!token) return;
    const result = await getMyProfile(token);
    setUser(result.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isLoading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
