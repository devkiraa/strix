"use client";

import { useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import MediaCard, { MediaCardSkeleton } from "./MediaCard";
import { Media } from "@/lib/tmdb";
import Link from "next/link";

export interface MediaSliderProps {
  title: string;
  icon?: React.ReactNode;
  items: Media[];
  type?: "movie" | "tv" | "mixed";
  showType?: boolean;
  seeAllLink?: string;
  isLoading?: boolean;
  onPlay?: (media: Media) => void;
}

export default function MediaSlider({
  title,
  icon,
  items,
  type = "movie",
  showType = false,
  seeAllLink,
  isLoading = false,
  onPlay,
}: MediaSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.8;
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="mb-8 md:mb-12">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 mb-4">
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-white">
          {icon && <span className="text-red-500">{icon}</span>}
          {title}
        </h2>
        {seeAllLink && (
          <Link
            href={seeAllLink}
            className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            See All
            <ChevronRightIcon className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Slider Container */}
      <div className="relative group slider-container">
        {/* Left Button - Hidden on mobile */}
        <button
          onClick={() => scroll("left")}
          className="slider-btn hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-full bg-gradient-to-r from-black/80 to-transparent items-center justify-start pl-2 hover:from-black transition-all"
        >
          <ChevronLeftIcon className="w-8 h-8 text-white" />
        </button>

        {/* Right Button - Hidden on mobile */}
        <button
          onClick={() => scroll("right")}
          className="slider-btn hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-full bg-gradient-to-l from-black/80 to-transparent items-center justify-end pr-2 hover:from-black transition-all"
        >
          <ChevronRightIcon className="w-8 h-8 text-white" />
        </button>

        {/* Slider */}
        <div
          ref={sliderRef}
          className="flex gap-3 overflow-x-auto hide-scrollbar px-4 sm:px-6 lg:px-8 pb-2"
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <MediaCardSkeleton key={i} />
              ))
            : items.map((item) => (
                <MediaCard
                  key={`${item.media_type || type}-${item.id}`}
                  media={item}
                  type={type}
                  showType={showType}
                  onPlay={onPlay}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
