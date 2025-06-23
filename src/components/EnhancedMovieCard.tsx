import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Plus, Check, Star, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Movie } from "@/services/tmdb";

interface EnhancedMovieCardProps {
  movie: Movie;
}

export const EnhancedMovieCard: React.FC<EnhancedMovieCardProps> = ({
  movie,
}) => {
  const { user, addToWatchlist, removeFromWatchlist, isInWatchlist } =
    useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Memoize computed values to prevent unnecessary re-calculations
  const { title, releaseDate, type, year, posterUrl, isInUserWatchlist } =
    useMemo(() => {
      const movieTitle = movie.title || movie.name || "Unknown Title";
      const movieReleaseDate = movie.release_date || movie.first_air_date || "";
      const movieType = movie.media_type || (movie.title ? "movie" : "tv");
      const movieYear = movieReleaseDate
        ? new Date(movieReleaseDate).getFullYear()
        : "";

      const moviePosterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=400&h=600&fit=crop";

      const inWatchlist = user ? isInWatchlist(movie.id) : false;

      return {
        title: movieTitle,
        releaseDate: movieReleaseDate,
        type: movieType,
        year: movieYear,
        posterUrl: moviePosterUrl,
        isInUserWatchlist: inWatchlist,
      };
    }, [movie, user, isInWatchlist]);

  const handleWatch = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to watch content.",
          variant: "destructive",
        });
        return;
      }
      navigate(`/${type}/${movie.id}`);
    },
    [user, toast, navigate, type, movie.id],
  );

  const handleMoreInfo = useCallback(() => {
    navigate(`/${type}/${movie.id}`);
  }, [navigate, type, movie.id]);

  const handleWatchlistToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to manage your watchlist.",
          variant: "destructive",
        });
        return;
      }

      try {
        if (isInUserWatchlist) {
          await removeFromWatchlist(movie.id);
          toast({ title: "Removed from watchlist" });
        } else {
          await addToWatchlist(movie.id);
          toast({ title: "Added to watchlist" });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update watchlist",
          variant: "destructive",
        });
      }
    },
    [
      user,
      toast,
      isInUserWatchlist,
      removeFromWatchlist,
      addToWatchlist,
      movie.id,
    ],
  );

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      e.currentTarget.src =
        "https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=400&h=600&fit=crop";
      setImageLoaded(true);
    },
    [],
  );

  const handleMouseEnter = useCallback(() => {
    setShowActions(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowActions(false);
  }, []);

  return (
    <div
      className="group relative bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 cursor-pointer transition-all duration-200 w-full aspect-[2/3] sm:aspect-[2/3] hover:scale-105"
      onClick={handleMoreInfo}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image Container - Responsive aspect ratio */}
      <div className="relative w-full h-full bg-gray-800">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <img
          src={posterUrl}
          alt={title}
          className={`w-full h-full object-cover transition-all duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      </div>
    </div>
  );
};
