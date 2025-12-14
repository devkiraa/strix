"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { XMarkIcon, QuestionMarkCircleIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
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
  const [isMarkedWatched, setIsMarkedWatched] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Time tracking refs
  const initialCurrentTimeRef = useRef<number>(0); // Time previously watched
  const sessionWatchedRef = useRef<number>(0); // Time watched in this specific session
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const durationSeconds = duration * 60;

  // Keyboard shortcuts
  const shortcuts = [
    { key: "F", action: "Toggle Fullscreen" },
    { key: "Esc", action: "Close Player" },
  ];

  // Initialize and load progress
  useEffect(() => {
    if (isOpen) {
      const existing = getMediaProgress(mediaType, mediaId, season, episode);
      if (existing) {
        initialCurrentTimeRef.current = existing.currentTime || 0;
        if (existing.progress >= 95) setIsMarkedWatched(true);
      } else {
        initialCurrentTimeRef.current = 0;
        setIsMarkedWatched(false);
      }
      sessionWatchedRef.current = 0;
      setIsLoading(true);
    }
    // Cleanup intervals on close/unmount
    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    };
  }, [isOpen, mediaType, mediaId, season, episode]);


  // SAVE LOGIC
  const saveCurrentProgress = useCallback((forceProgress?: number) => {
    // If explicitly marking as watched, force 100%
    if (forceProgress === 100) {
      const data = {
        id: mediaId,
        mediaType,
        title,
        posterPath,
        progress: 100,
        currentTime: durationSeconds,
        duration: durationSeconds,
        season: mediaType === "tv" ? season : undefined,
        episode: mediaType === "tv" ? episode : undefined,
      };
      saveWatchProgress(data);
      if (isAuthenticated) saveProgress(data);
      if (onProgressUpdate) onProgressUpdate();
      return;
    }

    // Otherwise calculate estimated time
    const totalSeconds = initialCurrentTimeRef.current + sessionWatchedRef.current;

    // Cap at duration
    const clampedSeconds = Math.min(totalSeconds, durationSeconds);
    const progressPercent = (clampedSeconds / durationSeconds) * 100;

    // Don't save if very little progress (e.g. < 10 seconds total) unless it's a resume
    if (clampedSeconds < 10 && initialCurrentTimeRef.current === 0) return;

    const data = {
      id: mediaId,
      mediaType,
      title,
      posterPath,
      progress: Math.min(progressPercent, 100),
      currentTime: clampedSeconds,
      duration: durationSeconds,
      season: mediaType === "tv" ? season : undefined,
      episode: mediaType === "tv" ? episode : undefined,
    };

    saveWatchProgress(data);
    if (isAuthenticated) {
      saveProgress(data);
    }
    if (onProgressUpdate) {
      onProgressUpdate();
    }
  }, [mediaId, mediaType, title, posterPath, durationSeconds, season, episode, isAuthenticated, saveProgress, onProgressUpdate]);


  // MARK AS WATCHED
  const handleMarkWatched = () => {
    setIsMarkedWatched(true);
    saveCurrentProgress(100);
  };

  // ACTIVE TIME TRACKER
  // Only counts time when document is visible (tab is active)
  useEffect(() => {
    if (!isOpen) return;

    // 1. Second counter (only when visible)
    trackingIntervalRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        sessionWatchedRef.current += 1;
      }
    }, 1000);

    // 2. Periodic Auto-save every 15 seconds
    saveIntervalRef.current = setInterval(() => {
      if (document.visibilityState === "visible" && !isMarkedWatched) {
        saveCurrentProgress();
      }
    }, 15000);

    return () => {
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, [isOpen, saveCurrentProgress, isMarkedWatched]);

  // Handle Close (Final Save)
  const handleClose = () => {
    if (!isMarkedWatched) {
      saveCurrentProgress();
    }
    onClose();
  };

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

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // Keyboard Shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.key) {
        case "Escape": handleClose(); break;
        case "f":
        case "F": toggleFullscreen(); break;
        case "?": setShowShortcuts((prev) => !prev); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, toggleFullscreen]); // Removed handleClose from deps to avoid stale closure if any

  if (!isOpen) return null;

  const embedUrl = getVidsrcUrl(mediaType, mediaId, season, episode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={handleClose} />

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
            {/* Mark as Watched Button */}
            <button
              onClick={handleMarkWatched}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isMarkedWatched
                  ? "bg-green-600/20 text-green-500 border border-green-600/50 cursor-default"
                  : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              title="Mark as Watched"
              disabled={isMarkedWatched}
            >
              <CheckCircleIcon className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">
                {isMarkedWatched ? "Watched" : "Mark Watched"}
              </span>
            </button>

            {/* Shortcuts Help */}
            <button
              onClick={() => setShowShortcuts((prev) => !prev)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              title="Keyboard Shortcuts (?)"
            >
              <QuestionMarkCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>

            {/* Close */}
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

          {/* Shortcuts Overlay */}
          {showShortcuts && (
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10"
              onClick={() => setShowShortcuts(false)}
            >
              <div
                className="bg-[#232323] rounded-xl p-6 max-w-sm w-full mx-4 border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-white mb-4 text-center">shortcuts</h3>
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
                <p className="text-gray-500 text-xs mt-4 text-center">Press ? to toggle</p>
              </div>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-2 sm:mt-4 flex items-center justify-between text-xs sm:text-sm text-gray-400">
          <p>We automatically track your watch time while the tab is active.</p>
          <p className="hidden sm:block text-gray-500">Press ? for shortcuts</p>
        </div>
      </div>
    </div>
  );
}
