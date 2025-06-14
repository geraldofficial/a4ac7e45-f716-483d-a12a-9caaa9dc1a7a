
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbApi } from '@/services/tmdb';
import { Play, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const NetflixMobileHero = () => {
  const [featuredMovie, setFeaturedMovie] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: movies, isLoading } = useQuery({
    queryKey: ['trending-movies-mobile'],
    queryFn: () => tmdbApi.getTrending('movie', 'day'),
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (movies && movies.length > 0) {
      // Pick a random featured movie from the first 5
      const randomIndex = Math.floor(Math.random() * Math.min(5, movies.length));
      setFeaturedMovie(movies[randomIndex]);
    }
  }, [movies]);

  const handlePlay = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (featuredMovie) {
      navigate(`/movie/${featuredMovie.id}`);
    }
  };

  const handleMoreInfo = () => {
    if (featuredMovie) {
      navigate(`/movie/${featuredMovie.id}`);
    }
  };

  if (isLoading || !featuredMovie) {
    return (
      <div className="netflix-mobile-hero bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div 
      className="netflix-mobile-hero"
      style={{
        backgroundImage: `url(https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      
      <div className="netflix-mobile-hero-content">
        <h1 className="netflix-mobile-hero-title">
          {featuredMovie.title || featuredMovie.name}
        </h1>
        
        <div className="netflix-mobile-hero-meta">
          <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
            #{Math.floor(Math.random() * 10) + 1} in Movies Today
          </span>
          {featuredMovie.vote_average > 0 && (
            <span className="text-green-400 font-semibold">
              {Math.round(featuredMovie.vote_average * 10)}% Match
            </span>
          )}
          {featuredMovie.release_date && (
            <span>{new Date(featuredMovie.release_date).getFullYear()}</span>
          )}
        </div>

        <div className="netflix-mobile-hero-buttons">
          <button 
            className="netflix-mobile-play-btn"
            onClick={handlePlay}
          >
            <Play className="h-6 w-6 fill-current" />
            Play
          </button>
          
          <button 
            className="netflix-mobile-info-btn"
            onClick={handleMoreInfo}
          >
            <Info className="h-6 w-6" />
            More Info
          </button>
        </div>
      </div>
    </div>
  );
};
