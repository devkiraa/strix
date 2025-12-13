// TMDB API Configuration and Functions

const API_KEY = "999a2c8d29cd1833fa98446f909f19eb";
const BASE_URL = "https://api.themoviedb.org/3";

export const IMAGE_BASE = "https://image.tmdb.org/t/p";
export const POSTER_SIZE = "/w500";
export const BACKDROP_SIZE = "/w1280";
export const ORIGINAL_SIZE = "/original";
export const VIDSRC_BASE = "https://vidsrc.cc";

export interface Media {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  genre_ids?: number[];
  popularity?: number;
}

export interface MediaDetails extends Media {
  genres: { id: number; name: string }[];
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: Season[];
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  production_companies?: { id: number; name: string; logo_path: string | null }[];
  similar?: TMDBResponse<Media>;
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string }[];
  };
  videos?: {
    results: { id: string; key: string; type: string; site: string }[];
  };
}

export interface Season {
  id: number;
  season_number: number;
  episode_count: number;
  name: string;
  episodes?: Episode[];
}

export interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  air_date: string;
  runtime?: number;
  still_path?: string | null;
  vote_average: number;
}

export interface TMDBResponse<T> {
  results: T[];
  total_pages: number;
  total_results: number;
  page: number;
}

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append("api_key", API_KEY);
  url.searchParams.append("language", "en-US");

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), { next: { revalidate: 3600 } });

  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.status}`);
  }

  return response.json();
}

// Trending
export async function getTrending(mediaType: "all" | "movie" | "tv" = "all", timeWindow: "day" | "week" = "week"): Promise<Media[]> {
  const response = await fetchTMDB<TMDBResponse<Media>>(`/trending/${mediaType}/${timeWindow}`);
  return response.results;
}

export async function getTrendingMovies(timeWindow: "day" | "week" = "week"): Promise<Media[]> {
  const response = await fetchTMDB<TMDBResponse<Media>>(`/trending/movie/${timeWindow}`);
  return response.results;
}

// Movies
export async function getPopularMovies(page: number = 1): Promise<Media[]> {
  const response = await fetchTMDB<TMDBResponse<Media>>("/movie/popular", { page: page.toString() });
  return response.results;
}

export async function getTopRatedMovies(page: number = 1): Promise<Media[]> {
  const response = await fetchTMDB<TMDBResponse<Media>>("/movie/top_rated", { page: page.toString() });
  return response.results;
}

export async function getNowPlayingMovies(page: number = 1): Promise<Media[]> {
  const response = await fetchTMDB<TMDBResponse<Media>>("/movie/now_playing", { page: page.toString() });
  return response.results;
}

export async function getUpcomingMovies(page: number = 1): Promise<Media[]> {
  const response = await fetchTMDB<TMDBResponse<Media>>("/movie/upcoming", { page: page.toString() });
  return response.results;
}

export async function getMovieDetails(id: number): Promise<MediaDetails> {
  return fetchTMDB(`/movie/${id}`, { append_to_response: "credits,videos,similar" });
}

// TV Shows
export async function getPopularTVShows(page: number = 1): Promise<Media[]> {
  const response = await fetchTMDB<TMDBResponse<Media>>("/tv/popular", { page: page.toString() });
  return response.results;
}

export async function getTopRatedTVShows(page: number = 1): Promise<Media[]> {
  const response = await fetchTMDB<TMDBResponse<Media>>("/tv/top_rated", { page: page.toString() });
  return response.results;
}

export async function getTVDetails(id: number): Promise<MediaDetails> {
  return fetchTMDB(`/tv/${id}`, { append_to_response: "credits,videos,similar" });
}

export async function getTVSeasonEpisodes(tvId: number, seasonNumber: number): Promise<Season> {
  return fetchTMDB(`/tv/${tvId}/season/${seasonNumber}`);
}

// Discover
export async function discoverMovies(genreId: number, page: number = 1): Promise<Media[]> {
  const response = await fetchTMDB<TMDBResponse<Media>>("/discover/movie", {
    page: page.toString(),
    sort_by: "popularity.desc",
    with_genres: genreId.toString(),
  });
  return response.results;
}

export async function discoverTVShows(genreId: number, page: number = 1): Promise<Media[]> {
  const response = await fetchTMDB<TMDBResponse<Media>>("/discover/tv", {
    page: page.toString(),
    sort_by: "popularity.desc",
    with_genres: genreId.toString(),
  });
  return response.results;
}

// Search
export async function searchMulti(query: string, page: number = 1): Promise<Media[]> {
  const response = await fetchTMDB<TMDBResponse<Media>>("/search/multi", { query, page: page.toString() });
  return response.results;
}

export async function searchMovies(query: string, page: number = 1): Promise<Media[]> {
  const response = await fetchTMDB<TMDBResponse<Media>>("/search/movie", { query, page: page.toString() });
  return response.results;
}

export async function searchTV(query: string, page: number = 1): Promise<Media[]> {
  const response = await fetchTMDB<TMDBResponse<Media>>("/search/tv", { query, page: page.toString() });
  return response.results;
}

// Genres
export const MOVIE_GENRES = [
  { id: 28, name: "Action", icon: "⚡" },
  { id: 12, name: "Adventure", icon: "🧭" },
  { id: 16, name: "Animation", icon: "🎨" },
  { id: 35, name: "Comedy", icon: "😂" },
  { id: 80, name: "Crime", icon: "🔍" },
  { id: 99, name: "Documentary", icon: "📹" },
  { id: 18, name: "Drama", icon: "🎭" },
  { id: 10751, name: "Family", icon: "👨‍👩‍👧‍👦" },
  { id: 14, name: "Fantasy", icon: "🐉" },
  { id: 36, name: "History", icon: "📜" },
  { id: 27, name: "Horror", icon: "👻" },
  { id: 10402, name: "Music", icon: "🎵" },
  { id: 9648, name: "Mystery", icon: "🔮" },
  { id: 10749, name: "Romance", icon: "❤️" },
  { id: 878, name: "Sci-Fi", icon: "🚀" },
  { id: 53, name: "Thriller", icon: "😱" },
  { id: 10752, name: "War", icon: "⚔️" },
  { id: 37, name: "Western", icon: "🤠" },
];

// Helper functions
export function getImageUrl(path: string | null, size: string = POSTER_SIZE): string {
  if (!path) return "/placeholder.png";
  // Ensure size starts with /
  const sizeWithSlash = size.startsWith("/") ? size : `/${size}`;
  return `${IMAGE_BASE}${sizeWithSlash}${path}`;
}

export function getYear(date: string | undefined): string {
  if (!date) return "N/A";
  return date.split("-")[0];
}

export function getTitle(media: Media): string {
  return media.title || media.name || "Unknown";
}

export function getVidsrcUrl(type: "movie" | "tv", mediaId: number, season?: number, episode?: number): string {
  if (type === "movie") {
    return `${VIDSRC_BASE}/v2/embed/movie/${mediaId}?autoPlay=true`;
  }
  return `${VIDSRC_BASE}/v2/embed/tv/${mediaId}/${season || 1}/${episode || 1}?autoPlay=true`;
}

// Trailer helpers
export interface Video {
  id: string;
  key: string;
  type: string;
  site: string;
  name: string;
  official?: boolean;
}

export function getTrailerKey(videos: Video[] | undefined): string | null {
  if (!videos || videos.length === 0) return null;

  // Priority: Official Trailer > Trailer > Teaser > any video
  const officialTrailer = videos.find(
    (v) => v.site === "YouTube" && v.type === "Trailer" && v.official
  );
  if (officialTrailer) return officialTrailer.key;

  const trailer = videos.find(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  );
  if (trailer) return trailer.key;

  const teaser = videos.find(
    (v) => v.site === "YouTube" && v.type === "Teaser"
  );
  if (teaser) return teaser.key;

  const anyYouTube = videos.find((v) => v.site === "YouTube");
  if (anyYouTube) return anyYouTube.key;

  return null;
}

export function getYouTubeEmbedUrl(key: string): string {
  return `https://www.youtube.com/embed/${key}?autoplay=1&rel=0`;
}

export function getYouTubeThumbnail(key: string): string {
  return `https://img.youtube.com/vi/${key}/maxresdefault.jpg`;
}
