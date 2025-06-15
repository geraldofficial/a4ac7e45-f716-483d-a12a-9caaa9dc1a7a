
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
    <div className="group relative overflow-hidden rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-primary/30 cursor-pointer w-full">
      <div className="aspect-[2/3] overflow-hidden relative bg-muted/20">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted/30 animate-pulse flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <img 
          src={posterUrl} 
          alt={title}
          className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=400&h=600&fit=crop';
            setImageLoaded(true);
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
          <div className="absolute bottom-2 left-2 right-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-white text-sm font-medium">{movie.vote_average.toFixed(1)}</span>
                </div>
                {releaseDate && (
                  <div className="bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
                    <span className="text-gray-200 text-sm font-medium">
                      {new Date(releaseDate).getFullYear()}
                    </span>
                  </div>
                )}
              </div>
              <div className="bg-primary/20 backdrop-blur-sm rounded-full px-2 py-1">
                <span className="text-primary text-xs font-semibold uppercase tracking-wider">
                  {type === 'tv' ? 'TV' : 'Movie'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-1">
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 hover:scale-105 shadow-lg px-2 py-2 text-sm h-8 rounded-md"
                onClick={(e) => {
                  e.stopPropagation();
                  handleWatch();
                }}
              >
                <Play className="h-3 w-3 mr-1 fill-current" />
                <span>Play</span>
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/50 transition-all duration-200 hover:scale-105 shadow-lg px-2 py-2 text-sm h-8 rounded-md"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoreInfo();
                }}
              >
                <Info className="h-3 w-3" />
              </Button>
              
              {user && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/50 transition-all duration-200 hover:scale-105 shadow-lg px-2 py-2 text-sm h-8 rounded-md"
                  onClick={handleWatchlistToggle}
                >
                  {isInWatchlist(movie.id) ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Plus className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-2 md:p-3 bg-gradient-to-b from-card to-card/80">
        <h3 className="text-foreground font-semibold truncate mb-1 text-sm leading-tight group-hover:text-primary transition-colors">
          {title}
        </h3>
        {releaseDate && (
          <p className="text-muted-foreground text-xs">
            {new Date(releaseDate).getFullYear()}
          </p>
        )}
      </div>
    </div>
  );
};
