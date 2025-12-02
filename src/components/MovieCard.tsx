import React from 'react';
import { ImprovedMovieCard } from './ImprovedMovieCard';
import { Movie } from '@/services/tmdb';

interface MovieCardProps {
  movie: Movie;
  priority?: boolean;
  showGenres?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  type?: 'movie' | 'tv';
}

export const MovieCard: React.FC<MovieCardProps> = ({ 
  movie, 
  priority = false,
  showGenres = false,
  variant = 'default',
  type = 'movie'
}) => {
  return (
    <ImprovedMovieCard 
      movie={movie} 
      priority={priority}
      showGenres={showGenres}
      variant={variant}
      type={type}
    />
  );
};
