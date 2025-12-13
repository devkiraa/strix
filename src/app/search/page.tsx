"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import MediaCard from "@/components/MediaCard";
import PlayerModal from "@/components/PlayerModal";
import { searchMulti, Media } from "@/lib/tmdb";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(!!initialQuery);

  // Player state (for movies only)
  const [playerOpen, setPlayerOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<{
    id: number;
    title: string;
  } | null>(null);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await searchMulti(searchQuery);
      // Filter to only movies and TV shows
      const filtered = data.filter(
        (item) => item.media_type === "movie" || item.media_type === "tv"
      );
      setResults(filtered);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handlePlay = (media: Media) => {
    // For TV shows, navigate to detail page for episode selection
    if (media.media_type === "tv") {
      router.push(`/tv/${media.id}`);
      return;
    }
    
    // For movies, play directly
    setCurrentMedia({
      id: media.id,
      title: media.title || media.name || "Unknown",
    });
    setPlayerOpen(true);
  };

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      {/* Search Form */}
      <div className="max-w-3xl mx-auto mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">Search</h1>
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for movies, TV shows..."
            className="w-full px-4 sm:px-6 py-3 sm:py-4 pl-10 sm:pl-14 bg-[#232323] border border-white/10 rounded-full text-base sm:text-lg focus:outline-none focus:border-red-600 transition-colors"
          />
          <MagnifyingGlassIcon className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
          <button
            type="submit"
            className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 px-4 sm:px-6 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 rounded-full transition-colors text-sm sm:text-base"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <MediaCard key={i} loading />
          ))}
        </div>
      ) : results.length > 0 ? (
        <>
          <p className="text-gray-400 mb-4">
            Found {results.length} results for &quot;{query}&quot;
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((media) => (
              <MediaCard key={media.id} media={media} onPlay={handlePlay} />
            ))}
          </div>
        </>
      ) : searched ? (
        <div className="text-center py-10 sm:py-16">
          <p className="text-gray-400 text-lg sm:text-xl mb-4">No results found</p>
          <p className="text-gray-500 text-sm sm:text-base">
            Try different keywords or check the spelling
          </p>
        </div>
      ) : (
        <div className="text-center py-10 sm:py-16">
          <p className="text-gray-400 text-sm sm:text-base">
            Enter a search term to find movies and TV shows
          </p>
        </div>
      )}

      {/* Player Modal (movies only) */}
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

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
