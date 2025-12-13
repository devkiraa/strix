"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  PlayIcon,
  StarIcon,
  CalendarIcon,
  ClockIcon,
  ArrowLeftIcon,
  FilmIcon,
} from "@heroicons/react/24/solid";
import {
  getMovieDetails,
  getImageUrl,
  getYear,
  getTrailerKey,
  MediaDetails,
  Video,
} from "@/lib/tmdb";
import PlayerModal from "@/components/PlayerModal";
import TrailerModal from "@/components/TrailerModal";
import MediaSlider from "@/components/MediaSlider";

export default function MovieDetailPage() {
  const params = useParams();
  const movieId = Number(params.id);

  const [movie, setMovie] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const data = await getMovieDetails(movieId);
        setMovie(data);
        // Extract trailer key
        if (data.videos?.results) {
          const key = getTrailerKey(data.videos.results as Video[]);
          setTrailerKey(key);
        }
      } catch (error) {
        console.error("Error fetching movie:", error);
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovie();
    }
  }, [movieId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Movie not found</h1>
        <Link href="/" className="btn-primary">
          Go Home
        </Link>
      </div>
    );
  }

  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : "N/A";

  return (
    <>
      {/* Backdrop */}
      <div className="relative">
        <div className="absolute inset-0 h-[70vh]">
          {movie.backdrop_path && (
            <Image
              src={getImageUrl(movie.backdrop_path, "original")}
              alt={movie.title || "Movie backdrop"}
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-32">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </Link>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <div className="relative w-[200px] h-[300px] sm:w-[250px] sm:h-[375px] lg:w-[300px] lg:h-[450px] rounded-lg overflow-hidden shadow-2xl mx-auto lg:mx-0">
              {movie.poster_path ? (
                <Image
                  src={getImageUrl(movie.poster_path, "w500")}
                  alt={movie.title || "Movie poster"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#232323] flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-grow text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 lg:mb-4">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-base sm:text-lg lg:text-xl text-gray-400 italic mb-4 lg:mb-6">
                &quot;{movie.tagline}&quot;
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-4 lg:mb-6">
              <div className="flex items-center gap-1 text-yellow-500">
                <StarIcon className="w-5 h-5" />
                <span className="font-semibold">
                  {movie.vote_average?.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <CalendarIcon className="w-5 h-5" />
                <span>{getYear(movie.release_date)}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <ClockIcon className="w-5 h-5" />
                <span>{runtime}</span>
              </div>
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-4 lg:mb-6">
                {movie.genres.map((genre) => (
                  <Link
                    key={genre.id}
                    href={`/genre/${genre.id}?type=movie`}
                    className="px-3 py-1 bg-white/10 hover:bg-red-600 rounded-full text-sm transition-colors"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Overview */}
            <div className="mb-6 lg:mb-8">
              <h3 className="text-lg lg:text-xl font-semibold mb-2">Overview</h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-3xl">
                {movie.overview || "No overview available."}
              </p>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8 pb-6 lg:pb-8 border-b border-white/10">
              {movie.status && (
                <div>
                  <h4 className="text-gray-500 text-sm">Status</h4>
                  <p className="font-medium">{movie.status}</p>
                </div>
              )}
              {(movie.budget ?? 0) > 0 && (
                <div>
                  <h4 className="text-gray-500 text-sm">Budget</h4>
                  <p className="font-medium">
                    ${movie.budget?.toLocaleString()}
                  </p>
                </div>
              )}
              {(movie.revenue ?? 0) > 0 && (
                <div>
                  <h4 className="text-gray-500 text-sm">Revenue</h4>
                  <p className="font-medium">
                    ${movie.revenue?.toLocaleString()}
                  </p>
                </div>
              )}
              {movie.production_companies &&
                movie.production_companies.length > 0 && (
                  <div className="col-span-2 md:col-span-3">
                    <h4 className="text-gray-500 text-sm">Production</h4>
                    <p className="font-medium">
                      {movie.production_companies
                        .map((c) => c.name)
                        .join(", ")}
                    </p>
                  </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 items-center sm:items-start">
              <button
                onClick={() => setPlayerOpen(true)}
                className="inline-flex items-center justify-center gap-2 btn-primary text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 w-full sm:w-auto"
              >
                <PlayIcon className="w-6 h-6" />
                Watch Now
              </button>

              {trailerKey && (
                <button
                  onClick={() => setTrailerOpen(true)}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 rounded-lg transition-colors w-full sm:w-auto"
                >
                  <FilmIcon className="w-6 h-6" />
                  Watch Trailer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cast Section */}
        {movie.credits?.cast && movie.credits.cast.length > 0 && (
          <div className="mt-8 lg:mt-12">
            <h3 className="text-lg lg:text-xl font-bold mb-3 lg:mb-4">Cast</h3>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
              {movie.credits.cast.slice(0, 10).map((actor) => (
                <div
                  key={actor.id}
                  className="flex-shrink-0 w-20 text-center"
                >
                  <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-2">
                    {actor.profile_path ? (
                      <Image
                        src={getImageUrl(actor.profile_path, "w185")}
                        alt={actor.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#232323] flex items-center justify-center">
                        <span className="text-gray-500 text-2xl">👤</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium truncate">{actor.name}</p>
                  <p className="text-xs text-gray-500 truncate">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Movies */}
        {movie.similar && movie.similar.results.length > 0 && (
          <div className="mt-16">
            <MediaSlider
              title="Similar Movies"
              items={movie.similar.results}
            />
          </div>
        )}
      </div>

      {/* Player Modal */}
      <PlayerModal
        isOpen={playerOpen}
        onClose={() => setPlayerOpen(false)}
        mediaType="movie"
        mediaId={movieId}
        title={movie.title || "Movie"}
        posterPath={movie.backdrop_path || movie.poster_path || ""}
        duration={movie.runtime}
      />

      {/* Trailer Modal */}
      {trailerKey && (
        <TrailerModal
          isOpen={trailerOpen}
          onClose={() => setTrailerOpen(false)}
          trailerKey={trailerKey}
          title={movie.title || "Movie"}
        />
      )}
    </>
  );
}
