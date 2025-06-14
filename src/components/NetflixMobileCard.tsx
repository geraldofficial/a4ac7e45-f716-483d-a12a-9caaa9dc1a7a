
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  // Safe navigation hook usage with error boundary
  let navigate: ReturnType<typeof useNavigate>;
  try {
    navigate = useNavigate();
  } catch (error) {
    console.error('Navigation context not available:', error);
    // Fallback navigation function
    navigate = (path: string) => {
      window.location.href = path;
    };
  }

  const title = movie.title || movie.name || 'Unknown Title';
  const releaseDate = movie.release_date || movie.first_air_date || '';
  const type = movie.media_type || (movie.title ? 'movie' : 'tv');
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';

  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const fallbackUrl = 'https://images.unsplash.com/photo-1489599904276-39c2bb2d64?w=400&h=600&fit=crop';

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - touchStart.x);
    const deltaY = Math.abs(touch.clientY - touchStart.y);

    // Only trigger click if it's a tap (minimal movement)
    if (deltaX < 10 && deltaY < 10) {
      try {
        navigate(`/${type}/${movie.id}`);
      } catch (error) {
        console.error('Navigation error:', error);
        window.location.href = `/${type}/${movie.id}`;
      }
    }

    setTouchStart(null);
  };

  const cardClasses = size === 'large' 
    ? 'netflix-mobile-card netflix-mobile-card-large' 
    : 'netflix-mobile-card';

  return (
    <div 
      className={cardClasses}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'manipulation' }}
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
            style={{ pointerEvents: 'none' }}
          />
        )}

        {(imageError || !posterUrl) && (
          <img
            src={fallbackUrl}
            alt={title}
            className="netflix-mobile-card-image"
            onLoad={() => setImageLoaded(true)}
            style={{ pointerEvents: 'none' }}
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
