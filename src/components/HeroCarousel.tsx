"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, InformationCircleIcon, StarIcon } from "@heroicons/react/24/solid";
import { Media, getImageUrl, getTitle, getYear, ORIGINAL_SIZE } from "@/lib/tmdb";

interface HeroCarouselProps {
  items: Media[];
  onPlay?: (media: Media) => void;
}

export default function HeroCarousel({ items, onPlay }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const goToNext = useCallback(() => {
    if (!items || items.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items]);

  const goToPrev = () => {
    if (!items || items.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || !items || items.length === 0) return;
    const interval = setInterval(goToNext, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext, items]);

  // Resume auto-play after pause
  useEffect(() => {
    if (isAutoPlaying) return;
    const timeout = setTimeout(() => setIsAutoPlaying(true), 10000);
    return () => clearTimeout(timeout);
  }, [isAutoPlaying]);

  if (!items || items.length === 0) return null;

  const current = items[currentIndex];
  const mediaType = current.media_type === "tv" ? "tv" : "movie";
  const title = getTitle(current);
  const year = getYear(current.release_date || current.first_air_date);
  const rating = current.vote_average?.toFixed(1) || "N/A";

  const handlePlayClick = () => {
    if (onPlay) {
      onPlay(current);
    }
  };

  return (
    <section className="relative h-[70vh] md:h-[85vh] min-h-[500px] overflow-hidden">
      {/* Background Images */}
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
        >
          <Image
            src={getImageUrl(item.backdrop_path, ORIGINAL_SIZE)}
            alt={getTitle(item)}
            fill
            className="object-cover object-top"
            priority={index === 0}
          />
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative h-full flex items-end pb-20 md:pb-32">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl animate-fadeIn" key={currentIndex}>
            {/* Badge */}
            <span className="inline-flex items-center gap-2 bg-red-600/90 text-white px-3 py-1.5 rounded-md text-sm font-semibold mb-4">
              Trending #{currentIndex + 1}
            </span>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              {title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-4">
              <span className="flex items-center gap-1">
                <StarIcon className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">{rating}</span>
              </span>
              <span>{year}</span>
              <span className="uppercase text-xs px-2 py-1 bg-white/20 rounded">
                {mediaType === "tv" ? "TV Series" : "Movie"}
              </span>
            </div>

            {/* Overview */}
            <p className="text-gray-300 text-base md:text-lg line-clamp-3 mb-6 max-w-xl">
              {current.overview || "No description available."}
            </p>

            {/* Buttons */}
            <div className="flex flex-row gap-3 items-center">
              <button
                onClick={handlePlayClick}
                className="inline-flex flex-row flex-nowrap items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-md font-semibold hover:bg-white/90 transition-colors whitespace-nowrap"
              >
                <PlayIcon className="w-5 h-5 flex-shrink-0" />
                <span>Watch Now</span>
              </button>
              <Link
                href={`/${mediaType}/${current.id}`}
                className="inline-flex flex-row flex-nowrap items-center justify-center gap-2 bg-white/20 text-white px-6 py-3 rounded-md font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm whitespace-nowrap"
              >
                <InformationCircleIcon className="w-5 h-5 flex-shrink-0" />
                <span>More Info</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
        {/* Left Arrow */}
        <button
          onClick={goToPrev}
          className="p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5 text-white" />
        </button>

        {/* Indicators */}
        <div className="flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentIndex
                ? "bg-red-600 w-8"
                : "bg-white/50 hover:bg-white/70"
                }`}
            />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={goToNext}
          className="p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors"
        >
          <ChevronRightIcon className="w-5 h-5 text-white" />
        </button>
      </div>
    </section>
  );
}
