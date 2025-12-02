import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Plus, Check, Star, Info, Heart, Share2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Movie } from "@/services/tmdb";
import { cn } from "@/lib/utils";

interface ImprovedMovieCardProps {
  movie: Movie;
  priority?: boolean;
  showGenres?: boolean;
  variant?: "default" | "compact" | "featured";
  type?: "movie" | "tv";
}

export const ImprovedMovieCard: React.FC<ImprovedMovieCardProps> = ({
  movie,
  priority = false,
  showGenres = false,
  variant = "default",
  type: propType,
}) => {
  const { user, addToWatchlist, removeFromWatchlist, isInWatchlist } =
    useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const title = movie.title || movie.name || "Unknown Title";
  const releaseDate = movie.release_date || movie.first_air_date || "";
  const type = propType || movie.media_type || (movie.title ? "movie" : "tv");
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "";

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/${variant === "featured" ? "w780" : "w500"}${movie.poster_path}`
    : null;

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : null;

  const fallbackUrl =
    "https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=400&h=600&fit=crop";

  const handleWatch = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to watch content.",
        variant: "destructive",
      });
      return;
    }
    navigate(`/${type}/${movie.id}`);
  };

  const handleMoreInfo = () => {
    navigate(`/${type}/${movie.id}`);
  };

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your watchlist.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isInWatchlist(movie.id)) {
        await removeFromWatchlist(movie.id);
        toast({
          title: "Removed from watchlist",
          description: `${title} has been removed from your watchlist.`,
        });
      } else {
        await addToWatchlist(movie.id);
        toast({
          title: "Added to watchlist",
          description: `${title} has been added to your watchlist.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update watchlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/${type}/${movie.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out ${title} on FlickPick!`,
          url: url,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Movie link has been copied to your clipboard.",
      });
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-green-400 bg-green-400/20";
    if (rating >= 7) return "text-yellow-400 bg-yellow-400/20";
    if (rating >= 6) return "text-orange-400 bg-orange-400/20";
    return "text-red-400 bg-red-400/20";
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "compact":
        return "w-full max-w-[140px]";
      case "featured":
        return "w-full max-w-lg";
      default:
        return "w-full max-w-sm";
    }
  };

  const getAspectRatio = () => {
    return variant === "featured" ? "aspect-[16/9]" : "aspect-[2/3]";
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative overflow-hidden rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 transition-all duration-500 cursor-pointer mx-auto",
        "hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30",
        "hover:z-10 hover:bg-card/90",
        getVariantClasses(),
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleMoreInfo}
    >
      <div
        className={cn("overflow-hidden relative bg-muted/20", getAspectRatio())}
      >
        {/* Loading state */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-muted/30 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Main image */}
        {posterUrl && !imageError && (
          <img
            src={posterUrl}
            alt={title}
            className={cn(
              "h-full w-full object-cover transition-all duration-700",
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
              isHovered && "scale-110",
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading={priority ? "eager" : "lazy"}
          />
        )}

        {/* Fallback image */}
        {(imageError || !posterUrl) && (
          <img
            src={fallbackUrl}
            alt={title}
            className="h-full w-full object-cover"
            onLoad={() => setImageLoaded(true)}
          />
        )}
      </div>
    </div>
  );
};
