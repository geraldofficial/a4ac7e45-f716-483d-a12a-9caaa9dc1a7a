
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tmdbApi } from '@/services/tmdb';
import { Button } from '@/components/ui/button';
import { Play, Info } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';

export const NetflixMobileHero = () => {
  const navigate = useNavigate();

  const { data: movies, isLoading } = useQuery({
    queryKey: ['mobile-hero-movies'],
    queryFn: () => tmdbApi.getTrendingMovies('day'),
    staleTime: 10 * 60 * 1000,
  });

  const featuredMovie = movies?.[0];

  if (isLoading) {
    return (
      <div className="h-[60vh] bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!featuredMovie) {
    return (
      <div className="h-[60vh] bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h2 className="text-2xl font-bold mb-2">Welcome to FlickPick</h2>
          <p className="text-gray-300">Discover amazing content</p>
        </div>
      </div>
    );
  }

  const backdropUrl = featuredMovie.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${featuredMovie.backdrop_path}`
    : null;

  const posterUrl = featuredMovie.poster_path
    ? `https://image.tmdb.org/t/p/w500${featuredMovie.poster_path}`
    : null;

  return (
    <ErrorBoundary>
      <div className="relative h-[60vh] overflow-hidden">
        {/* Background */}
        {backdropUrl ? (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backdropUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end p-4 pb-8">
          <div className="flex items-end gap-4">
            {/* Poster */}
            {posterUrl && (
              <div className="flex-shrink-0">
                <img
                  src={posterUrl}
                  alt={featuredMovie.title || featuredMovie.name}
                  className="w-24 h-36 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h1 className="text-white text-xl font-bold mb-2 line-clamp-2">
                {featuredMovie.title || featuredMovie.name}
              </h1>
              
              {featuredMovie.overview && (
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {featuredMovie.overview}
                </p>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-white text-black hover:bg-gray-200 font-semibold px-6"
                  onClick={() => {
                    const mediaType = featuredMovie.title ? 'movie' : 'tv';
                    navigate(`/${mediaType}/${featuredMovie.id}`);
                  }}
                >
                  <Play className="mr-1 h-4 w-4 fill-current" />
                  Play
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-300 text-white hover:bg-white/10"
                  onClick={() => {
                    const mediaType = featuredMovie.title ? 'movie' : 'tv';
                    navigate(`/${mediaType}/${featuredMovie.id}`);
                  }}
                >
                  <Info className="mr-1 h-4 w-4" />
                  Info
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};
