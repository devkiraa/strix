"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MediaCard from "@/components/MediaCard";
import {
  getPopularTVShows,
  getTopRatedTVShows,
  discoverTVShows,
  Media,
} from "@/lib/tmdb";

const TV_GENRES = [
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 10762, name: "Kids" },
  { id: 9648, name: "Mystery" },
  { id: 10763, name: "News" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10766, name: "Soap" },
  { id: 10767, name: "Talk" },
  { id: 10768, name: "War & Politics" },
  { id: 37, name: "Western" },
];

function TVShowsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sort = searchParams.get("sort") || "popular";
  const genreId = searchParams.get("genre");

  const [shows, setShows] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeGenre, setActiveGenre] = useState<number | null>(
    genreId ? Number(genreId) : null
  );

  // Infinite scroll ref
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch shows
  const fetchShows = useCallback(async (pageNum: number, isInitial: boolean) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let data: Media[] = [];
      if (activeGenre) {
        data = await discoverTVShows(activeGenre, pageNum);
      } else if (sort === "top_rated") {
        data = await getTopRatedTVShows(pageNum);
      } else {
        data = await getPopularTVShows(pageNum);
      }

      if (isInitial) {
        setShows(data);
      } else {
        setShows((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === 20);
    } catch (error) {
      console.error("Error fetching TV shows:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeGenre, sort]);

  // Initial fetch
  useEffect(() => {
    setPage(1);
    fetchShows(1, true);
  }, [fetchShows]);

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
      fetchShows(page, false);
    }
  }, [page, fetchShows]);

  const handleGenreChange = (genreId: number | null) => {
    setActiveGenre(genreId);
    setPage(1);
    setShows([]);
  };

  // Navigate to TV show detail page for episode selection
  const handlePlay = (show: Media) => {
    router.push(`/tv/${show.id}`);
  };

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
          {activeGenre
            ? TV_GENRES.find((g) => g.id === activeGenre)?.name + " TV Shows"
            : sort === "top_rated"
              ? "Top Rated TV Shows"
              : "Popular TV Shows"}
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
          {TV_GENRES.map((genre) => (
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

      {/* TV Shows Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <MediaCard key={i} loading />
          ))}
        </div>
      ) : shows.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
            {shows.map((show) => (
              <MediaCard
                key={show.id}
                media={{ ...show, media_type: "tv" }}
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
            {!hasMore && shows.length > 0 && (
              <p className="text-gray-500">You&apos;ve reached the end</p>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-400">No TV shows found</p>
        </div>
      )}
    </div>
  );
}

export default function TVShowsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TVShowsContent />
    </Suspense>
  );
}
