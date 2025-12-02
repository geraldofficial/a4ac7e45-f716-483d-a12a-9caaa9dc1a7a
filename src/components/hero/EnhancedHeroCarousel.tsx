import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Plus,
  Info,
  Star,
  Clock,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { tmdbApi, Movie } from "@/services/tmdb";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface HeroCarouselProps {
  profile?: {
    id: string;
    name: string;
    is_child: boolean;
    age_restriction: number;
    genre_preferences: string[];
  };
}

interface HeroMovie extends Movie {
  genre_names?: string[];
  runtime?: number;
  tagline?: string;
}

export const EnhancedHeroCarousel: React.FC<HeroCarouselProps> = ({
  profile,
}) => {
  const [movies, setMovies] = useState<HeroMovie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState<boolean[]>([]);

  const navigate = useNavigate();
  const { user, addToWatchlist, isInWatchlist } = useAuth();
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchHeroMovies();
  }, [profile]);

  useEffect(() => {
    if (movies.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % movies.length);
      }, 6000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [movies.length]);

  const fetchHeroMovies = async () => {
    try {
      setLoading(true);

      // Get trending movies first
      const trendingResponse = await tmdbApi.getTrendingMovies();
      let heroMovies = trendingResponse.results.slice(0, 8);

      // Filter based on profile if available
      if (profile) {
        heroMovies = filterMoviesForProfile(heroMovies);
      }

      // Get detailed info for each movie
      const detailedMovies = await Promise.all(
        heroMovies.map(async (movie) => {
          try {
            const details = await tmdbApi.getMovieDetails(movie.id);
            const genres = details.genres?.map((g) => g.name) || [];

            return {
              ...movie,
              genre_names: genres,
              runtime: details.runtime,
              tagline: details.tagline,
              overview: details.overview || movie.overview,
            };
          } catch (error) {
            return movie;
          }
        }),
      );

      setMovies(detailedMovies);
      setImageLoaded(new Array(detailedMovies.length).fill(false));
    } catch (error) {
      console.error("Error fetching hero movies:", error);
      // Fallback to mock data
      setMovies([
        {
          id: 1,
          title: "Featured Movie",
          overview:
            "Discover amazing movies and TV shows on FlickPick. Your ultimate entertainment destination.",
          backdrop_path: "",
          poster_path: "",
          vote_average: 8.5,
          release_date: new Date().getFullYear().toString(),
          genre_ids: [28, 12],
          genre_names: ["Action", "Adventure"],
          runtime: 150,
          tagline: "Your Next Great Adventure Awaits",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterMoviesForProfile = (movies: Movie[]): Movie[] => {
    if (!profile) return movies;

    return movies.filter((movie) => {
      // Age restriction filtering
      if (profile.is_child && movie.adult) return false;

      // Content rating based filtering
      const movieYear = movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : 2020;
      if (profile.age_restriction <= 13 && movieYear < 2010) return false;

      // Rating filtering for child profiles
      if (profile.is_child && movie.vote_average < 6.0) return false;

      return true;
    });
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  const handleWatch = (movie: HeroMovie) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to watch content.",
        variant: "destructive",
      });
      return;
    }

    const type = movie.title ? "movie" : "tv";
    navigate(`/${type}/${movie.id}`);
  };

  const handleMoreInfo = (movie: HeroMovie) => {
    const type = movie.title ? "movie" : "tv";
    navigate(`/${type}/${movie.id}`);
  };

  const handleAddToWatchlist = async (movie: HeroMovie) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add to watchlist.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addToWatchlist(movie.id);
      toast({
        title: "Added to watchlist",
        description: `${movie.title} has been added to your watchlist.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to watchlist",
        variant: "destructive",
      });
    }
  };

  const handleImageLoad = (index: number) => {
    setImageLoaded((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  const getBackdropUrl = (path: string) => {
    return path ? `https://image.tmdb.org/t/p/original${path}` : "/logo.svg";
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="relative w-full h-screen bg-gray-950">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <img
              src="https://cdn.builder.io/api/v1/assets/3a5e046f24294e60a3c1afd0f4c614eb/chatgpt-image-jun-21-2025-03_27_04-pm-65410f?format=webp&width=800"
              alt="FlickPick"
              className="h-16 w-auto mx-auto mb-2"
            />
            <div className="animate-spin-slow rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="relative w-full h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <img
            src="https://cdn.builder.io/api/v1/assets/3a5e046f24294e60a3c1afd0f4c614eb/chatgpt-image-jun-21-2025-03_27_04-pm-65410f?format=webp&width=800"
            alt="FlickPick"
            className="h-20 w-auto mx-auto mb-6"
          />
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome to FlickPick
          </h2>
          <p className="text-gray-400">
            Your ultimate entertainment destination
          </p>
        </div>
      </div>
    );
  }

  const currentMovie = movies[currentIndex];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-950">
      {/* Background Images */}
      {movies.map((movie, index) => (
        <div
          key={movie.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${getBackdropUrl(movie.backdrop_path)})`,
            }}
          >
            {/* Image preload */}
            <img
              src={getBackdropUrl(movie.backdrop_path)}
              alt=""
              className="hidden"
              onLoad={() => handleImageLoad(index)}
            />
          </div>

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
        </div>
      ))}

      {/* FlickPick Logo */}
      <div className="absolute top-6 left-6 z-20">
        <img
          src="https://cdn.builder.io/api/v1/assets/3a5e046f24294e60a3c1afd0f4c614eb/chatgpt-image-jun-21-2025-03_27_04-pm-65410f?format=webp&width=800"
          alt="FlickPick"
          className="h-12 w-auto"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center h-full">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-3xl">
            {/* Genre Tags */}
            {currentMovie.genre_names && (
              <div className="flex flex-wrap gap-2 mb-4">
                {currentMovie.genre_names.slice(0, 3).map((genre) => (
                  <Badge
                    key={genre}
                    variant="outline"
                    className="border-red-600/50 text-red-400 bg-red-600/10"
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-white leading-tight">
              {currentMovie.title || currentMovie.name}
            </h1>

            {/* Tagline */}
            {currentMovie.tagline && (
              <p className="text-xl md:text-2xl text-red-400 mb-4 font-medium">
                {currentMovie.tagline}
              </p>
            )}

            {/* Movie Info */}
            <div className="flex items-center space-x-6 mb-6 text-gray-300">
              {currentMovie.vote_average && (
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">
                    {currentMovie.vote_average.toFixed(1)}
                  </span>
                </div>
              )}

              {currentMovie.release_date && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-5 w-5" />
                  <span>
                    {new Date(currentMovie.release_date).getFullYear()}
                  </span>
                </div>
              )}

              {currentMovie.runtime && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-5 w-5" />
                  <span>{formatRuntime(currentMovie.runtime)}</span>
                </div>
              )}
            </div>

            {/* Overview */}
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl">
              {currentMovie.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white shadow-xl hover:shadow-red-500/25 transition-all transform hover:scale-105"
                onClick={() => handleWatch(currentMovie)}
              >
                <Play className="h-5 w-5 mr-2 fill-current" />
                {user ? "Watch Now" : "Sign In to Watch"}
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800 hover:border-gray-500 transition-all"
                onClick={() => handleMoreInfo(currentMovie)}
              >
                <Info className="h-5 w-5 mr-2" />
                More Info
              </Button>

              {user && (
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-800 hover:border-gray-500 transition-all"
                  onClick={() => handleAddToWatchlist(currentMovie)}
                  disabled={isInWatchlist(currentMovie.id)}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {isInWatchlist(currentMovie.id)
                    ? "In Watchlist"
                    : "Add to List"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Profile Indicator */}
      {profile && (
        <div className="absolute top-6 right-6 z-20">
          <Badge
            variant="outline"
            className="border-blue-600/50 text-blue-400 bg-blue-600/10"
          >
            {profile.name}'s Profile
          </Badge>
        </div>
      )}
    </div>
  );
};
