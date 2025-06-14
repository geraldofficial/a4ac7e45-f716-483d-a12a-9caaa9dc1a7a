
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '@/services/tmdb';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Check, Star, Play } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  showPlayButton?: boolean;
  priority?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ 
  movie, 
  showPlayButton = false,
  priority = false 
}) => {
  const navigate = useNavigate();
  const { user, addToWatchlist, removeFromWatchlist, isInWatchlist } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const title = movie.title || movie.name || 'Unknown Title';
  const releaseDate = movie.release_date || movie.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv');
  const inWatchlist = user ? isInWatchlist(movie.id) : false;

  const imageUrl = movie.poster_path && !imageError
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const handleClick = () => {
    navigate(`/${mediaType}/${movie.id}`);
  };

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    setIsLoading(true);
    try {
      if (inWatchlist) {
        await removeFromWatchlist(movie.id);
      } else {
        await addToWatchlist(movie.id);
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="group cursor-pointer transition-all duration-300 hover:scale-105" onClick={handleClick}>
      <div className="relative overflow-hidden rounded-lg bg-card border border-border">
        <div className="aspect-[2/3] relative bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading={priority ? 'eager' : 'lazy'}
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Play className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground line-clamp-2">{title}</p>
                {year && <p className="text-xs text-muted-foreground mt-1">{year}</p>}
              </div>
            </div>
          )}
          
          {/* Overlay - only show if we have an image */}
          {imageUrl && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
          
          {/* Rating - only show if we have an image and rating */}
          {imageUrl && movie.vote_average > 0 && (
            <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-white text-xs font-medium">
                {movie.vote_average.toFixed(1)}
              </span>
            </div>
          )}
          
          {/* Watchlist Button */}
          {user && (
            <button
              onClick={handleWatchlistToggle}
              disabled={isLoading}
              className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded-full p-2 
                       hover:bg-black/90 transition-colors duration-200 disabled:opacity-50
                       opacity-0 group-hover:opacity-100"
              aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {isLoading ? (
                <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
              ) : inWatchlist ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Plus className="w-4 h-4 text-white" />
              )}
            </button>
          )}

          {/* Play Button */}
          {showPlayButton && imageUrl && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-primary rounded-full p-3 shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                <Play className="w-6 h-6 text-primary-foreground fill-current" />
              </div>
            </div>
          )}
        </div>
        
        {/* Content - only show if we have an image */}
        {imageUrl && (
          <div className="p-3">
            <h3 className="text-foreground font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
            {year && (
              <p className="text-muted-foreground text-xs mt-1">{year}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
