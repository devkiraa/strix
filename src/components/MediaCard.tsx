"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Media, getImageUrl, getTitle, getYear } from "@/lib/tmdb";
import { StarIcon, PlayIcon } from "@heroicons/react/24/solid";

export interface MediaCardProps {
  media?: Media;
  type?: "movie" | "tv" | "mixed";
  showType?: boolean;
  onPlay?: (media: Media) => void;
  loading?: boolean;
}

export default function MediaCard({ media, type = "movie", showType = false, onPlay, loading }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (loading || !media) {
    return <MediaCardSkeleton />;
  }

  const mediaType = media.media_type || type;
  const href = `/${mediaType}/${media.id}`;
  const title = getTitle(media);
  const year = getYear(media.release_date || media.first_air_date);
  const rating = media.vote_average?.toFixed(1) || "N/A";

  const handlePlayClick = (e: React.MouseEvent) => {
    if (onPlay) {
      e.preventDefault();
      e.stopPropagation();
      onPlay(media);
    }
  };

  return (
    <Link
      href={href}
      className="media-card relative bg-[#181818] rounded-lg overflow-hidden flex-shrink-0 w-[150px] sm:w-[180px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <Image
          src={getImageUrl(media.poster_path)}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 150px, 180px"
        />

        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"
            }`}
        >
          <button
            onClick={handlePlayClick}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              className={`w-14 h-14 bg-white/90 rounded-full flex items-center justify-center transition-transform duration-300 ${isHovered ? "scale-100" : "scale-0"
                }`}
            >
              <PlayIcon className="w-7 h-7 text-black ml-1" />
            </div>
          </button>
        </div>

        {/* Type Badge */}
        {showType && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white text-xs font-semibold rounded uppercase">
            {mediaType === "tv" ? "TV" : "Movie"}
          </span>
        )}

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-black/70 rounded text-sm">
          <StarIcon className="w-3.5 h-3.5 text-yellow-500" />
          <span className="text-white font-medium">{rating}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-white font-medium text-sm truncate" title={title}>
          {title}
        </h3>
        <p className="text-gray-500 text-xs mt-1">{year}</p>
      </div>
    </Link>
  );
}

// Loading Skeleton with improved animation
export function MediaCardSkeleton() {
  return (
    <div className="w-[150px] sm:w-[180px] flex-shrink-0 animate-pulse">
      {/* Poster skeleton */}
      <div className="aspect-[2/3] rounded-lg bg-gradient-to-br from-[#232323] to-[#1a1a1a] overflow-hidden relative">
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skeleton-shimmer" />
        {/* Rating badge placeholder */}
        <div className="absolute top-2 right-2 w-12 h-5 bg-white/10 rounded" />
      </div>
      {/* Text skeleton */}
      <div className="mt-3 space-y-2">
        <div className="h-4 w-4/5 rounded bg-[#232323]" />
        <div className="h-3 w-1/3 rounded bg-[#1a1a1a]" />
      </div>
    </div>
  );
}
