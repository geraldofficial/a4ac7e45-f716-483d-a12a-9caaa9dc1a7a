
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { tmdbApi } from '@/services/tmdb';
import { Button } from '@/components/ui/button';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const { data: movies, isLoading } = useQuery({
    queryKey: ['hero-movies'],
    queryFn: () => tmdbApi.getTrendingMovies('day'),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const heroMovies = movies?.slice(0, 5) || [];

  // Auto-advance slides
  useEffect(() => {
    if (heroMovies.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroMovies.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroMovies.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroMovies.length) % heroMovies.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (isLoading) {
    return (
      <div className="h-[70vh] bg-gradient-to-r from-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading featured content...</div>
      </div>
    );
  }

  if (heroMovies.length === 0) {
    return (
      <div className="h-[70vh] bg-gradient-to-r from-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Welcome to FlickPick</h2>
          <p className="text-xl">Discover amazing movies and TV shows</p>
        </div>
      </div>
    );
  }

  const currentMovie = heroMovies[currentSlide];
  const backdropUrl = currentMovie?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${currentMovie.backdrop_path}`
    : null;

  return (
    <ErrorBoundary>
      <div className="relative h-[70vh] overflow-hidden">
        {/* Background Image */}
        {backdropUrl ? (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backdropUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-blue-900" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {currentMovie?.title || currentMovie?.name}
              </h1>
              
              {currentMovie?.overview && (
                <p className="text-gray-200 text-lg md:text-xl mb-8 line-clamp-3">
                  {currentMovie.overview}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-200 font-semibold"
                  onClick={() => {
                    const mediaType = currentMovie?.title ? 'movie' : 'tv';
                    navigate(`/${mediaType}/${currentMovie?.id}`);
                  }}
                >
                  <Play className="mr-2 h-5 w-5 fill-current" />
                  Watch Now
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-300 text-white hover:bg-white/10"
                  onClick={() => {
                    const mediaType = currentMovie?.title ? 'movie' : 'tv';
                    navigate(`/${mediaType}/${currentMovie?.id}`);
                  }}
                >
                  <Info className="mr-2 h-5 w-5" />
                  More Info
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
          {heroMovies.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
};
