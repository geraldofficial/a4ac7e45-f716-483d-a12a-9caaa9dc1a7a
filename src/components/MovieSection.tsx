
import React, { useState, useEffect } from 'react';
import { MovieCard } from './MovieCard';
import { Button } from '@/components/ui/button';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { tmdbApi, Movie } from '@/services/tmdb';

export const MovieSection = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTvShows] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [popularMovies, popularTV, trendingContent] = await Promise.all([
        tmdbApi.getPopularMovies(),
        tmdbApi.getPopularTVShows(),
        tmdbApi.getTrending()
      ]);

      setMovies(popularMovies.slice(0, 8));
      setTvShows(popularTV.slice(0, 8));
      setTrending(trendingContent.slice(0, 8));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching content:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="text-white text-xl">Loading amazing content...</div>
      </div>
    );
  }

  return (
    <div className="py-20 px-4">
      <div className="container mx-auto">
        {/* Trending Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-purple-400" />
              <h2 className="text-3xl font-bold text-white">Trending Now</h2>
            </div>
            <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
              View All
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {trending.map((item) => (
              <MovieCard 
                key={item.id} 
                movie={item} 
                type={item.title ? 'movie' : 'tv'} 
              />
            ))}
          </div>
        </section>

        {/* Popular Movies Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Popular Movies</h2>
            <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
              View All
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} type="movie" />
            ))}
          </div>
        </section>

        {/* TV Series Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Popular TV Series</h2>
            <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
              View All
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {tvShows.map((show) => (
              <MovieCard key={show.id} movie={show} type="tv" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
