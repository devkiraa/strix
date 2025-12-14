"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { XMarkIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import { getVidsrcUrl } from "@/lib/tmdb";
import { saveWatchProgress, getMediaProgress } from "@/lib/watchProgress";
import { useAuth } from "@/context/AuthContext";

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: "movie" | "tv";
  mediaId: number;
  title: string;
  posterPath?: string;
  season?: number;
  episode?: number;
  duration?: number;
  onProgressUpdate?: () => void;
}

export default function PlayerModal({
  isOpen,
  onClose,
  mediaType,
  mediaId,
  title,
  posterPath = "",
  season = 1,
  episode = 1,
  duration = mediaType === "movie" ? 120 : 45,
  onProgressUpdate,
}: PlayerModalProps) {
  const { isAuthenticated, saveProgress } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const startTimeRef = useRef<number>(0);
  const initialProgressRef = useRef<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const durationSeconds = duration * 60;

  // Keyboard shortcuts
  const shortcuts = [
    { key: "Space", action: "Play / Pause" },
    { key: "F", action: "Toggle Fullscreen" },
    { key: "M", action: "Mute / Unmute" },
    { key: "←", action: "Seek -10s" },
    { key: "→", action: "Seek +10s" },
    { key: "↑", action: "Volume Up" },
    { key: "↓", action: "Volume Down" },
    { key: "Esc", action: "Close Player" },
  ];

  // Load existing progress when modal opens
  useEffect(() => {
    if (isOpen) {
      const existingProgress = getMediaProgress(mediaType, mediaId, season, episode);
      if (existingProgress) {
        initialProgressRef.current = existingProgress.currentTime;
      } else {
        initialProgressRef.current = 0;
      }
      startTimeRef.current = Date.now();
    }
  }, [isOpen, mediaType, mediaId, season, episode]);

  const handleClose = useCallback(() => {
    if (startTimeRef.current > 0) {
      const watchedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const totalWatched = initialProgressRef.current + watchedSeconds;
      const progress = Math.min((totalWatched / durationSeconds) * 100, 100);

      if (watchedSeconds > 10) {
        const progressData = {
          id: mediaId,
          mediaType,
          title,
          posterPath,
          progress,
          currentTime: Math.min(totalWatched, durationSeconds),
          duration: durationSeconds,
          season: mediaType === "tv" ? season : undefined,
          episode: mediaType === "tv" ? episode : undefined,
        };

        // Save to local storage
        saveWatchProgress(progressData);

        // Also save to cloud if authenticated
        if (isAuthenticated) {
          saveProgress(progressData);
        }

        if (onProgressUpdate) {
          onProgressUpdate();
        }
      }
    }

    onClose();
  }, [onClose, mediaType, mediaId, title, posterPath, season, episode, durationSeconds, onProgressUpdate]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    const playerContainer = document.getElementById("player-container");
    if (!playerContainer) return;

    if (!document.fullscreenElement) {
      playerContainer.requestFullscreen().catch(() => { });
    } else {
      document.exitFullscreen().catch(() => { });
    }
  }, []);

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

  // Keyboard shortcuts handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "Escape":
          handleClose();
          break;
        case " ":
          e.preventDefault();
          // Try to toggle play/pause in iframe (may not work due to cross-origin)
          // The embedded player usually handles Space itself
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "?":
          setShowShortcuts((prev) => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose, toggleFullscreen]);

  // Reset loading state when modal opens or media changes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [isOpen, mediaId, season, episode]);

  // Periodically save progress while watching
  useEffect(() => {
    if (!isOpen || isLoading) return;

    const interval = setInterval(() => {
      const watchedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const totalWatched = initialProgressRef.current + watchedSeconds;
      const progress = Math.min((totalWatched / durationSeconds) * 100, 100);

      if (watchedSeconds > 30) {
        saveWatchProgress({
          id: mediaId,
          mediaType,
          title,
          posterPath,
          progress,
          currentTime: Math.min(totalWatched, durationSeconds),
          duration: durationSeconds,
          season: mediaType === "tv" ? season : undefined,
          episode: mediaType === "tv" ? episode : undefined,
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isOpen, isLoading, mediaType, mediaId, title, posterPath, season, episode, durationSeconds]);

  if (!isOpen) return null;

  const embedUrl = getVidsrcUrl(mediaType, mediaId, season, episode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div id="player-container" className="relative w-full max-w-[1280px] mx-2 sm:mx-4 animate-fade-in">
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
          <div className="flex items-center gap-2">
            {/* Shortcuts Help Button */}
            <button
              onClick={() => setShowShortcuts((prev) => !prev)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              title="Keyboard Shortcuts (?)"
            >
              <QuestionMarkCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          </div>
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
            ref={iframeRef}
            src={embedUrl}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            onLoad={() => setIsLoading(false)}
          />

          {/* Keyboard Shortcuts Overlay */}
          {showShortcuts && (
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10"
              onClick={() => setShowShortcuts(false)}
            >
              <div
                className="bg-[#232323] rounded-xl p-6 max-w-sm w-full mx-4 border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-white mb-4 text-center">
                  Keyboard Shortcuts
                </h3>
                <div className="space-y-3">
                  {shortcuts.map((shortcut) => (
                    <div key={shortcut.key} className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">{shortcut.action}</span>
                      <kbd className="px-2 py-1 bg-white/10 rounded text-white text-xs font-mono">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
                <p className="text-gray-500 text-xs mt-4 text-center">
                  Press ? to toggle this menu
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-2 sm:mt-4 flex items-center justify-between text-xs sm:text-sm text-gray-400">
          <p>
            Tip: If the video doesn&apos;t load, try refreshing or changing the server.
          </p>
          <p className="hidden sm:block text-gray-500">
            Press ? for shortcuts
          </p>
        </div>
      </div>
    </div>
  );
}
