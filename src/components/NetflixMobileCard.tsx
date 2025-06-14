
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '@/services/tmdb';
import { Star } from 'lucide-react';

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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const title = movie.title || movie.name || 'Unknown Title';
  const releaseDate = movie.release_date || movie.first_air_date || '';
  const type = movie.media_type || (movie.title ? 'movie' : 'tv');
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';

  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const fallbackUrl = 'https://images.unsplash.com/photo-1489599904276-39c2bb2d64?w=400&h=600&fit=crop';

  const handleClick = () => {
    navigate(`/${type}/${movie.id}`);
  };

  const cardClasses = size === 'large' 
    ? 'netflix-mobile-card netflix-mobile-card-large' 
    : 'netflix-mobile-card';

  return (
    <div 
      className={cardClasses}
      onClick={handleClick}
    >
      <div className="relative">
        {!imageLoaded && !imageError && (
          <div className="netflix-mobile-card-image bg-gray-800 animate-pulse flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {posterUrl && !imageError && (
          <img
            src={posterUrl}
            alt={title}
            className={`netflix-mobile-card-image ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading={priority ? 'eager' : 'lazy'}
          />
        )}

        {(imageError || !posterUrl) && (
          <img
            src={fallbackUrl}
            alt={title}
            className="netflix-mobile-card-image"
            onLoad={() => setImageLoaded(true)}
          />
        )}

        <div className="netflix-mobile-card-overlay">
          <div className="netflix-mobile-card-title">{title}</div>
          <div className="netflix-mobile-card-meta">
            {movie.vote_average > 0 && (
              <>
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span>{movie.vote_average.toFixed(1)}</span>
              </>
            )}
            {year && <span>{year}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
