
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '@/services/tmdb';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Check } from 'lucide-react';

interface NetflixMobileCardProps {
  movie: Movie;
  size?: 'small' | 'large';
  priority?: boolean;
}

export const NetflixMobileCard: React.FC<NetflixMobileCardProps> = ({ 
  movie, 
  size = 'small',
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
    ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
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

  const cardClass = size === 'large' 
    ? 'netflix-mobile-card-large' 
    : 'netflix-mobile-card-small';

  return (
    <div className={cardClass} onClick={handleClick}>
      <div className="relative">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover rounded"
          loading={priority ? 'eager' : 'lazy'}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-poster.jpg';
          }}
        />
        
        {user && (
          <button
            onClick={handleWatchlistToggle}
            disabled={isLoading}
            className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full p-1.5 
                     hover:bg-black/80 transition-colors duration-200 disabled:opacity-50"
            aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            {isLoading ? (
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            ) : inWatchlist ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Plus className="w-3 h-3 text-white" />
            )}
          </button>
        )}
      </div>
      
      {size === 'large' && (
        <div className="p-2">
          <h3 className="text-white text-sm font-medium truncate">{title}</h3>
          {year && (
            <p className="text-gray-400 text-xs">{year}</p>
          )}
        </div>
      )}
    </div>
  );
};
