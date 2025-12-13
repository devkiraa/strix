"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PlayIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { WatchProgress, removeWatchProgress } from "@/lib/watchProgress";
import { getImageUrl, BACKDROP_SIZE } from "@/lib/tmdb";

interface ContinueWatchingProps {
    items: WatchProgress[];
    onPlay: (item: WatchProgress) => void;
    onRefresh: () => void;
}

export default function ContinueWatching({ items, onPlay, onRefresh }: ContinueWatchingProps) {
    if (items.length === 0) return null;

    return (
        <section className="mb-8 md:mb-12">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                    Continue Watching
                </h2>
            </div>

            {/* Slider */}
            <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 sm:px-6 lg:px-8 pb-2">
                {items.map((item) => (
                    <ContinueWatchingCard
                        key={`${item.mediaType}-${item.id}-${item.season || 0}-${item.episode || 0}`}
                        item={item}
                        onPlay={() => onPlay(item)}
                        onRemove={() => {
                            removeWatchProgress(item.mediaType, item.id, item.season, item.episode);
                            onRefresh();
                        }}
                    />
                ))}
            </div>
        </section>
    );
}

interface ContinueWatchingCardProps {
    item: WatchProgress;
    onPlay: () => void;
    onRemove: () => void;
}

function ContinueWatchingCard({ item, onPlay, onRemove }: ContinueWatchingCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${mins}m left`;
        }
        return `${mins}m left`;
    };

    const timeLeft = item.duration - item.currentTime;
    const detailHref = `/${item.mediaType}/${item.id}`;

    return (
        <div
            className="relative flex-shrink-0 w-[280px] sm:w-[320px] bg-[#181818] rounded-lg overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Thumbnail */}
            <div className="relative aspect-video">
                <Image
                    src={getImageUrl(item.posterPath)}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="320px"
                />

                {/* Overlay on hover */}
                <div
                    className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onPlay();
                        }}
                        className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    >
                        <PlayIcon className="w-7 h-7 text-black ml-1" />
                    </button>
                </div>

                {/* Remove button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onRemove();
                    }}
                    className={`absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-600 rounded-full transition-all ${isHovered ? "opacity-100" : "opacity-0"
                        }`}
                    title="Remove from Continue Watching"
                >
                    <XMarkIcon className="w-4 h-4 text-white" />
                </button>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                    <div
                        className="h-full bg-red-600"
                        style={{ width: `${item.progress}%` }}
                    />
                </div>
            </div>

            {/* Info */}
            <Link href={detailHref} className="block p-3">
                <h3 className="text-white font-medium text-sm truncate">{item.title}</h3>
                <div className="flex items-center justify-between mt-1">
                    <p className="text-gray-400 text-xs">
                        {item.mediaType === "tv" && item.season && item.episode
                            ? `S${item.season} E${item.episode}`
                            : formatTime(timeLeft)}
                    </p>
                    {item.mediaType === "tv" && (
                        <p className="text-gray-500 text-xs">{formatTime(timeLeft)}</p>
                    )}
                </div>
            </Link>
        </div>
    );
}
