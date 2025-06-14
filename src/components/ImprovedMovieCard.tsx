
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Plus, Check, Star, Info, Share2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Movie } from '@/services/tmdb';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
    const logoUrl = `${window.location.origin}/favicon.ico`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} - FlickPick`,
          text: `Check out ${title} on FlickPick! Stream it now for free.`,
          url: url,
        });
        toast({
          title: "Shared successfully!",
          description: `${title} has been shared.`,
        });
      } catch (error) {
        // User cancelled share, copy to clipboard as fallback
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "Movie link has been copied to your clipboard.",
        });
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "Movie link has been copied to your clipboard.",
        });
      } catch (error) {
        toast({
          title: "Sharing failed",
          description: "Unable to share or copy link.",
          variant: "destructive",
        });
      }
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-400 bg-green-400/20';
    if (rating >= 7) return 'text-yellow-400 bg-yellow-400/20';
    if (rating >= 6) return 'text-orange-400 bg-orange-400/20';
    return 'text-red-400 bg-red-400/20';
  };

  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-xl bg-card border border-border/50 cursor-pointer transition-all duration-300 w-full max-w-sm mx-auto",
        // Only apply hover effects on desktop
        !isMobile && "hover:scale-105 hover:shadow-2xl hover:border-primary/50 hover:z-10"
      )}
      onClick={handleMoreInfo}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      <div className="aspect-[2/3] overflow-hidden relative bg-muted/20">
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
              "h-full w-full object-cover transition-all duration-500",
              imageLoaded ? 'opacity-100' : 'opacity-0',
              // Only apply hover scale on desktop
              !isMobile && "group-hover:scale-110"
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

        {/* Desktop overlay with enhanced design - only show on desktop hover */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent transition-opacity duration-300",
          // Only show overlay on desktop hover
          isMobile ? "opacity-0" : "opacity-0 group-hover:opacity-100"
        )}>
          {/* Rating badge */}
          <div className="absolute top-3 left-3">
            <Badge className={cn(
              "px-2 py-1 text-xs font-bold border-0 backdrop-blur-sm",
              getRatingColor(movie.vote_average)
            )}>
              <Star className="h-3 w-3 mr-1 fill-current" />
              {movie.vote_average.toFixed(1)}
            </Badge>
          </div>

          {/* Type badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-primary/20 text-primary-foreground backdrop-blur-sm border-0 text-xs font-semibold">
              {type === 'tv' ? 'TV Series' : 'Movie'}
            </Badge>
          </div>

          {/* Content info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">
                {title}
              </h3>
              <div className="flex items-center gap-2 text-sm">
                {year && (
                  <span className="text-gray-300 bg-white/10 px-2 py-1 rounded-full text-xs">
                    {year}
                  </span>
                )}
                {movie.vote_count > 0 && (
                  <span className="text-gray-300 text-xs">
                    {movie.vote_count.toLocaleString()} votes
                  </span>
                )}
              </div>
              {movie.overview && (
                <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
                  {movie.overview}
                </p>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex-1 h-9"
                onClick={handleWatch}
              >
                <Play className="h-4 w-4 mr-2 fill-current" />
                Watch Now
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 h-9 px-3"
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
                  className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 h-9 px-3"
                  onClick={handleWatchlistToggle}
                >
                  {isInWatchlist(movie.id) ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
              )}

              <Button 
                size="sm" 
                variant="outline"
                className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 h-9 px-3"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom info section - always visible */}
      <div className="p-4 bg-gradient-to-b from-card to-card/90 border-t border-border/20">
        <h3 className={cn(
          "text-foreground font-semibold text-sm leading-tight mb-1 line-clamp-1 transition-colors",
          !isMobile && "group-hover:text-primary"
        )}>
          {title}
        </h3>
        <div className="flex items-center justify-between">
          {year && (
            <span className="text-muted-foreground text-xs">{year}</span>
          )}
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-400 fill-current" />
            <span className="text-muted-foreground text-xs">{movie.vote_average.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
