"use client";

import { useState, useEffect, useCallback } from "react";

export interface WatchProgress {
    id: number;
    mediaType: "movie" | "tv";
    title: string;
    posterPath: string;
    progress: number; // 0-100 percentage
    currentTime: number; // seconds
    duration: number; // seconds
    season?: number;
    episode?: number;
    lastWatched: number; // timestamp
}

const STORAGE_KEY = "strix_watch_progress";
const MAX_ITEMS = 20; // Maximum items to store

// Get all watch progress from localStorage
export function getWatchProgress(): WatchProgress[] {
    if (typeof window === "undefined") return [];

    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];

        const parsed = JSON.parse(data) as WatchProgress[];
        // Sort by most recently watched
        return parsed.sort((a, b) => b.lastWatched - a.lastWatched);
    } catch {
        return [];
    }
}

// Get progress for a specific media item
export function getMediaProgress(
    mediaType: "movie" | "tv",
    id: number,
    season?: number,
    episode?: number
): WatchProgress | null {
    const allProgress = getWatchProgress();

    return allProgress.find((item) => {
        if (item.mediaType !== mediaType || item.id !== id) return false;
        if (mediaType === "tv") {
            return item.season === season && item.episode === episode;
        }
        return true;
    }) || null;
}

// Save or update watch progress
export function saveWatchProgress(progress: Omit<WatchProgress, "lastWatched">): void {
    if (typeof window === "undefined") return;

    try {
        const allProgress = getWatchProgress();

        // Find existing entry
        const existingIndex = allProgress.findIndex((item) => {
            if (item.mediaType !== progress.mediaType || item.id !== progress.id) return false;
            if (progress.mediaType === "tv") {
                return item.season === progress.season && item.episode === progress.episode;
            }
            return true;
        });

        const newEntry: WatchProgress = {
            ...progress,
            lastWatched: Date.now(),
        };

        if (existingIndex >= 0) {
            // Update existing entry
            allProgress[existingIndex] = newEntry;
        } else {
            // Add new entry at the beginning
            allProgress.unshift(newEntry);
        }

        // Keep only the most recent items
        const trimmed = allProgress.slice(0, MAX_ITEMS);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
        console.error("Error saving watch progress:", error);
    }
}

// Remove a specific item from watch progress
export function removeWatchProgress(
    mediaType: "movie" | "tv",
    id: number,
    season?: number,
    episode?: number
): void {
    if (typeof window === "undefined") return;

    try {
        const allProgress = getWatchProgress();

        const filtered = allProgress.filter((item) => {
            if (item.mediaType !== mediaType || item.id !== id) return true;
            if (mediaType === "tv") {
                return !(item.season === season && item.episode === episode);
            }
            return false;
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error("Error removing watch progress:", error);
    }
}

// Clear all watch progress
export function clearAllWatchProgress(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
}

// Custom hook to use watch progress with state
export function useWatchProgress() {
    const [progress, setProgress] = useState<WatchProgress[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setProgress(getWatchProgress());
        setIsLoaded(true);
    }, []);

    const refresh = useCallback(() => {
        setProgress(getWatchProgress());
    }, []);

    const save = useCallback((item: Omit<WatchProgress, "lastWatched">) => {
        saveWatchProgress(item);
        refresh();
    }, [refresh]);

    const remove = useCallback((
        mediaType: "movie" | "tv",
        id: number,
        season?: number,
        episode?: number
    ) => {
        removeWatchProgress(mediaType, id, season, episode);
        refresh();
    }, [refresh]);

    const clear = useCallback(() => {
        clearAllWatchProgress();
        refresh();
    }, [refresh]);

    return {
        progress,
        isLoaded,
        save,
        remove,
        clear,
        refresh,
    };
}

// Get items that are in progress (not finished, > 5% watched)
export function getContinueWatching(): WatchProgress[] {
    const allProgress = getWatchProgress();
    return allProgress.filter((item) => item.progress > 5 && item.progress < 95);
}
