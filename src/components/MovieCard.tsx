
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
  const [imageLoaded, setImageLoaded] = useState(false);

  // Handle optional title/name from TMDB API
  const title = movie.title || movie.name ||'Unknown Title';
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
        variant: "destructive"
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
        variant: "destructive"
      });
      return;
    }

    if (isInWatchlist(movie.id)) {
      await removeFromWatchlist(movie.id);
      toast({
        title: "Removed from watchlist",
        description: `${title} has been removed from your watchlist.`
      });
    } else {
      await addToWatchlist(movie.id);
      toast({
        title: "Added to watchlist",
        description: `${title} has been added to your watchlist.`
      });
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-lg bg-gray-900 border border-gray-800 cursor-pointer w-full">
      <div className="aspect-[2/3] overflow-hidden relative bg-gray-800">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <img 
          src={posterUrl} 
          alt={title}
          className={`h-full w-full object-cover ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=400&h=600&fit=crop';
            setImageLoaded(true);
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-black/60 rounded px-2 py-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-white text-sm font-medium">{movie.vote_average.toFixed(1)}</span>
                </div>
                {releaseDate && (
                  <div className="bg-black/60 rounded px-2 py-1">
                    <span className="text-gray-200 text-sm font-medium">
                      {new Date(releaseDate).getFullYear()}
                    </span>
                  </div>
                )}
              </div>
              <div className="bg-red-600/80 rounded px-2 py-1">
                <span className="text-white text-xs font-semibold uppercase tracking-wider">
                  {type === 'tv' ? 'TV' : 'Movie'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button 
                size="sm" 
                className="bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-2 text-sm h-10 rounded min-w-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleWatch();
                }}
              >
                <Play className="h-4 w-4 mr-1 flex-shrink-0 fill-current" />
                <span className="truncate">Play</span>
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="border-white/40 bg-black/40 text-white hover:bg-black/60 hover:border-white/60 px-3 py-2 text-sm h-10 rounded min-w-0"
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
                  className="border-white/40 bg-black/40 text-white hover:bg-black/60 hover:border-white/60 px-3 py-2 text-sm h-10 rounded min-w-0"
                  onClick={handleWatchlistToggle}
                >
                  {isInWatchlist(movie.id) ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-gray-900">
        <h3 className="text-white font-semibold truncate mb-1 text-sm leading-tight">
          {title}
        </h3>
        {releaseDate && (
          <p className="text-gray-400 text-xs">
            {new Date(releaseDate).getFullYear()}
          </p>
        )}
      </div>
    </div>
  );
};
