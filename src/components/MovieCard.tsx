
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Plus, Check, Star, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Movie } from '@/services/tmdb';

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const { user, addToWatchlist, removeFromWatchlist, isInWatchlist } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle optional title/name from TMDB API
  const title = movie.title || movie.name || 'Unknown Title';
  const releaseDate = movie.release_date || movie.first_air_date || '';
  
  // Determine type from media_type or fallback to title/name check
  const type = movie.media_type || (movie.title ? 'movie' : 'tv');

  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=400&h=600&fit=crop';

  const handleWatch = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to watch content.",
        variant: "destructive",
      });
      return;
    }
    console.log('Navigating to:', `/${type}/${movie.id}`);
    navigate(`/${type}/${movie.id}`);
  };

  const handleMoreInfo = () => {
    console.log('Navigating to:', `/${type}/${movie.id}`);
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
  };

  return (
    <div className="group relative overflow-hidden rounded-lg bg-card transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer w-full max-w-sm mx-auto">
      <div className="aspect-[2/3] overflow-hidden relative">
        <img
          src={posterUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=400&h=600&fit=crop';
          }}
        />
        
        {/* Mobile-First Always Visible Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
          <div className="absolute bottom-1 left-1 right-1 md:bottom-2 md:left-2 md:right-2">
            <div className="flex items-center gap-1 mb-1 md:mb-2">
              <div className="flex items-center gap-0.5">
                <Star className="h-2.5 w-2.5 md:h-3 md:w-3 text-yellow-400 fill-current" />
                <span className="text-white text-xs md:text-sm font-medium">{movie.vote_average.toFixed(1)}</span>
              </div>
              {releaseDate && (
                <span className="text-gray-200 text-xs">
                  {new Date(releaseDate).getFullYear()}
                </span>
              )}
            </div>
            
            <div className="flex gap-1">
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 hover:scale-105 shadow-lg px-1.5 py-1 text-xs h-6 md:h-7 md:px-2 md:py-1.5 md:text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleWatch();
                }}
              >
                <Play className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5" />
                <span className="hidden sm:inline">Play</span>
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                className="border-white/50 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white transition-all duration-200 hover:scale-105 shadow-lg px-1.5 py-1 text-xs h-6 md:h-7 md:px-2 md:py-1.5"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoreInfo();
                }}
              >
                <Info className="h-2.5 w-2.5 md:h-3 md:w-3" />
              </Button>
              
              {user && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-white/50 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white transition-all duration-200 hover:scale-105 shadow-lg px-1.5 py-1 text-xs h-6 md:h-7 md:px-2 md:py-1.5"
                  onClick={handleWatchlistToggle}
                >
                  {isInWatchlist(movie.id) ? <Check className="h-2.5 w-2.5 md:h-3 md:w-3" /> : <Plus className="h-2.5 w-2.5 md:h-3 md:w-3" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-1.5 md:p-3 bg-card">
        <h3 className="text-foreground font-semibold truncate mb-0.5 text-xs md:text-sm">{title}</h3>
        {releaseDate && (
          <p className="text-muted-foreground text-xs">
            {new Date(releaseDate).getFullYear()}
          </p>
        )}
      </div>
    </div>
  );
};
