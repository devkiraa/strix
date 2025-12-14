"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    PlayIcon,
    TrashIcon,
    ClockIcon,
    FilmIcon,
    TvIcon,
    ArrowLeftIcon,
} from "@heroicons/react/24/solid";
import { useAuth } from "@/context/AuthContext";
import { getContinueWatching, removeWatchProgress, WatchProgress } from "@/lib/watchProgress";
import { getImageUrl } from "@/lib/tmdb";
import PlayerModal from "@/components/PlayerModal";

export default function WatchingPage() {
    const router = useRouter();
    const { isAuthenticated, watchProgress, refreshWatchProgress, removeProgress } = useAuth();

    // Local watch progress for non-authenticated users
    const [localWatchProgress, setLocalWatchProgress] = useState<WatchProgress[]>([]);

    // Player state
    const [playerOpen, setPlayerOpen] = useState(false);
    const [currentMedia, setCurrentMedia] = useState<{
        id: number;
        type: "movie" | "tv";
        title: string;
        posterPath?: string;
        season?: number;
        episode?: number;
    } | null>(null);

    // Get watch progress based on auth state
    const items = isAuthenticated ? watchProgress : localWatchProgress;

    // Load local watch progress
    useEffect(() => {
        if (!isAuthenticated) {
            setLocalWatchProgress(getContinueWatching());
        }
    }, [isAuthenticated]);

    const handlePlay = (item: WatchProgress) => {
        setCurrentMedia({
            id: item.id,
            type: item.mediaType,
            title: item.title,
            posterPath: item.posterPath,
            season: item.season,
            episode: item.episode,
        });
        setPlayerOpen(true);
    };

    const handleRemove = async (item: WatchProgress) => {
        if (isAuthenticated) {
            await removeProgress(item.mediaType, item.id, item.season, item.episode);
        } else {
            removeWatchProgress(item.mediaType, item.id, item.season, item.episode);
            setLocalWatchProgress(getContinueWatching());
        }
    };

    const handlePlayerClose = () => {
        setPlayerOpen(false);
        if (isAuthenticated) {
            refreshWatchProgress();
        } else {
            setLocalWatchProgress(getContinueWatching());
        }
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const getTimeRemaining = (item: WatchProgress) => {
        const remaining = item.duration - item.currentTime;
        return formatTime(remaining);
    };

    return (
        <div className="min-h-screen bg-[#141414] pt-20">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Continue Watching</h1>
                        <p className="text-gray-400 mt-1">
                            {items.length} {items.length === 1 ? "item" : "items"} in progress
                        </p>
                    </div>
                </div>

                {/* Content */}
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <ClockIcon className="w-12 h-12 text-gray-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Nothing to continue</h2>
                        <p className="text-gray-400 max-w-md mb-6">
                            Start watching movies or TV shows and they&apos;ll appear here so you can easily pick up where you left off.
                        </p>
                        <div className="flex gap-4">
                            <Link
                                href="/movies"
                                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                            >
                                <FilmIcon className="w-5 h-5" />
                                Browse Movies
                            </Link>
                            <Link
                                href="/tv"
                                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <TvIcon className="w-5 h-5" />
                                Browse TV Shows
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {items.map((item) => (
                            <div
                                key={`${item.mediaType}-${item.id}-${item.season || 0}-${item.episode || 0}`}
                                className="group bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all"
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-video">
                                    {item.posterPath ? (
                                        <Image
                                            src={getImageUrl(item.posterPath, "w500")}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#232323] to-[#1a1a1a] flex items-center justify-center">
                                            {item.mediaType === "movie" ? (
                                                <FilmIcon className="w-12 h-12 text-gray-600" />
                                            ) : (
                                                <TvIcon className="w-12 h-12 text-gray-600" />
                                            )}
                                        </div>
                                    )}

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                    {/* Progress Bar */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                        <div
                                            className="h-full bg-red-600 transition-all"
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>

                                    {/* Play Button Overlay */}
                                    <button
                                        onClick={() => handlePlay(item)}
                                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40"
                                    >
                                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center transform hover:scale-110 transition-transform shadow-lg">
                                            <PlayIcon className="w-8 h-8 text-white ml-1" />
                                        </div>
                                    </button>

                                    {/* Type Badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white flex items-center gap-1">
                                            {item.mediaType === "movie" ? (
                                                <>
                                                    <FilmIcon className="w-3 h-3" />
                                                    Movie
                                                </>
                                            ) : (
                                                <>
                                                    <TvIcon className="w-3 h-3" />
                                                    S{item.season} E{item.episode}
                                                </>
                                            )}
                                        </span>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove(item);
                                        }}
                                        className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    >
                                        <TrashIcon className="w-4 h-4 text-white" />
                                    </button>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-white truncate mb-2">{item.title}</h3>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <ClockIcon className="w-4 h-4" />
                                            <span>{getTimeRemaining(item)} left</span>
                                        </div>
                                        <span className="text-red-500 font-medium">{Math.round(item.progress)}%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Login Prompt for non-authenticated users */}
                {!isAuthenticated && items.length > 0 && (
                    <div className="mt-12 bg-gradient-to-r from-red-600/20 to-transparent border border-red-600/20 rounded-xl p-6">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-1">Sync across devices</h3>
                                <p className="text-gray-400 text-sm">
                                    Sign in to save your watch progress and continue watching on any device.
                                </p>
                            </div>
                            <Link
                                href="/login"
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors whitespace-nowrap"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Player Modal */}
            {currentMedia && (
                <PlayerModal
                    isOpen={playerOpen}
                    onClose={handlePlayerClose}
                    mediaType={currentMedia.type}
                    mediaId={currentMedia.id}
                    title={currentMedia.title}
                    posterPath={currentMedia.posterPath}
                    season={currentMedia.season}
                    episode={currentMedia.episode}
                    onProgressUpdate={handlePlayerClose}
                />
            )}
        </div>
    );
}
