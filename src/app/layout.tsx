import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CineStream - Watch Movies & TV Shows Online Free",
  description:
    "Stream the latest movies and TV shows in HD quality. No signup required. Watch unlimited content for free.",
  keywords: "movies, tv shows, streaming, free movies, watch online, HD movies",
  openGraph: {
    title: "CineStream - Free Movies & TV Shows Streaming",
    description:
      "Stream the latest movies and TV shows in HD quality. No signup required.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#141414] text-white antialiased`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
