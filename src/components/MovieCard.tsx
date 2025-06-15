
import React from 'react';
import { ImprovedMovieCard } from './ImprovedMovieCard';
import { Movie } from '@/services/tmdb';

interface MovieCardProps {
  movie: Movie;
  priority?: boolean;
  showGenres?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

export const MovieCard: React.FC<MovieCardProps> = ({ 
  movie, 
  priority = false,
  showGenres = false,
  variant = 'default'
}) => {
  return (
    <ImprovedMovieCard 
      movie={movie} 
      priority={priority}
      showGenres={showGenres}
      variant={variant}
    />
  );
};
