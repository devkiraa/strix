"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  PlayIcon,
  StarIcon,
  CalendarIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  FilmIcon,
} from "@heroicons/react/24/solid";
import {
  getTVDetails,
  getTVSeasonEpisodes,
  getImageUrl,
  getYear,
  getTrailerKey,
  MediaDetails,
  Episode,
  Season,
  Video,
} from "@/lib/tmdb";
import PlayerModal from "@/components/PlayerModal";
import TrailerModal from "@/components/TrailerModal";
import MediaSlider from "@/components/MediaSlider";

export default function TVDetailPage() {
  const params = useParams();
  const tvId = Number(params.id);

  const [show, setShow] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Fetch TV show details
  useEffect(() => {
    const fetchShow = async () => {
      try {
        const data = await getTVDetails(tvId);
        setShow(data);
        // Extract trailer key
        if (data.videos?.results) {
          const key = getTrailerKey(data.videos.results as Video[]);
          setTrailerKey(key);
        }
        // Set initial season to first non-specials season
        if (data.seasons && data.seasons.length > 0) {
          const firstRealSeason = data.seasons.find(
            (s) => s.season_number > 0
          );
          if (firstRealSeason) {
            setSelectedSeason(firstRealSeason.season_number);
          }
        }
      } catch (error) {
        console.error("Error fetching TV show:", error);
      } finally {
        setLoading(false);
      }
    };

    if (tvId) {
      fetchShow();
    }
  }, [tvId]);

  // Fetch episodes when season changes
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!tvId || selectedSeason < 1) return;

      setLoadingEpisodes(true);
      try {
        const seasonData: Season = await getTVSeasonEpisodes(tvId, selectedSeason);
        setEpisodes(seasonData.episodes || []);
      } catch (error) {
        console.error("Error fetching episodes:", error);
        setEpisodes([]);
      } finally {
        setLoadingEpisodes(false);
      }
    };

    fetchEpisodes();
  }, [tvId, selectedSeason]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">TV Show not found</h1>
        <Link href="/" className="btn-primary">
          Go Home
        </Link>
      </div>
    );
  }

  const currentSeason = show.seasons?.find(
    (s) => s.season_number === selectedSeason
  );

  const handlePlayEpisode = (seasonNum: number, episodeNum: number) => {
    setSelectedSeason(seasonNum);
    setSelectedEpisode(episodeNum);
    setPlayerOpen(true);
  };

  const handleSeasonChange = (seasonNum: number) => {
    setSelectedSeason(seasonNum);
    setSelectedEpisode(1);
    setShowSeasonDropdown(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="relative">
        <div className="absolute inset-0 h-[70vh]">
          {show.backdrop_path && (
            <Image
              src={getImageUrl(show.backdrop_path, "original")}
              alt={show.name || "TV Show backdrop"}
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
              {show.poster_path ? (
                <Image
                  src={getImageUrl(show.poster_path, "w500")}
                  alt={show.name || "TV Show poster"}
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 lg:mb-4">{show.name}</h1>

            {show.tagline && (
              <p className="text-base sm:text-lg lg:text-xl text-gray-400 italic mb-4 lg:mb-6">
                &quot;{show.tagline}&quot;
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-4 lg:mb-6">
              <div className="flex items-center gap-1 text-yellow-500">
                <StarIcon className="w-5 h-5" />
                <span className="font-semibold">
                  {show.vote_average?.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <CalendarIcon className="w-5 h-5" />
                <span>{getYear(show.first_air_date)}</span>
              </div>
              {show.number_of_seasons && (
                <span className="text-gray-400">
                  {show.number_of_seasons} Season
                  {show.number_of_seasons > 1 ? "s" : ""}
                </span>
              )}
              {show.number_of_episodes && (
                <span className="text-gray-400">
                  {show.number_of_episodes} Episodes
                </span>
              )}
            </div>

            {/* Genres */}
            {show.genres && show.genres.length > 0 && (
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-4 lg:mb-6">
                {show.genres.map((genre) => (
                  <Link
                    key={genre.id}
                    href={`/genre/${genre.id}?type=tv`}
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
                {show.overview || "No overview available."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 items-center sm:items-start">
              <button
                onClick={() => setPlayerOpen(true)}
                className="inline-flex items-center justify-center gap-2 btn-primary text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 w-full sm:w-auto"
              >
                <PlayIcon className="w-6 h-6" />
                Watch S{selectedSeason} E{selectedEpisode}
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

        {/* Seasons & Episodes */}
        {show.seasons && show.seasons.length > 0 && (
          <div className="mt-10 lg:mt-16">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl lg:text-2xl font-bold">Episodes</h2>
              <div className="text-sm text-gray-400">
                {currentSeason?.episode_count || episodes.length} Episodes
              </div>
            </div>

            {/* Season Tabs */}
            <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                {show.seasons
                  .filter((s) => s.season_number > 0)
                  .map((season) => (
                    <button
                      key={season.id}
                      onClick={() => handleSeasonChange(season.season_number)}
                      className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${selectedSeason === season.season_number
                          ? "bg-red-600 text-white shadow-lg shadow-red-600/25"
                          : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                      Season {season.season_number}
                    </button>
                  ))}
              </div>
            </div>

            {/* Episode Grid */}
            {loadingEpisodes ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-video rounded-lg bg-[#232323] mb-3" />
                    <div className="h-4 w-3/4 bg-[#232323] rounded mb-2" />
                    <div className="h-3 w-1/2 bg-[#1a1a1a] rounded" />
                  </div>
                ))}
              </div>
            ) : episodes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {episodes.map((episode: Episode) => (
                  <div
                    key={episode.id}
                    onClick={() => handlePlayEpisode(selectedSeason, episode.episode_number)}
                    className={`group cursor-pointer rounded-xl overflow-hidden bg-gradient-to-b from-white/5 to-transparent border transition-all duration-300 ${selectedEpisode === episode.episode_number
                        ? "border-red-500 shadow-lg shadow-red-500/20"
                        : "border-white/5 hover:border-white/20 hover:bg-white/5"
                      }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden">
                      {episode.still_path ? (
                        <Image
                          src={getImageUrl(episode.still_path, "w500")}
                          alt={episode.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#232323] to-[#1a1a1a] flex items-center justify-center">
                          <span className="text-gray-600 text-sm">No Preview</span>
                        </div>
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                          <PlayIcon className="w-6 h-6 text-black ml-0.5" />
                        </div>
                      </div>

                      {/* Episode Number */}
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md">
                        <span className="text-xs font-bold text-white">EP {episode.episode_number}</span>
                      </div>

                      {/* Rating */}
                      {episode.vote_average > 0 && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md">
                          <StarIcon className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs font-medium text-white">
                            {episode.vote_average.toFixed(1)}
                          </span>
                        </div>
                      )}

                      {/* Runtime */}
                      {episode.runtime && (
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md">
                          <span className="text-xs text-white">{episode.runtime}m</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h4 className="font-semibold text-white text-sm line-clamp-1 mb-1 group-hover:text-red-400 transition-colors">
                        {episode.name}
                      </h4>
                      {episode.air_date && (
                        <p className="text-xs text-gray-500 mb-2">
                          {new Date(episode.air_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {episode.overview || "No description available."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <FilmIcon className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400">No episodes available for this season.</p>
              </div>
            )}
          </div>
        )}

        {/* Cast Section */}
        {show.credits?.cast && show.credits.cast.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold mb-4">Cast</h3>
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
              {show.credits.cast.slice(0, 10).map((actor) => (
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

        {/* Similar Shows */}
        {show.similar && show.similar.results.length > 0 && (
          <div className="mt-16">
            <MediaSlider title="Similar TV Shows" items={show.similar.results} />
          </div>
        )}
      </div>

      {/* Player Modal */}
      <PlayerModal
        isOpen={playerOpen}
        onClose={() => setPlayerOpen(false)}
        mediaType="tv"
        mediaId={tvId}
        title={show.name || "TV Show"}
        posterPath={show.backdrop_path || show.poster_path || ""}
        season={selectedSeason}
        episode={selectedEpisode}
      />

      {/* Trailer Modal */}
      {trailerKey && (
        <TrailerModal
          isOpen={trailerOpen}
          onClose={() => setTrailerOpen(false)}
          trailerKey={trailerKey}
          title={show.name || "TV Show"}
        />
      )}
    </>
  );
}
