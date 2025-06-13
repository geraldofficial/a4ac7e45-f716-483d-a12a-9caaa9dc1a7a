
import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { MovieCard } from '@/components/MovieCard';
import { Footer } from '@/components/Footer';
import { tmdbApi, Movie } from '@/services/tmdb';

const TopRated = () => {
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopRated();
  }, []);

  const fetchTopRated = async () => {
    try {
      const [moviesResponse, tvShows] = await Promise.all([
        tmdbApi.getPopularMovies(),
        tmdbApi.getPopularTVShows()
      ]);
      
      const moviesWithType = moviesResponse.results.map(movie => ({ ...movie, media_type: 'movie' as const }));
      const tvWithType = tvShows.map(tv => ({ ...tv, media_type: 'tv' as const }));
      
      const combined = [...moviesWithType, ...tvWithType]
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 40);
      
      setTopRated(combined);
    } catch (error) {
      console.error('Error fetching top rated:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-20 md:pb-8">
        <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 md:mb-8">Top Rated</h1>
          <p className="text-muted-foreground text-sm md:text-lg mb-4 md:mb-8">
            The highest rated movies and TV shows according to our community
          </p>
          
          {loading ? (
            <div className="text-center text-muted-foreground text-lg md:text-xl">Loading top rated content...</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-4 lg:gap-6">
              {topRated.map((item) => (
                <MovieCard key={`${item.id}-${item.media_type}`} movie={item} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TopRated;
