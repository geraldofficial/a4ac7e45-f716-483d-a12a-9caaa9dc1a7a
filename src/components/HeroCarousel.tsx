
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbApi } from '@/services/tmdb';
import { Play, Plus, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ErrorBoundary } from './ErrorBoundary';

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { user, addToWatchlist, isInWatchlist } = useAuth();

  const { data: movies, isLoading, error } = useQuery({
    queryKey: ['trending-movies'],
    queryFn: () => tmdbApi.getTrending('movie', 'day'),
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });

  const featuredMovies = movies?.slice(0, 5) || [];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Disable auto-play on mobile to prevent scroll interference
    if (featuredMovies.length === 0 || !isAutoPlaying || isMobile) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [featuredMovies.length, isAutoPlaying, isMobile]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const handleImageClick = (movieId: number) => {
    try {
      navigate(`/movie/${movieId}`);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleWatchMovie = (movieId: number) => {
    try {
      navigate(`/movie/${movieId}`);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleAddToWatchlist = async (movieId: number) => {
    if (!user) {
      try {
        navigate('/auth');
      } catch (error) {
        console.error('Navigation error:', error);
      }
      return;
    }
    try {
      await addToWatchlist(movieId);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  if (error) {
    return (
      <div className="relative h-[50vh] md:h-[70vh] bg-gradient-to-r from-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">Failed to load featured content</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || featuredMovies.length === 0) {
    return (
      <div className="relative h-[50vh] md:h-[70vh] bg-gradient-to-r from-purple-900 to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const currentMovie = featuredMovies[currentSlide];

  if (!currentMovie) {
    return (
      <div className="relative h-[50vh] md:h-[70vh] bg-gradient-to-r from-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl">No featured content available</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="relative h-[50vh] md:h-[70vh] lg:h-[80vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={`https://image.tmdb.org/t/p/original${currentMovie.backdrop_path}`}
            alt={currentMovie.title}
            className="w-full h-full object-cover cursor-pointer"
            loading="eager"
            onClick={() => handleImageClick(currentMovie.id)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1489599904276-39c2bb2d64?w=1920&h=1080&fit=crop';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        </div>

        {/* Navigation Arrows - Desktop Only */}
        {!isMobile && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-all touch-target"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-all touch-target"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
          </>
        )}

        {/* Desktop Content */}
        <div className="hidden md:block relative z-10 h-full">
          <div className="h-full flex items-center">
            <div className="container mx-auto px-4 md:px-8">
              <div className="max-w-2xl space-y-4 md:space-y-6">
                <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white leading-tight">
                  {currentMovie.title}
                </h1>
                <p className="text-sm md:text-lg lg:text-xl text-white/90 leading-relaxed line-clamp-2 md:line-clamp-3">
                  {currentMovie.overview}
                </p>
                
                <div className="flex items-center space-x-3 md:space-x-4 text-white/80">
                  <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs md:text-sm font-semibold">
                    ★ {currentMovie.vote_average?.toFixed(1)}
                  </span>
                  <span className="text-xs md:text-base">{new Date(currentMovie.release_date).getFullYear()}</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <Button
                    onClick={() => handleWatchMovie(currentMovie.id)}
                    className="touch-button bg-white text-black hover:bg-white/90 font-semibold"
                  >
                    <Play className="mr-2 h-4 w-4 md:h-5 md:w-5 fill-current" />
                    <span className="whitespace-nowrap">Play</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleAddToWatchlist(currentMovie.id)}
                    variant="outline"
                    className="touch-button border-white/30 text-white hover:bg-white/10"
                  >
                    <Plus className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    <span className="whitespace-nowrap">
                      {user && isInWatchlist(currentMovie.id) ? 'In List' : 'Watchlist'}
                    </span>
                  </Button>
                  
                  <Button
                    onClick={() => navigate(`/movie/${currentMovie.id}`)}
                    variant="outline"
                    className="touch-button border-white/30 text-white hover:bg-white/10"
                  >
                    <Info className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    <span className="whitespace-nowrap">More Info</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Content Overlay - Enhanced */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 z-10 p-4">
          <div className="mobile-card bg-black/60 backdrop-blur-md p-4 space-y-3">
            <div className="space-y-2">
              <h2 className="text-white font-bold text-lg leading-tight line-clamp-2">{currentMovie.title}</h2>
              <div className="flex items-center gap-3 text-white/80 text-sm">
                <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-semibold">
                  ★ {currentMovie.vote_average?.toFixed(1)}
                </span>
                <span>{new Date(currentMovie.release_date).getFullYear()}</span>
              </div>
            </div>
            
            {/* Mobile action buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => handleWatchMovie(currentMovie.id)}
                className="touch-button-small bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex-1"
              >
                <Play className="mr-2 h-4 w-4 fill-current" />
                Play
              </Button>
              
              <Button
                onClick={() => navigate(`/movie/${currentMovie.id}`)}
                variant="outline"
                className="touch-button-small border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Slide Indicators - Mobile optimized */}
        <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {featuredMovies.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSlide(index);
                setIsAutoPlaying(false);
                setTimeout(() => setIsAutoPlaying(true), 10000);
              }}
              className={`touch-button-small w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white scale-125' : 'bg-white/40'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
};
