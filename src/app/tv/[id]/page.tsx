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
} from "@heroicons/react/24/solid";
import {
  getTVDetails,
  getTVSeasonEpisodes,
  getImageUrl,
  getYear,
  MediaDetails,
  Episode,
  Season,
} from "@/lib/tmdb";
import PlayerModal from "@/components/PlayerModal";
import MediaSlider from "@/components/MediaSlider";

export default function TVDetailPage() {
  const params = useParams();
  const tvId = Number(params.id);

  const [show, setShow] = useState<MediaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerOpen, setPlayerOpen] = useState(false);
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

            {/* Play Button */}
            <button
              onClick={() => setPlayerOpen(true)}
              className="btn-primary text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 w-full sm:w-auto"
            >
              <PlayIcon className="w-6 h-6" />
              Watch S{selectedSeason} E{selectedEpisode}
            </button>
          </div>
        </div>

        {/* Seasons & Episodes */}
        {show.seasons && show.seasons.length > 0 && (
          <div className="mt-10 lg:mt-16">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 lg:mb-6">
              <h2 className="text-xl lg:text-2xl font-bold">Episodes</h2>

              {/* Season Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#232323] hover:bg-[#2a2a2a] rounded-lg transition-colors"
                >
                  Season {selectedSeason}
                  <ChevronDownIcon className="w-5 h-5" />
                </button>

                {showSeasonDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-[#232323] rounded-lg shadow-xl z-20 max-h-64 overflow-y-auto">
                    {show.seasons
                      .filter((s) => s.season_number > 0)
                      .map((season) => (
                        <button
                          key={season.id}
                          onClick={() => handleSeasonChange(season.season_number)}
                          className={`w-full text-left px-4 py-2 hover:bg-white/10 transition-colors ${
                            selectedSeason === season.season_number
                              ? "bg-red-600"
                              : ""
                          }`}
                        >
                          Season {season.season_number}
                          <span className="text-gray-400 text-sm ml-2">
                            ({season.episode_count} ep)
                          </span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Episode List */}
            <div className="grid gap-4">
              {loadingEpisodes ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : episodes.length > 0 ? (
                episodes.map((episode: Episode) => (
                <div
                  key={episode.id}
                  className={`flex flex-col sm:flex-row gap-4 bg-[#1a1a1a] rounded-lg overflow-hidden hover:bg-[#232323] transition-colors cursor-pointer ${
                    selectedEpisode === episode.episode_number ? "ring-2 ring-red-600" : ""
                  }`}
                  onClick={() => handlePlayEpisode(selectedSeason, episode.episode_number)}
                >
                  {/* Episode Thumbnail */}
                  <div className="relative w-full sm:w-64 h-36 flex-shrink-0">
                    {episode.still_path ? (
                      <Image
                        src={getImageUrl(episode.still_path, "w300")}
                        alt={episode.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#232323] flex items-center justify-center">
                        <span className="text-gray-500">No Preview</span>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                      <PlayIcon className="w-12 h-12 text-white" />
                    </div>
                    {/* Episode Number Badge */}
                    <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-sm font-semibold">
                      E{episode.episode_number}
                    </div>
                  </div>

                  {/* Episode Info */}
                  <div className="flex-grow p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {episode.name}
                        </h4>
                        <div className="flex items-center gap-3 text-gray-500 text-sm mt-1">
                          {episode.air_date && (
                            <span>
                              {new Date(episode.air_date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                              })}
                            </span>
                          )}
                          {episode.runtime && (
                            <span>{episode.runtime} min</span>
                          )}
                        </div>
                      </div>
                      {episode.vote_average > 0 && (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <StarIcon className="w-4 h-4" />
                          <span className="text-sm">
                            {episode.vote_average.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                      {episode.overview || "No description available."}
                    </p>
                  </div>
                </div>
              ))
              ) : (
                <p className="text-gray-400 py-8 text-center">No episodes available for this season.</p>
              )}
            </div>
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
        season={selectedSeason}
        episode={selectedEpisode}
      />
    </>
  );
}
