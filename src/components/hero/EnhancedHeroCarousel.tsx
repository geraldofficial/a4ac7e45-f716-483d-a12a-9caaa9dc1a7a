import React, { useState, useEffect, useRef } from "react";
import { Play, Plus, Info, Star, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
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
      const trendingResponse = await tmdbApi.getTrendingMovies();
      let heroMovies = trendingResponse.results.slice(0, 8);

      if (profile) {
        heroMovies = filterMoviesForProfile(heroMovies);
      }

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
    } catch (error) {
      console.error("Error fetching hero movies:", error);
      setMovies([
        {
          id: 1,
          title: "Featured Movie",
          overview: "Discover amazing movies and TV shows on FlickPick.",
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
      if (profile.is_child && movie.adult) return false;
      if (profile.is_child && movie.vote_average < 6.0) return false;
      return true;
    });
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
      <div className="relative w-full h-[70vh] md:h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <img
            src="https://cdn.builder.io/api/v1/assets/3a5e046f24294e60a3c1afd0f4c614eb/chatgpt-image-jun-21-2025-03_27_04-pm-65410f?format=webp&width=800"
            alt="FlickPick"
            className="h-10 md:h-14 w-auto mx-auto"
          />
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="relative w-full h-[70vh] md:h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <img
            src="https://cdn.builder.io/api/v1/assets/3a5e046f24294e60a3c1afd0f4c614eb/chatgpt-image-jun-21-2025-03_27_04-pm-65410f?format=webp&width=800"
            alt="FlickPick"
            className="h-14 md:h-20 w-auto mx-auto mb-6"
          />
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            Welcome to FlickPick
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Your ultimate entertainment destination
          </p>
        </div>
      </div>
    );
  }

  const currentMovie = movies[currentIndex];

  return (
    <div className="relative w-full h-[70vh] md:h-screen overflow-hidden bg-background">
      {/* Background Images */}
      {movies.map((movie, index) => (
        <div
          key={movie.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${getBackdropUrl(movie.backdrop_path)})`,
            }}
          />
          {/* Gradient Overlays - adjusted for mobile */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 md:via-background/70 to-background/50 md:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 md:via-transparent to-transparent" />
        </div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 flex items-end md:items-center h-full">
        <div className="container mx-auto px-4 pb-8 md:pb-0 md:py-20">
          <div className="max-w-full md:max-w-2xl lg:max-w-3xl">
            {/* Genre Tags - hidden on small mobile */}
            {currentMovie.genre_names && (
              <div className="hidden sm:flex flex-wrap gap-2 mb-3 md:mb-4">
                {currentMovie.genre_names.slice(0, 3).map((genre) => (
                  <Badge
                    key={genre}
                    variant="outline"
                    className="border-primary/50 text-primary bg-primary/10 text-xs"
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-2 md:mb-3 text-foreground leading-tight line-clamp-2">
              {currentMovie.title || currentMovie.name}
            </h1>

            {/* Tagline - hidden on mobile */}
            {currentMovie.tagline && (
              <p className="hidden md:block text-lg lg:text-xl text-primary mb-3 font-medium line-clamp-1">
                {currentMovie.tagline}
              </p>
            )}

            {/* Movie Info */}
            <div className="flex items-center flex-wrap gap-3 md:gap-4 mb-3 md:mb-4 text-muted-foreground text-sm md:text-base">
              {currentMovie.vote_average && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-medium text-foreground">
                    {currentMovie.vote_average.toFixed(1)}
                  </span>
                </div>
              )}
              {currentMovie.release_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(currentMovie.release_date).getFullYear()}</span>
                </div>
              )}
              {currentMovie.runtime && (
                <div className="hidden sm:flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatRuntime(currentMovie.runtime)}</span>
                </div>
              )}
            </div>

            {/* Overview - truncated on mobile */}
            <p className="text-sm md:text-base lg:text-lg text-muted-foreground mb-4 md:mb-6 leading-relaxed line-clamp-2 md:line-clamp-3 max-w-xl">
              {currentMovie.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 md:gap-3">
              <Button
                size="default"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg h-10 md:h-11 px-4 md:px-6 text-sm md:text-base"
                onClick={() => handleWatch(currentMovie)}
              >
                <Play className="h-4 w-4 md:h-5 md:w-5 mr-2 fill-current" />
                {user ? "Watch" : "Sign In"}
              </Button>

              <Button
                size="default"
                variant="outline"
                className="border-border text-foreground hover:bg-secondary h-10 md:h-11 px-4 md:px-6 text-sm md:text-base"
                onClick={() => handleMoreInfo(currentMovie)}
              >
                <Info className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Info
              </Button>

              {user && (
                <Button
                  size="icon"
                  variant="outline"
                  className="border-border text-foreground hover:bg-secondary h-10 w-10 md:h-11 md:w-11"
                  onClick={() => handleAddToWatchlist(currentMovie)}
                  disabled={isInWatchlist(currentMovie.id)}
                >
                  <Plus className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Indicator */}
      {profile && (
        <div className="absolute top-20 md:top-6 right-4 md:right-6 z-20">
          <Badge
            variant="outline"
            className="border-blue-600/50 text-blue-400 bg-blue-600/10 text-xs"
          >
            {profile.name}
          </Badge>
        </div>
      )}
    </div>
  );
};
