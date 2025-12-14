"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
    User,
    WatchProgressItem,
    loginUser,
    registerUser,
    getUserWatchProgress,
    saveUserWatchProgress,
    removeUserWatchProgress,
    getContinueWatchingForUser,
} from "@/lib/api";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (email: string, username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    watchProgress: WatchProgressItem[];
    refreshWatchProgress: () => Promise<void>;
    saveProgress: (item: Omit<WatchProgressItem, "lastWatched">) => Promise<void>;
    removeProgress: (mediaType: "movie" | "tv", id: number, season?: number, episode?: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "strix_auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [watchProgress, setWatchProgress] = useState<WatchProgressItem[]>([]);

    // Load user from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
            try {
                const userData = JSON.parse(stored);
                setUser(userData);
            } catch {
                localStorage.removeItem(AUTH_STORAGE_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    // Fetch watch progress when user changes
    useEffect(() => {
        if (user) {
            refreshWatchProgress();
        } else {
            setWatchProgress([]);
        }
    }, [user]);

    const refreshWatchProgress = async () => {
        if (!user) return;
        try {
            const progress = await getContinueWatchingForUser(user.email);
            setWatchProgress(progress);
        } catch (error) {
            console.error("Error fetching watch progress:", error);
        }
    };

    const login = async (email: string, password: string) => {
        const result = await loginUser(email, password);
        if (result.success && result.user) {
            setUser(result.user);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result.user));
            return { success: true };
        }
        return { success: false, error: result.error };
    };

    const register = async (email: string, username: string, password: string) => {
        const result = await registerUser(email, username, password);
        if (result.success && result.user) {
            setUser(result.user);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result.user));
            return { success: true };
        }
        return { success: false, error: result.error };
    };

    const logout = () => {
        setUser(null);
        setWatchProgress([]);
        localStorage.removeItem(AUTH_STORAGE_KEY);
    };

    const saveProgress = async (item: Omit<WatchProgressItem, "lastWatched">) => {
        if (!user) return;
        await saveUserWatchProgress(user.email, item);
        await refreshWatchProgress();
    };

    const removeProgress = async (
        mediaType: "movie" | "tv",
        id: number,
        season?: number,
        episode?: number
    ) => {
        if (!user) return;
        await removeUserWatchProgress(user.email, mediaType, id, season, episode);
        await refreshWatchProgress();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                watchProgress,
                refreshWatchProgress,
                saveProgress,
                removeProgress,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
