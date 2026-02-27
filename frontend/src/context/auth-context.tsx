"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/services/api';

type User = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    systemRole?: string;
    communityTier?: string;
    isActive?: boolean;
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
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                // Optimistically set state
                setToken(storedToken);
                setUser(JSON.parse(storedUser));

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
            setIsLoading(false);
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
    };

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
