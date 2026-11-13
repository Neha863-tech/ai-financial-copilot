import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, requestOTP as apiRequestOTP, verifyOTP as apiVerifyOTP, getMyProfile, } from '../services/api';
const AuthContext = createContext(undefined);
const TOKEN_KEY = 'finsight_auth_token';
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || localStorage.getItem('finsight_token'));
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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
            }
            catch (err) {
                console.warn('Failed to load profile with stored token:', err);
                // Do not force logout on temporary network glitch
            }
            finally {
                setIsLoading(false);
            }
        }
        loadUser();
    }, [token]);
    const login = async (email, pass) => {
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
    const register = async (payload) => {
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
    const requestOTP = async (target, targetType, purpose = 'verification') => {
        return await apiRequestOTP({ target, targetType, purpose });
    };
    const verifyOTP = async (target, otp, purpose = 'verification') => {
        const res = await apiVerifyOTP({ target, otp, purpose });
        if (token) {
            await refreshProfile();
        }
        return res;
    };
    const refreshProfile = async () => {
        if (!token)
            return;
        try {
            const res = await getMyProfile(token);
            const profile = res.user || res.data?.user || res;
            setUser(profile);
        }
        catch (e) {
            console.warn('Failed to refresh profile:', e);
        }
    };
    return (<AuthContext.Provider value={{
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
        }}>
      {children}
    </AuthContext.Provider>);
};
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
