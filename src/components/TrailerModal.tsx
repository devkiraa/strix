"use client";

import { useEffect, useCallback } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { getYouTubeEmbedUrl } from "@/lib/tmdb";

interface TrailerModalProps {
    isOpen: boolean;
    onClose: () => void;
    trailerKey: string;
    title: string;
}

export default function TrailerModal({
    isOpen,
    onClose,
    trailerKey,
    title,
}: TrailerModalProps) {
    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [handleClose]);

    if (!isOpen) return null;

    const embedUrl = getYouTubeEmbedUrl(trailerKey);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-[1000px] mx-2 sm:mx-4 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className="flex-1 min-w-0 mr-2">
                        <p className="text-red-500 text-xs font-semibold uppercase tracking-wider mb-1">
                            Official Trailer
                        </p>
                        <h2 className="text-base sm:text-xl font-semibold text-white truncate">
                            {title}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </button>
                </div>

                {/* Video Player */}
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
                    <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allowFullScreen
                        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                        title={`${title} Trailer`}
                    />
                </div>

                {/* Info */}
                <div className="mt-2 sm:mt-4 text-center">
                    <p className="text-gray-500 text-xs sm:text-sm">
                        Press Esc or click outside to close
                    </p>
                </div>
            </div>
        </div>
    );
}
