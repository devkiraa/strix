"use client";

import { useState, useEffect, Suspense } from "react";
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
  } | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        let data: Media[] = [];
        if (activeGenre) {
          data = await discoverMovies(activeGenre, page);
        } else if (sort === "top_rated") {
          data = await getTopRatedMovies(page);
        } else {
          data = await getPopularMovies(page);
        }

        if (page === 1) {
          setMovies(data);
        } else {
          setMovies((prev) => [...prev, ...data]);
        }
        setHasMore(data.length === 20);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [sort, activeGenre, page]);

  const handleGenreChange = (genreId: number | null) => {
    setActiveGenre(genreId);
    setPage(1);
    setMovies([]);
  };

  const handlePlay = (movie: Media) => {
    setCurrentMedia({
      id: movie.id,
      title: movie.title || movie.name || "Unknown",
    });
    setPlayerOpen(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {activeGenre
            ? MOVIE_GENRES.find((g) => g.id === activeGenre)?.name + " Movies"
            : sort === "top_rated"
            ? "Top Rated Movies"
            : "Popular Movies"}
        </h1>

        {/* Genre Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleGenreChange(null)}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              !activeGenre
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
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                activeGenre === genre.id
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
      {movies.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <MediaCard
                key={movie.id}
                media={{ ...movie, media_type: "movie" }}
                onPlay={handlePlay}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                disabled={loading}
                className="btn-primary px-8 py-3 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      ) : loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <MediaCard key={i} loading />
          ))}
        </div>
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
