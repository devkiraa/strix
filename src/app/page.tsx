"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import HeroCarousel from "@/components/HeroCarousel";
import MediaSlider from "@/components/MediaSlider";
import PlayerModal from "@/components/PlayerModal";
import ContinueWatching from "@/components/ContinueWatching";
import {
  getTrending,
  getPopularMovies,
  getTopRatedMovies,
  getPopularTVShows,
  getTopRatedTVShows,
  Media,
} from "@/lib/tmdb";
import { getContinueWatching, WatchProgress } from "@/lib/watchProgress";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, watchProgress, refreshWatchProgress } = useAuth();

  const [trendingAll, setTrendingAll] = useState<Media[]>([]);
  const [popularMovies, setPopularMovies] = useState<Media[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Media[]>([]);
  const [popularTV, setPopularTV] = useState<Media[]>([]);
  const [topRatedTV, setTopRatedTV] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  // Continue watching state (local fallback for non-authenticated users)
  const [localContinueWatching, setLocalContinueWatching] = useState<WatchProgress[]>([]);

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

  // Get continue watching items based on auth state
  const continueWatching = isAuthenticated
    ? watchProgress.map(item => ({
      ...item,
      lastWatched: item.lastWatched,
    }))
    : localContinueWatching;

  // Refresh continue watching (handles both auth and local)
  const handleRefreshContinueWatching = useCallback(() => {
    if (isAuthenticated) {
      refreshWatchProgress();
    } else {
      setLocalContinueWatching(getContinueWatching());
    }
  }, [isAuthenticated, refreshWatchProgress]);

  // Load local continue watching on mount
  useEffect(() => {
    if (!isAuthenticated) {
      setLocalContinueWatching(getContinueWatching());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trending, popMovies, topMovies, popTV, topTV] = await Promise.all([
          getTrending("all", "week"),
          getPopularMovies(),
          getTopRatedMovies(),
          getPopularTVShows(),
          getTopRatedTVShows(),
        ]);

        setTrendingAll(trending);
        setPopularMovies(popMovies);
        setTopRatedMovies(topMovies);
        setPopularTV(popTV);
        setTopRatedTV(topTV);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePlay = (media: Media) => {
    const mediaType = media.media_type || (media.title ? "movie" : "tv");

    // For TV shows, navigate to detail page for episode selection
    if (mediaType === "tv") {
      router.push(`/tv/${media.id}`);
      return;
    }

    // For movies, play directly
    setCurrentMedia({
      id: media.id,
      type: "movie",
      title: media.title || media.name || "Unknown",
      posterPath: media.backdrop_path || media.poster_path || "",
    });
    setPlayerOpen(true);
  };

  const handleContinueWatchingPlay = (item: WatchProgress) => {
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

  const handlePlayerClose = () => {
    setPlayerOpen(false);
    // Refresh continue watching after closing player
    handleRefreshContinueWatching();
  };

  if (loading) {
    return (
      <>
        {/* Hero Skeleton */}
        <div className="relative h-[60vh] sm:h-[70vh] bg-gradient-to-b from-[#1a1a1a] to-[#141414]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 lg:p-16">
            <div className="max-w-2xl space-y-4 animate-pulse">
              <div className="h-4 w-24 bg-white/10 rounded" />
              <div className="h-10 w-3/4 bg-white/10 rounded" />
              <div className="h-4 w-full bg-white/10 rounded" />
              <div className="h-4 w-2/3 bg-white/10 rounded" />
              <div className="flex gap-4 pt-4">
                <div className="h-12 w-36 bg-white/10 rounded-lg" />
                <div className="h-12 w-36 bg-white/10 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-8 pb-16 px-4 sm:px-6 lg:px-8">
          {[1, 2, 3].map((section) => (
            <div key={section} className="pt-8">
              <div className="h-6 w-48 bg-white/10 rounded mb-4 animate-pulse" />
              <div className="flex gap-3 overflow-hidden">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[150px] sm:w-[180px] animate-pulse">
                    <div className="aspect-[2/3] rounded-lg bg-gradient-to-br from-[#232323] to-[#1a1a1a]" />
                    <div className="mt-3 space-y-2">
                      <div className="h-4 w-4/5 bg-[#232323] rounded" />
                      <div className="h-3 w-1/3 bg-[#1a1a1a] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {/* Hero Carousel */}
      <HeroCarousel items={trendingAll.slice(0, 5)} onPlay={handlePlay} />

      {/* Content Sliders */}
      <div className="space-y-8 pb-16">
        {/* Continue Watching - Only show if there are items */}
        <ContinueWatching
          items={continueWatching}
          onPlay={handleContinueWatchingPlay}
          onRefresh={handleRefreshContinueWatching}
        />

        <MediaSlider
          title="Trending This Week"
          items={trendingAll}
          onPlay={handlePlay}
        />

        <MediaSlider
          title="Popular Movies"
          items={popularMovies}
          seeAllLink="/movies"
          onPlay={handlePlay}
        />

        <MediaSlider
          title="Top Rated Movies"
          items={topRatedMovies}
          seeAllLink="/movies?sort=top_rated"
          onPlay={handlePlay}
        />

        <MediaSlider
          title="Popular TV Shows"
          items={popularTV}
          seeAllLink="/tv"
          onPlay={handlePlay}
        />

        <MediaSlider
          title="Top Rated TV Shows"
          items={topRatedTV}
          seeAllLink="/tv?sort=top_rated"
          onPlay={handlePlay}
        />
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
          onProgressUpdate={handleRefreshContinueWatching}
        />
      )}
    </>
  );
}
