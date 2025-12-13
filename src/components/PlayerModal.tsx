"use client";

import { useState, useEffect, useCallback } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { getVidsrcUrl } from "@/lib/tmdb";

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: "movie" | "tv";
  mediaId: number;
  title: string;
  season?: number;
  episode?: number;
}

export default function PlayerModal({
  isOpen,
  onClose,
  mediaType,
  mediaId,
  title,
  season = 1,
  episode = 1,
}: PlayerModalProps) {
  const [isLoading, setIsLoading] = useState(true);

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

  // Reset loading state when modal opens or media changes
  const resetLoading = isOpen;
  useEffect(() => {
    if (resetLoading) {
      setIsLoading(true);
    }
  }, [resetLoading, mediaId, season, episode]);

  if (!isOpen) return null;

  const embedUrl = getVidsrcUrl(mediaType, mediaId, season, episode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[1280px] mx-2 sm:mx-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <div className="flex-1 min-w-0 mr-2">
            <h2 className="text-base sm:text-xl font-semibold text-white truncate">{title}</h2>
            {mediaType === "tv" && (
              <p className="text-gray-400 text-sm">
                Season {season}, Episode {episode}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#141414]">
              <div className="flex flex-col items-center gap-2 sm:gap-4">
                <div className="w-10 h-10 sm:w-16 sm:h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm sm:text-base">Loading player...</p>
              </div>
            </div>
          )}
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Info */}
        <div className="mt-2 sm:mt-4 flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
          <p className="text-center sm:text-left">
            Tip: If the video doesn&apos;t load, try refreshing or changing
            the server.
          </p>
        </div>
      </div>
    </div>
  );
}
