"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/services/api';

export type User = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
    systemRole?: string;
    communityTier?: string;
    isActive?: boolean;
    chapterId?: string | null;
    chapterName?: string | null;
    chapterCode?: string | null;
    profilePicture?: string | null;
    professionTitle?: string | null;
    industry?: string | null;
    companyName?: string | null;
    location?: string | null;
    tattMemberId?: string | null;
    flags?: string[];
    connectionPreference?: string;
    expertise?: string;
    businessName?: string;
    businessRole?: string;
    businessProfileLink?: string;
    professionalHighlight?: string;
    interests?: { id: string, name: string }[];
    deletionRequestedAt?: string | null;
    linkedInProfileUrl?: string;
    createdAt?: string;
};

type AuthContextType = {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const storedToken = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                if (storedToken && storedUser) {
                    // Optimistically set state
                    setToken(storedToken);
                    try {
                        setUser(JSON.parse(storedUser));
                    } catch (e) {
                         console.warn("Could not parse stored user", e);
                    }

                    // Verify with backend to prevent local-storage tampering
                    try {
                        const response = await api.get('/auth/me');
                        const realUser = response.data;
                        setUser(realUser);
                        localStorage.setItem('user', JSON.stringify(realUser));
                    } catch (error) {
                        console.error("Auth verification failed:", error);
                        // Token is invalid or user was deleted
                        setToken(null);
                        setUser(null);
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                } else {
                    setToken(null);
                    setUser(null);
                }
            } catch (err) {
                console.error("verifyAuth encountered a top-level error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        verifyAuth();
    }, []);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    // Auto-logout after 30 minutes of inactivity
    useEffect(() => {
        if (!token) return;

        let inactivityTimer: NodeJS.Timeout;

        const resetTimer = () => {
            if (inactivityTimer) clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                console.log("Logged out due to inactivity");
                logout();
            }, 30 * 60 * 1000); // 30 minutes
        };

        const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];

        events.forEach(event => window.addEventListener(event, resetTimer));
        resetTimer(); // Initialize on mount

        return () => {
            if (inactivityTimer) clearTimeout(inactivityTimer);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [token]);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
