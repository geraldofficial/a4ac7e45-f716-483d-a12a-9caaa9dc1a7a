
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '@/services/tmdb';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Check, Star } from 'lucide-react';

interface ImprovedMovieCardProps {
  movie: Movie;
  variant?: 'default' | 'compact' | 'detailed';
  priority?: boolean;
}

export const ImprovedMovieCard: React.FC<ImprovedMovieCardProps> = ({ 
  movie, 
  variant = 'default',
  priority = false 
}) => {
  const navigate = useNavigate();
  const { user, addToWatchlist, removeFromWatchlist, isInWatchlist } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const title = movie.title || movie.name || 'Unknown Title';
  const releaseDate = movie.release_date || movie.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv');
  const inWatchlist = user ? isInWatchlist(movie.id) : false;

  const imageUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/placeholder-poster.jpg';

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

  const baseClasses = "group cursor-pointer transition-all duration-300 hover:scale-105";
  const variantClasses = {
    default: "w-48",
    compact: "w-40",
    detailed: "w-56"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`} onClick={handleClick}>
      <div className="relative overflow-hidden rounded-lg bg-gray-800">
        <div className="aspect-[2/3] relative">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading={priority ? 'eager' : 'lazy'}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-poster.jpg';
            }}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Rating */}
          {movie.vote_average > 0 && (
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
        </div>
        
        {/* Content */}
        <div className="p-3">
          <h3 className="text-foreground font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          {variant === 'detailed' && (
            <>
              {year && (
                <p className="text-muted-foreground text-xs mt-1">{year}</p>
              )}
              {movie.overview && (
                <p className="text-muted-foreground text-xs mt-2 line-clamp-3">
                  {movie.overview}
                </p>
              )}
            </>
          )}
          
          {variant !== 'detailed' && year && (
            <p className="text-muted-foreground text-xs mt-1">{year}</p>
          )}
        </div>
      </div>
    </div>
  );
};
