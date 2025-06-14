
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbApi } from '@/services/tmdb';
import { HeroCarousel } from './HeroCarousel';
import { LoadingSpinner } from './LoadingSpinner';

export const HeroSection: React.FC = () => {
  const { data: movies, isLoading, error } = useQuery({
    queryKey: ['hero-movies'],
    queryFn: () => tmdbApi.getMovies('popular'),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !movies?.length) {
    return null;
  }

  // Take the first 5 movies for the hero section
  const heroMovies = movies.slice(0, 5);

  return (
    <section className="relative">
      <HeroCarousel movies={heroMovies} />
    </section>
  );
};
