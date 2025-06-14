
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Plus, Check, Star, Info, Share2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Movie } from '@/services/tmdb';
import { cn } from '@/lib/utils';

interface ImprovedMovieCardProps {
  movie: Movie;
  priority?: boolean;
  showGenres?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

export const ImprovedMovieCard: React.FC<ImprovedMovieCardProps> = ({ 
  movie, 
  priority = false,
  showGenres = false,
  variant = 'default'
}) => {
  const { user, addToWatchlist, removeFromWatchlist, isInWatchlist } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const title = movie.title || movie.name || 'Unknown Title';
  const releaseDate = movie.release_date || movie.first_air_date || '';
  const type = movie.media_type || (movie.title ? 'movie' : 'tv');
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';

  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/${variant === 'featured' ? 'w780' : 'w500'}${movie.poster_path}`
    : null;

  const fallbackUrl = 'https://images.unsplash.com/photo-1489599904276-39c2bb2d64?w=400&h=600&fit=crop';

  const handleWatch = (e: React.MouseEvent) => {
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
    if (rating >= 8) return 'text-green-400 bg-green-400/20';
    if (rating >= 7) return 'text-yellow-400 bg-yellow-400/20';
    if (rating >= 6) return 'text-orange-400 bg-orange-400/20';
    return 'text-red-400 bg-red-400/20';
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'mobile-movie-card-compact';
      case 'featured':
        return 'w-full max-w-lg';
      default:
        return 'mobile-movie-card';
    }
  };

  const getAspectRatio = () => {
    return variant === 'featured' ? 'aspect-[16/9]' : 'aspect-[2/3]';
  };

  return (
    <div 
      className={cn(
        "mobile-card cursor-pointer relative overflow-hidden",
        // Only apply hover effects on desktop
        "md:transition-all md:duration-300 md:hover:scale-[1.02] md:hover:shadow-2xl md:hover:border-primary/30",
        getVariantClasses()
      )}
      onClick={handleMoreInfo}
    >
      <div className={cn("overflow-hidden relative bg-muted/20", getAspectRatio())}>
        {/* Loading state */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-muted/30 animate-pulse flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Main image */}
        {posterUrl && !imageError && (
          <img
            src={posterUrl}
            alt={title}
            className={cn(
              "h-full w-full object-cover",
              imageLoaded ? 'opacity-100' : 'opacity-0',
              // Only apply scaling on desktop
              "md:transition-all md:duration-500 md:group-hover:scale-110"
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading={priority ? 'eager' : 'lazy'}
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

        {/* Mobile-optimized overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

        {/* Rating badge - mobile optimized */}
        <div className="absolute top-2 left-2 z-10">
          <Badge className={cn(
            "px-2 py-1 text-xs font-bold border-0 backdrop-blur-sm",
            getRatingColor(movie.vote_average)
          )}>
            <Star className="h-3 w-3 mr-1 fill-current" />
            {movie.vote_average.toFixed(1)}
          </Badge>
        </div>

        {/* Type badge */}
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm border-0 text-xs">
            {type === 'tv' ? 'TV' : 'Movie'}
          </Badge>
        </div>

        {/* Mobile-optimized action buttons */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-3 space-y-3">
          {/* Quick info */}
          <div className="flex items-center justify-between text-white text-xs">
            <span className="font-medium truncate flex-1 mr-2">{title}</span>
            {year && (
              <span className="bg-white/20 px-2 py-1 rounded-full text-xs backdrop-blur-sm">
                {year}
              </span>
            )}
          </div>
          
          {/* Action buttons - mobile optimized */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="touch-button-small bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex-1 active:scale-95"
              onClick={handleWatch}
            >
              <Play className="h-4 w-4 mr-1 fill-current" />
              <span className="text-sm">Play</span>
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              className="touch-button-small border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                handleMoreInfo();
              }}
            >
              <Info className="h-4 w-4" />
            </Button>
            
            {user && (
              <Button 
                size="sm" 
                variant="outline" 
                className="touch-button-small border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 active:scale-95"
                onClick={handleWatchlistToggle}
              >
                {isInWatchlist(movie.id) ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </Button>
            )}

            <Button 
              size="sm" 
              variant="outline"
              className="touch-button-small border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 active:scale-95"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
