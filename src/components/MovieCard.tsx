
import React from 'react';
import { EnhancedMovieCard } from './EnhancedMovieCard';
import { Movie } from '@/services/tmdb';

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return <EnhancedMovieCard movie={movie} />;
};
