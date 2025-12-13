"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import MediaCard from "@/components/MediaCard";
import PlayerModal from "@/components/PlayerModal";
import {
  getPopularMovies,
  getTopRatedMovies,
  discoverMovies,
  Media,
  MOVIE_GENRES,
} from "@/lib/tmdb";

function MoviesContent() {
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") || "popular";
  const genreId = searchParams.get("genre");

  const [movies, setMovies] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeGenre, setActiveGenre] = useState<number | null>(
    genreId ? Number(genreId) : null
  );

  // Player state
  const [playerOpen, setPlayerOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<{
    id: number;
    title: string;
    posterPath?: string;
  } | null>(null);

  // Infinite scroll ref
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch movies
  const fetchMovies = useCallback(async (pageNum: number, isInitial: boolean) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let data: Media[] = [];
      if (activeGenre) {
        data = await discoverMovies(activeGenre, pageNum);
      } else if (sort === "top_rated") {
        data = await getTopRatedMovies(pageNum);
      } else {
        data = await getPopularMovies(pageNum);
      }

      if (isInitial) {
        setMovies(data);
      } else {
        setMovies((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === 20);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeGenre, sort]);

  // Initial fetch
  useEffect(() => {
    setPage(1);
    fetchMovies(1, true);
  }, [fetchMovies]);

  // Infinite scroll observer
  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    observerRef.current = observer;

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore, loadingMore]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchMovies(page, false);
    }
  }, [page, fetchMovies]);

  const handleGenreChange = (genreId: number | null) => {
    setActiveGenre(genreId);
    setPage(1);
    setMovies([]);
  };

  const handlePlay = (movie: Media) => {
    setCurrentMedia({
      id: movie.id,
      title: movie.title || movie.name || "Unknown",
      posterPath: movie.backdrop_path || movie.poster_path || "",
    });
    setPlayerOpen(true);
  };

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
          {activeGenre
            ? MOVIE_GENRES.find((g) => g.id === activeGenre)?.name + " Movies"
            : sort === "top_rated"
              ? "Top Rated Movies"
              : "Popular Movies"}
        </h1>

        {/* Genre Filter */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button
            onClick={() => handleGenreChange(null)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm transition-colors ${!activeGenre
              ? "bg-red-600 text-white"
              : "bg-white/10 hover:bg-white/20 text-gray-300"
              }`}
          >
            All
          </button>
          {MOVIE_GENRES.map((genre) => (
            <button
              key={genre.id}
              onClick={() => handleGenreChange(genre.id)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm transition-colors ${activeGenre === genre.id
                ? "bg-red-600 text-white"
                : "bg-white/10 hover:bg-white/20 text-gray-300"
                }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <MediaCard key={i} loading />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
            {movies.map((movie) => (
              <MediaCard
                key={movie.id}
                media={{ ...movie, media_type: "movie" }}
                onPlay={handlePlay}
              />
            ))}
          </div>

          {/* Infinite scroll trigger */}
          <div ref={loadMoreRef} className="flex justify-center py-8">
            {loadingMore && (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-400">Loading more...</span>
              </div>
            )}
            {!hasMore && movies.length > 0 && (
              <p className="text-gray-500">You&apos;ve reached the end</p>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-400">No movies found</p>
        </div>
      )}

      {/* Player Modal */}
      {currentMedia && (
        <PlayerModal
          isOpen={playerOpen}
          onClose={() => setPlayerOpen(false)}
          mediaType="movie"
          mediaId={currentMedia.id}
          title={currentMedia.title}
          posterPath={currentMedia.posterPath}
        />
      )}
    </div>
  );
}

export default function MoviesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MoviesContent />
    </Suspense>
  );
}
