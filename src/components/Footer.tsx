import Link from "next/link";
import { PlayCircleIcon } from "@heroicons/react/24/solid";
import { FilmIcon, TvIcon, HomeIcon } from "@heroicons/react/24/outline";

export default function Footer() {
  const quickLinks = [
    { label: "Home", href: "/", icon: HomeIcon },
    { label: "Movies", href: "/movies", icon: FilmIcon },
    { label: "TV Shows", href: "/tv", icon: TvIcon },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "DMCA", href: "/dmca" },
  ];

  return (
    <footer className="relative mt-20">
      {/* Gradient divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />

      <div className="bg-gradient-to-b from-[#141414] to-[#0a0a0a]">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="md:col-span-4 lg:col-span-5">
              <Link href="/" className="inline-flex items-center gap-2 group">
                <PlayCircleIcon className="w-10 h-10 text-red-600 group-hover:text-red-500 transition-colors" />
                <span className="text-2xl font-bold text-white">
                  Str<span className="text-red-600">ix</span>
                </span>
              </Link>
              <p className="mt-4 text-gray-400 text-sm leading-relaxed max-w-md">
                Your ultimate destination for streaming movies and TV shows.
                Discover, watch, and enjoy unlimited entertainment anytime, anywhere.
              </p>

              {/* Social Links */}
              <div className="flex gap-3 mt-6">
                <SocialLink href="https://github.com" label="GitHub">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </SocialLink>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-4 lg:col-span-3">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                Quick Links
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group"
                    >
                      <link.icon className="w-4 h-4 text-gray-500 group-hover:text-red-500 transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div className="md:col-span-4 lg:col-span-4">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Disclaimer */}
              <div className="mt-6 p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-gray-500 text-xs leading-relaxed">
                  This site does not store any files on its server. All contents are provided by non-affiliated third parties.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} Strix. All rights reserved.
              </p>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <span>Made with</span>
                <span className="text-red-500">♥</span>
                <span>for movie lovers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-9 h-9 bg-white/5 hover:bg-red-600 border border-white/10 hover:border-red-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
    >
      {children}
    </a>
  );
}
