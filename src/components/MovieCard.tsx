
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
  const type = movie.title ? 'movie' : 'tv';

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
    <div className="group relative overflow-hidden rounded-lg bg-gray-900 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer" onClick={handleMoreInfo}>
      <div className="aspect-[2/3] overflow-hidden">
        <img
          src={posterUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=400&h=600&fit=crop';
          }}
        />
        
        {/* Enhanced Overlay with better visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-white text-sm font-medium">{movie.vote_average.toFixed(1)}</span>
              </div>
              {releaseDate && (
                <span className="text-gray-200 text-sm">
                  {new Date(releaseDate).getFullYear()}
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  handleWatch();
                }}
              >
                <Play className="h-4 w-4 mr-1" />
                Watch
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                className="border-white/50 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white transition-all duration-200 hover:scale-105 shadow-lg"
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
                  className="border-white/50 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white transition-all duration-200 hover:scale-105 shadow-lg"
                  onClick={handleWatchlistToggle}
                >
                  {isInWatchlist(movie.id) ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-gray-900">
        <h3 className="text-white font-semibold truncate mb-1">{title}</h3>
        {releaseDate && (
          <p className="text-gray-400 text-sm">
            {new Date(releaseDate).getFullYear()}
          </p>
        )}
      </div>
    </div>
  );
};
