"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HeroCarousel from "@/components/HeroCarousel";
import MediaSlider from "@/components/MediaSlider";
import PlayerModal from "@/components/PlayerModal";
import {
  getTrending,
  getPopularMovies,
  getTopRatedMovies,
  getPopularTVShows,
  getTopRatedTVShows,
  Media,
} from "@/lib/tmdb";

export default function HomePage() {
  const router = useRouter();
  const [trendingAll, setTrendingAll] = useState<Media[]>([]);
  const [popularMovies, setPopularMovies] = useState<Media[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Media[]>([]);
  const [popularTV, setPopularTV] = useState<Media[]>([]);
  const [topRatedTV, setTopRatedTV] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  // Player state
  const [playerOpen, setPlayerOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<{
    id: number;
    type: "movie" | "tv";
    title: string;
  } | null>(null);

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
    });
    setPlayerOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Carousel */}
      <HeroCarousel items={trendingAll.slice(0, 5)} onPlay={handlePlay} />

      {/* Content Sliders */}
      <div className="space-y-8 pb-16">
        <MediaSlider
          title="🔥 Trending This Week"
          items={trendingAll}
          onPlay={handlePlay}
        />

        <MediaSlider
          title="🎬 Popular Movies"
          items={popularMovies}
          seeAllLink="/movies"
          onPlay={handlePlay}
        />

        <MediaSlider
          title="⭐ Top Rated Movies"
          items={topRatedMovies}
          seeAllLink="/movies?sort=top_rated"
          onPlay={handlePlay}
        />

        <MediaSlider
          title="📺 Popular TV Shows"
          items={popularTV}
          seeAllLink="/tv"
          onPlay={handlePlay}
        />

        <MediaSlider
          title="🏆 Top Rated TV Shows"
          items={topRatedTV}
          seeAllLink="/tv?sort=top_rated"
          onPlay={handlePlay}
        />
      </div>

      {/* Player Modal */}
      {currentMedia && (
        <PlayerModal
          isOpen={playerOpen}
          onClose={() => setPlayerOpen(false)}
          mediaType={currentMedia.type}
          mediaId={currentMedia.id}
          title={currentMedia.title}
        />
      )}
    </>
  );
}
