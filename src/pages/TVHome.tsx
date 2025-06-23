import React, { useState, useEffect } from "react";
import { Play, Search, TrendingUp, Film, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TVMovieCard from "@/components/tv/TVMovieCard";
import { useTVNavigation } from "@/hooks/useTVNavigation";
import { useTVGuest } from "@/contexts/TVGuestContext";

// Mock data for demonstration
const mockMovies = [
  {
    id: "1",
    title: "Blockbuster Movie",
    poster:
      "https://images.unsplash.com/photo-1489599843715-1781463066ac?w=300&h=450&fit=crop",
    backdrop:
      "https://images.unsplash.com/photo-1489599843715-1781463066ac?w=500&h=300&fit=crop",
    overview:
      "An exciting action-packed adventure that will keep you on the edge of your seat.",
    releaseDate: "2024-01-15",
    rating: 8.5,
    genre: ["Action", "Adventure", "Thriller"],
  },
  {
    id: "2",
    title: "Comedy Central",
    poster:
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=300&h=450&fit=crop",
    backdrop:
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&h=300&fit=crop",
    overview: "A hilarious comedy that brings laughter to the whole family.",
    releaseDate: "2024-02-20",
    rating: 7.8,
    genre: ["Comedy", "Family"],
  },
  {
    id: "3",
    title: "Sci-Fi Epic",
    poster:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop",
    backdrop:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=300&fit=crop",
    overview:
      "Journey to distant galaxies in this mind-bending science fiction epic.",
    releaseDate: "2024-03-10",
    rating: 9.2,
    genre: ["Sci-Fi", "Drama"],
  },
  {
    id: "4",
    title: "Romantic Drama",
    poster:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=450&fit=crop",
    backdrop:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop",
    overview: "A touching love story that spans decades and continents.",
    releaseDate: "2024-04-05",
    rating: 8.1,
    genre: ["Romance", "Drama"],
  },
  {
    id: "5",
    title: "Thriller Night",
    poster:
      "https://images.unsplash.com/photo-1478720568477-b0ac8a1275e6?w=300&h=450&fit=crop",
    backdrop:
      "https://images.unsplash.com/photo-1478720568477-b0ac8a1275e6?w=500&h=300&fit=crop",
    overview:
      "A psychological thriller that will keep you guessing until the very end.",
    releaseDate: "2024-05-12",
    rating: 8.7,
    genre: ["Thriller", "Mystery"],
  },
  {
    id: "6",
    title: "Animated Adventure",
    poster:
      "https://images.unsplash.com/photo-1489599843715-1781463066ac?w=300&h=450&fit=crop",
    backdrop:
      "https://images.unsplash.com/photo-1489599843715-1781463066ac?w=500&h=300&fit=crop",
    overview: "A colorful animated journey perfect for viewers of all ages.",
    releaseDate: "2024-06-01",
    rating: 8.9,
    genre: ["Animation", "Family", "Adventure"],
  },
];

const TVHome: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredMovie] = useState(mockMovies[0]);
  const { isTVMode } = useTVNavigation();
  const { isGuestMode, addToGuestHistory } = useTVGuest();

  const handlePlayFeatured = () => {
    addToGuestHistory(featuredMovie.id);
    window.open(`/watch/${featuredMovie.id}?guest=true`, "_blank");
  };

  const handleMoviePlay = (movieId: string) => {
    addToGuestHistory(movieId);
    window.open(`/watch/${movieId}?guest=true`, "_blank");
  };

  if (!isTVMode) {
    return null; // Fallback to regular home page
  }

  return (
    <div className="tv-safe-area">
      <main id="main-content" className="min-h-screen bg-gray-950">
        {/* Hero Section */}
        <section
          className="tv-hero"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(220, 38, 38, 0.1)), url(${featuredMovie.backdrop})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="tv-hero-content">
            <h1 className="tv-hero-title">{featuredMovie.title}</h1>
            <p className="tv-hero-description">{featuredMovie.overview}</p>

            <div className="tv-hero-buttons">
              <Button
                size="lg"
                className="tv-button tv-button-primary text-lg px-8 py-4"
                onClick={handlePlayFeatured}
                data-tv-focusable
              >
                <Play size={24} fill="currentColor" />
                <span className="ml-3">Play Now</span>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="tv-button tv-button-secondary text-lg px-8 py-4"
                onClick={() =>
                  (window.location.href = `/detail/${featuredMovie.id}?guest=true`)
                }
                data-tv-focusable
              >
                More Info
              </Button>
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="tv-search">
          <div className="flex items-center space-x-4">
            <Search size={32} className="text-gray-400" />
            <Input
              type="text"
              placeholder="Search movies, TV shows, actors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="tv-input flex-1 text-xl"
              data-search-input
              data-tv-focusable
            />
            <Button
              size="lg"
              className="tv-button tv-button-primary px-6"
              data-tv-focusable
            >
              Search
            </Button>
          </div>
        </section>

        {/* Guest Mode Banner */}
        {isGuestMode && (
          <div className="tv-guest-banner">
            <div className="flex items-center justify-center space-x-4">
              <Tv size={24} />
              <span>
                You're browsing as a guest - no login required! Enjoy unlimited
                streaming.
              </span>
            </div>
          </div>
        )}

        {/* Content Sections */}
        <div className="space-y-12 pb-12">
          {/* Trending Now */}
          <section>
            <div className="px-8 mb-6">
              <div className="flex items-center space-x-3">
                <TrendingUp size={32} className="text-red-500" />
                <h2 className="text-4xl font-bold text-white">Trending Now</h2>
              </div>
              <p className="text-xl text-gray-300 mt-2">
                What everyone's watching today
              </p>
            </div>

            <div className="tv-content-grid">
              {mockMovies.slice(0, 4).map((movie) => (
                <TVMovieCard
                  key={movie.id}
                  {...movie}
                  onPlay={() => handleMoviePlay(movie.id)}
                />
              ))}
            </div>
          </section>

          {/* Popular Movies */}
          <section>
            <div className="px-8 mb-6">
              <div className="flex items-center space-x-3">
                <Film size={32} className="text-red-500" />
                <h2 className="text-4xl font-bold text-white">
                  Popular Movies
                </h2>
              </div>
              <p className="text-xl text-gray-300 mt-2">
                Blockbusters everyone's talking about
              </p>
            </div>

            <div className="tv-content-grid">
              {mockMovies.map((movie) => (
                <TVMovieCard
                  key={movie.id}
                  {...movie}
                  onPlay={() => handleMoviePlay(movie.id)}
                />
              ))}
            </div>
          </section>

          {/* Popular TV Shows */}
          <section>
            <div className="px-8 mb-6">
              <div className="flex items-center space-x-3">
                <Tv size={32} className="text-red-500" />
                <h2 className="text-4xl font-bold text-white">
                  Popular TV Shows
                </h2>
              </div>
              <p className="text-xl text-gray-300 mt-2">
                Binge-worthy series you'll love
              </p>
            </div>

            <div className="tv-content-grid">
              {mockMovies.slice(2).map((movie) => (
                <TVMovieCard
                  key={`tv-${movie.id}`}
                  {...movie}
                  id={`tv-${movie.id}`}
                  isMovie={false}
                  onPlay={() => handleMoviePlay(`tv-${movie.id}`)}
                />
              ))}
            </div>
          </section>
        </div>

        {/* TV Controls Hint */}
        <div className="tv-controls-hint">
          <div className="text-sm">
            <strong>TV Controls:</strong> ↑↓←→ Navigate • Enter Select • Esc
            Back
          </div>
        </div>
      </main>
    </div>
  );
};

export default TVHome;
