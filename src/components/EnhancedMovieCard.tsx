
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Plus, Check, Star, Info, Share2, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Movie } from '@/services/tmdb';

interface EnhancedMovieCardProps {
  movie: Movie;
  onShare?: (movie: Movie) => void;
  onWatchParty?: (movie: Movie) => void;
}

export const EnhancedMovieCard: React.FC<EnhancedMovieCardProps> = ({ 
  movie, 
  onShare,
  onWatchParty 
}) => {
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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(movie);
  };

  const handleWatchParty = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to create watch parties.",
        variant: "destructive",
      });
      return;
    }
    onWatchParty?.(movie);
  };

  return (
    <div 
      className="group relative bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 cursor-pointer"
      onClick={handleMoreInfo}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[2/3] bg-gray-800">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <img 
          src={posterUrl}
          alt={title}
          className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=400&h=600&fit=crop';
            setImageLoaded(true);
          }}
        />

        {/* Rating Badge */}
        <div className="absolute top-2 left-2">
          <Badge className="bg-black/70 text-white border-0 text-xs">
            <Star className="h-3 w-3 mr-1 text-yellow-400 fill-current" />
            {movie.vote_average.toFixed(1)}
          </Badge>
        </div>

        {/* Type Badge */}
        <div className="absolute top-2 right-2">
          <Badge className="bg-red-600 text-white border-0 text-xs">
            {type === 'tv' ? 'TV' : 'Movie'}
          </Badge>
        </div>

        {/* Mobile-First Action Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent ${
          showActions ? 'opacity-100' : 'opacity-0 md:opacity-0'
        } md:group-hover:opacity-100`}>
          
          {/* Center Play Button - Always visible on mobile */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              onClick={handleWatch}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white rounded-full w-16 h-16 p-0 shadow-lg"
            >
              <Play className="h-6 w-6 fill-current" />
            </Button>
          </div>

          {/* Bottom Action Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            {/* Title and Year */}
            <div className="mb-3 text-center">
              <h3 className="text-white font-semibold text-sm line-clamp-1 mb-1">
                {title}
              </h3>
              {year && (
                <p className="text-gray-300 text-xs">{year}</p>
              )}
            </div>

            {/* Action Buttons Row */}
            <div className="flex gap-2 justify-center">
              <Button
                onClick={handleMoreInfo}
                variant="outline"
                size="sm"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 flex-1 h-9"
              >
                <Info className="h-4 w-4 mr-1" />
                <span className="text-xs">Info</span>
              </Button>

              {user && (
                <Button
                  onClick={handleWatchlistToggle}
                  variant="outline"
                  size="sm"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 h-9 w-9 p-0"
                >
                  {isInWatchlist(movie.id) ? 
                    <Check className="h-4 w-4" /> : 
                    <Plus className="h-4 w-4" />
                  }
                </Button>
              )}

              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 h-9 w-9 p-0"
              >
                <Share2 className="h-4 w-4" />
              </Button>

              <Button
                onClick={handleWatchParty}
                variant="outline"
                size="sm"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 h-9 w-9 p-0"
              >
                <Users className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer - Hidden on small screens when overlay is active */}
      <div className="p-3 bg-gray-900 md:block">
        <h3 className="text-white font-medium text-sm line-clamp-1 mb-1">
          {title}
        </h3>
        {year && (
          <p className="text-gray-400 text-xs">{year}</p>
        )}
        {movie.overview && (
          <p className="text-gray-500 text-xs line-clamp-2 mt-2 leading-relaxed hidden md:block">
            {movie.overview}
          </p>
        )}
      </div>
    </div>
  );
};
