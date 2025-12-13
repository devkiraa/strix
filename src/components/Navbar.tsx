"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  MagnifyingGlassIcon, 
  FilmIcon, 
  TvIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
  PlusCircleIcon,
  BellIcon
} from "@heroicons/react/24/outline";
import { PlayCircleIcon } from "@heroicons/react/24/solid";
import { MOVIE_GENRES } from "@/lib/tmdb";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/movies", label: "Movies", icon: FilmIcon },
    { href: "/tv", label: "TV Shows", icon: TvIcon },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#141414]/90 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <PlayCircleIcon className="w-8 h-8 lg:w-10 lg:h-10 text-red-600" />
              <span className="text-xl lg:text-2xl font-bold">
                Cine<span className="text-gradient">Stream</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "text-white bg-white/10"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}

              {/* Genres Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsGenreOpen(!isGenreOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <span>Genres</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isGenreOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isGenreOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsGenreOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-64 bg-[#232323] border border-white/10 rounded-lg shadow-xl z-50 py-2 max-h-[70vh] overflow-y-auto">
                      {MOVIE_GENRES.map((genre) => (
                        <Link
                          key={genre.id}
                          href={`/genre/${genre.id}?name=${encodeURIComponent(genre.name)}`}
                          onClick={() => setIsGenreOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-red-600/20 transition-colors"
                        >
                          <span className="text-lg">{genre.icon}</span>
                          <span>{genre.name}</span>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                title="Search"
              >
                <MagnifyingGlassIcon className="w-6 h-6" />
              </button>

              {/* Notifications */}
              <button className="hidden sm:flex p-2 rounded-full hover:bg-white/10 transition-colors relative">
                <BellIcon className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
              </button>

              {/* Request Button */}
              <Link
                href="/request"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <PlusCircleIcon className="w-5 h-5" />
                <span className="hidden md:inline">Request</span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#141414] border-t border-white/10">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                      isActive
                        ? "bg-red-600 text-white"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/request"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10"
              >
                <PlusCircleIcon className="w-5 h-5" />
                Request Content
              </Link>
              
              {/* Mobile Genres */}
              <div className="pt-2 border-t border-white/10">
                <p className="px-4 py-2 text-sm text-gray-500 uppercase">Genres</p>
                <div className="grid grid-cols-2 gap-1">
                  {MOVIE_GENRES.slice(0, 8).map((genre) => (
                    <Link
                      key={genre.id}
                      href={`/genre/${genre.id}?name=${encodeURIComponent(genre.name)}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 rounded-lg"
                    >
                      <span>{genre.icon}</span>
                      <span>{genre.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Simple Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          />
          <div className="relative w-full max-w-2xl mx-4 animate-fade-in">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for movies, TV shows..."
                  className="w-full px-14 py-4 bg-[#232323] border border-white/10 rounded-xl text-lg focus:outline-none focus:border-red-600 transition-colors"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </form>
            <p className="text-center text-gray-500 mt-4 text-sm">
              Press Enter to search or ESC to close
            </p>
          </div>
        </div>
      )}
    </>
  );
}
