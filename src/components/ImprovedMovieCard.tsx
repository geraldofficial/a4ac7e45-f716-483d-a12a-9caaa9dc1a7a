
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

  const fallbackUrl = 'https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=400&h=600&fit=crop';

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
        return 'w-[160px] min-w-[160px]';
      case 'featured':
        return 'w-full max-w-lg';
      default:
        return 'w-[180px] min-w-[180px] sm:w-[200px] sm:min-w-[200px]';
    }
  };

  const getAspectRatio = () => {
    return variant === 'featured' ? 'aspect-[16/9]' : 'aspect-[2/3]';
  };

  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 transition-all duration-300 cursor-pointer",
        // Remove hover effects on mobile to prevent scroll blocking
        "md:hover:scale-[1.02] md:hover:shadow-2xl md:hover:border-primary/30 md:hover:z-10 md:hover:bg-card/90",
        getVariantClasses()
      )}
      onClick={handleMoreInfo}
    >
      <div className={cn("overflow-hidden relative bg-muted/20", getAspectRatio())}>
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
              "h-full w-full object-cover transition-all duration-500",
              imageLoaded ? 'opacity-100' : 'opacity-0',
              // Remove scale effect on mobile
              "md:group-hover:scale-110"
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

        {/* Gradient overlay - Always visible on mobile, hover on desktop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rating badge */}
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
          <Badge variant="secondary" className="bg-black/50 text-white backdrop-blur-sm border-0">
            {type === 'tv' ? 'TV' : 'Movie'}
          </Badge>
        </div>

        {/* Action buttons - Always visible on mobile, hover on desktop */}
        <div className="absolute bottom-2 left-2 right-2 z-10 transition-all duration-300 space-y-2 opacity-100 md:opacity-0 md:group-hover:opacity-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              {year && (
                <Badge className="bg-white/20 text-white text-xs backdrop-blur-sm">
                  {year}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 flex-1 h-10 text-sm rounded-lg min-h-[44px]"
              onClick={handleWatch}
            >
              <Play className="h-4 w-4 mr-2 fill-current" />
              <span className="whitespace-nowrap">Play</span>
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/50 transition-all duration-200 h-10 w-10 p-0 rounded-lg min-h-[44px] min-w-[44px]"
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
                className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/50 transition-all duration-200 h-10 w-10 p-0 rounded-lg min-h-[44px] min-w-[44px]"
                onClick={handleWatchlistToggle}
              >
                {isInWatchlist(movie.id) ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </Button>
            )}

            <Button 
              size="sm" 
              variant="outline"
              className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/50 transition-all duration-200 h-10 w-10 p-0 rounded-lg min-h-[44px] min-w-[44px]"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Content area */}
      <div className={cn(
        "p-3 bg-gradient-to-b from-card to-card/80",
        variant === 'compact' && "p-2"
      )}>
        <h3 className={cn(
          "text-foreground font-semibold truncate transition-colors",
          // Remove hover color change on mobile
          "md:group-hover:text-primary",
          variant === 'compact' ? "text-xs mb-1" : "text-sm mb-1"
        )}>
          {title}
        </h3>
        
        {variant !== 'compact' && year && (
          <p className="text-muted-foreground text-xs mb-2">
            {year}
          </p>
        )}

        {variant === 'compact' && year && (
          <p className="text-muted-foreground text-xs">
            {year}
          </p>
        )}
      </div>
    </div>
  );
};
