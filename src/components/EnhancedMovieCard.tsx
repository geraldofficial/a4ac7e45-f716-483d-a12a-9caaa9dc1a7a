
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Plus, Check, Star, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Movie } from '@/services/tmdb';

interface EnhancedMovieCardProps {
  movie: Movie;
}

export const EnhancedMovieCard: React.FC<EnhancedMovieCardProps> = ({ movie }) => {
  const { user, addToWatchlist, removeFromWatchlist, isInWatchlist } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const title = movie.title || movie.name || 'Unknown Title';
  const releaseDate = movie.release_date || movie.first_air_date || '';
  const type = movie.media_type || (movie.title ? 'movie' : 'tv');
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';

  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=400&h=600&fit=crop';

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
        description: "Please sign in to manage your watchlist.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isInWatchlist(movie.id)) {
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
  };

  return (
    <div 
      className="group relative bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 cursor-pointer transition-all duration-200 w-full aspect-[3/4] sm:aspect-[2/3]"
      onClick={handleMoreInfo}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Image Container - Responsive aspect ratio */}
      <div className="relative w-full h-full bg-gray-800">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <img 
          src={posterUrl}
          alt={title}
          className={`w-full h-full object-cover transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=400&h=600&fit=crop';
            setImageLoaded(true);
          }}
        />

        {/* Rating Badge */}
        <div className="absolute top-1 left-1 sm:top-2 sm:left-2">
          <Badge className="bg-black/70 text-white border-0 text-xs">
            <Star className="h-2 w-2 sm:h-3 sm:w-3 mr-1 text-yellow-400 fill-current" />
            {movie.vote_average.toFixed(1)}
          </Badge>
        </div>

        {/* Type Badge */}
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
          <Badge className="bg-red-600 text-white border-0 text-xs">
            {type === 'tv' ? 'TV' : 'Movie'}
          </Badge>
        </div>

        {/* Mobile Overlay - Always visible on mobile */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          
          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              onClick={handleWatch}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 sm:w-16 sm:h-16 p-0"
            >
              <Play className="h-4 w-4 sm:h-6 sm:w-6 fill-current" />
            </Button>
          </div>

          {/* Bottom Action Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4">
            <div className="flex gap-1 sm:gap-2 justify-center">
              <Button
                onClick={handleMoreInfo}
                variant="outline"
                size="sm"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 flex-1 text-xs sm:text-sm h-8 sm:h-9"
              >
                <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Info
              </Button>

              {user && (
                <Button
                  onClick={handleWatchlistToggle}
                  variant="outline"
                  size="sm"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 w-8 sm:w-10 h-8 sm:h-9 p-0"
                >
                  {isInWatchlist(movie.id) ? 
                    <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : 
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  }
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
