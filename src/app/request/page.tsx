"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PaperAirplaneIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

function RequestContent() {
  const searchParams = useSearchParams();
  const prefillTitle = searchParams.get("title") || "";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contentType: "movie",
    title: prefillTitle,
    year: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_key: "108ed3e8-e32f-4b50-be8e-2c59ee895c9a",
          from_name: "Strix Request",
          subject: `Content Request: ${formData.title}`,
          ...formData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError("Failed to submit request. Please try again.");
      }
    } catch {
      setError("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-16 pt-24 text-center">
        <CheckCircleIcon className="w-14 h-14 sm:w-20 sm:h-20 text-green-500 mx-auto mb-4 sm:mb-6" />
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Request Submitted!</h1>
        <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">
          Thank you for your request. We&apos;ll review it and try to add the
          content as soon as possible.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setFormData({
              name: "",
              email: "",
              contentType: "movie",
              title: "",
              year: "",
              message: "",
            });
          }}
          className="btn-primary"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 pt-24">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Request Content</h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Can&apos;t find what you&apos;re looking for? Let us know and we&apos;ll
          try to add it.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-6 bg-[#1a1a1a] p-4 sm:p-6 rounded-xl"
      >
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-3 bg-[#232323] border border-white/10 rounded-lg focus:outline-none focus:border-red-600 transition-colors"
            placeholder="John Doe"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            className="w-full px-4 py-3 bg-[#232323] border border-white/10 rounded-lg focus:outline-none focus:border-red-600 transition-colors"
            placeholder="john@example.com"
          />
        </div>

        {/* Content Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Content Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="contentType"
                value="movie"
                checked={formData.contentType === "movie"}
                onChange={(e) =>
                  setFormData({ ...formData, contentType: e.target.value })
                }
                className="w-4 h-4 accent-red-600"
              />
              <span>Movie</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="contentType"
                value="tv"
                checked={formData.contentType === "tv"}
                onChange={(e) =>
                  setFormData({ ...formData, contentType: e.target.value })
                }
                className="w-4 h-4 accent-red-600"
              />
              <span>TV Show</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="contentType"
                value="anime"
                checked={formData.contentType === "anime"}
                onChange={(e) =>
                  setFormData({ ...formData, contentType: e.target.value })
                }
                className="w-4 h-4 accent-red-600"
              />
              <span>Anime</span>
            </label>
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            className="w-full px-4 py-3 bg-[#232323] border border-white/10 rounded-lg focus:outline-none focus:border-red-600 transition-colors"
            placeholder="Enter the movie or TV show title"
          />
        </div>

        {/* Year */}
        <div>
          <label htmlFor="year" className="block text-sm font-medium mb-2">
            Release Year (optional)
          </label>
          <input
            type="text"
            id="year"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            className="w-full px-4 py-3 bg-[#232323] border border-white/10 rounded-lg focus:outline-none focus:border-red-600 transition-colors"
            placeholder="e.g., 2024"
            maxLength={4}
          />
        </div>

        {/* Additional Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            Additional Details (optional)
          </label>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            rows={4}
            className="w-full px-4 py-3 bg-[#232323] border border-white/10 rounded-lg focus:outline-none focus:border-red-600 transition-colors resize-none"
            placeholder="Any additional information about your request..."
          />
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <PaperAirplaneIcon className="w-5 h-5" />
              Submit Request
            </span>
          )}
        </button>
      </form>

      {/* Info */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>
          Please note: We cannot guarantee that all requests will be fulfilled.
          We&apos;ll do our best to add the content you&apos;re looking for.
        </p>
      </div>
    </div>
  );
}

export default function RequestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RequestContent />
    </Suspense>
  );
}
