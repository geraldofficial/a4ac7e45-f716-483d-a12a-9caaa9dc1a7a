
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbApi } from '@/services/tmdb';
import { Play, Plus, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { user, addToWatchlist, isInWatchlist } = useAuth();

  const { data: movies, isLoading } = useQuery({
    queryKey: ['trending-movies'],
    queryFn: () => tmdbApi.getTrending('movie', 'day'),
    staleTime: 10 * 60 * 1000,
  });

  const featuredMovies = movies?.slice(0, 5) || [];

  useEffect(() => {
    if (featuredMovies.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [featuredMovies.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  };

  const handleWatchMovie = (movieId: number) => {
    navigate(`/movie/${movieId}`);
  };

  const handleAddToWatchlist = async (movieId: number) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    await addToWatchlist(movieId);
  };

  if (isLoading || featuredMovies.length === 0) {
    return (
      <div className="relative h-[70vh] bg-gradient-to-r from-purple-900 to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const currentMovie = featuredMovies[currentSlide];

  return (
    <div className="relative h-[70vh] md:h-[80vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={`https://image.tmdb.org/t/p/original${currentMovie.backdrop_path}`}
          alt={currentMovie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all"
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all"
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              {currentMovie.title}
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed line-clamp-3">
              {currentMovie.overview}
            </p>
            
            <div className="flex items-center space-x-4 text-white/80">
              <span className="bg-yellow-500 text-black px-2 py-1 rounded text-sm font-semibold">
                ★ {currentMovie.vote_average?.toFixed(1)}
              </span>
              <span>{new Date(currentMovie.release_date).getFullYear()}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => handleWatchMovie(currentMovie.id)}
                className="bg-white text-black hover:bg-white/90 px-8 py-3 text-lg font-semibold"
              >
                <Play className="mr-2 h-5 w-5 fill-current" />
                Watch Now
              </Button>
              
              <Button
                onClick={() => handleAddToWatchlist(currentMovie.id)}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                {user && isInWatchlist(currentMovie.id) ? 'In Watchlist' : 'Add to Watchlist'}
              </Button>
              
              <Button
                onClick={() => navigate(`/movie/${currentMovie.id}`)}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg"
              >
                <Info className="mr-2 h-5 w-5" />
                More Info
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {featuredMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
