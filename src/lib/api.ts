// JSON API Configuration
const API_BASE = "https://json-api-5wyk.onrender.com";
const API_KEY = "7b1f5f30-3413-440f-affa-9d009248f3c5";
const DOCUMENT_ID = "69f94cb5-59f8-4ca4-b286-087f3c38cce2";

export interface User {
    id: string;
    email: string;
    username: string;
    createdAt: string;
}

export interface UserData {
    users: {
        [email: string]: {
            id: string;
            email: string;
            username: string;
            password: string; // In production, this should be hashed!
            createdAt: string;
            watchProgress: WatchProgressItem[];
        };
    };
}

export interface WatchProgressItem {
    id: number;
    mediaType: "movie" | "tv";
    title: string;
    posterPath: string;
    progress: number;
    currentTime: number;
    duration: number;
    season?: number;
    episode?: number;
    lastWatched: number;
}

// Fetch all data from the JSON API
async function fetchData(): Promise<UserData> {
    try {
        const response = await fetch(`${API_BASE}/public/${DOCUMENT_ID}`, {
            cache: 'no-store', // Disable caching to always get fresh data
        });
        if (!response.ok) {
            throw new Error("Failed to fetch data");
        }
        const responseData = await response.json();
        // Handle both direct data and nested data.data structure
        const data = responseData.data || responseData;
        return data.users ? data : { users: {} };
    } catch (error) {
        console.error("Error fetching data:", error);
        return { users: {} };
    }
}

// Update data in the JSON API
async function updateData(data: UserData): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE}/api/documents/${DOCUMENT_ID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": API_KEY,
            },
            body: JSON.stringify({ name: "movies", data }),
        });
        return response.ok;
    } catch (error) {
        console.error("Error updating data:", error);
        return false;
    }
}

// Register a new user
export async function registerUser(
    email: string,
    username: string,
    password: string
): Promise<{ success: boolean; error?: string; user?: User }> {
    const data = await fetchData();

    // Check if user already exists
    if (data.users[email]) {
        return { success: false, error: "Email already registered" };
    }

    // Create new user
    const newUser = {
        id: crypto.randomUUID(),
        email,
        username,
        password, // In production, hash this!
        createdAt: new Date().toISOString(),
        watchProgress: [],
    };

    data.users[email] = newUser;

    const success = await updateData(data);
    if (success) {
        const { password: _, ...userWithoutPassword } = newUser;
        return { success: true, user: userWithoutPassword };
    }

    return { success: false, error: "Failed to create account" };
}

// Login user
export async function loginUser(
    email: string,
    password: string
): Promise<{ success: boolean; error?: string; user?: User }> {
    const data = await fetchData();

    const user = data.users[email];
    if (!user) {
        return { success: false, error: "Email not found" };
    }

    if (user.password !== password) {
        return { success: false, error: "Incorrect password" };
    }

    const { password: _, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
}

// Get user's watch progress
export async function getUserWatchProgress(
    email: string
): Promise<WatchProgressItem[]> {
    const data = await fetchData();
    return data.users[email]?.watchProgress || [];
}

// Save user's watch progress
export async function saveUserWatchProgress(
    email: string,
    progressItem: Omit<WatchProgressItem, "lastWatched">
): Promise<boolean> {
    const data = await fetchData();

    if (!data.users[email]) {
        return false;
    }

    const progress = data.users[email].watchProgress || [];

    // Find existing entry
    const existingIndex = progress.findIndex((item) => {
        if (item.mediaType !== progressItem.mediaType || item.id !== progressItem.id)
            return false;
        if (progressItem.mediaType === "tv") {
            return (
                item.season === progressItem.season &&
                item.episode === progressItem.episode
            );
        }
        return true;
    });

    const newEntry: WatchProgressItem = {
        ...progressItem,
        lastWatched: Date.now(),
    };

    if (existingIndex >= 0) {
        progress[existingIndex] = newEntry;
    } else {
        progress.unshift(newEntry);
    }

    // Keep only last 20 items
    data.users[email].watchProgress = progress.slice(0, 20);

    return await updateData(data);
}

// Remove from watch progress
export async function removeUserWatchProgress(
    email: string,
    mediaType: "movie" | "tv",
    id: number,
    season?: number,
    episode?: number
): Promise<boolean> {
    const data = await fetchData();

    if (!data.users[email]) {
        return false;
    }

    data.users[email].watchProgress = data.users[email].watchProgress.filter(
        (item) => {
            if (item.mediaType !== mediaType || item.id !== id) return true;
            if (mediaType === "tv") {
                return !(item.season === season && item.episode === episode);
            }
            return false;
        }
    );

    return await updateData(data);
}

// Get continue watching items (any progress < 95%)
export async function getContinueWatchingForUser(
    email: string
): Promise<WatchProgressItem[]> {
    const progress = await getUserWatchProgress(email);
    return progress
        .filter((item) => item.progress > 0 && item.progress < 95)
        .sort((a, b) => b.lastWatched - a.lastWatched);
}
