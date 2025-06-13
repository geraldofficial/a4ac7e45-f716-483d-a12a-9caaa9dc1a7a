import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { MovieCard } from '@/components/MovieCard';
import { Footer } from '@/components/Footer';
import { tmdbApi, Movie } from '@/services/tmdb';
import { Star } from 'lucide-react';

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
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-8">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-8">
            <div className="bg-primary/10 p-1.5 md:p-3 rounded-lg md:rounded-xl">
              <Star className="h-4 w-4 md:h-6 md:w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg md:text-3xl lg:text-4xl font-bold text-foreground">Top Rated</h1>
              <p className="text-muted-foreground text-xs md:text-lg">
                The highest rated movies and TV shows
              </p>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center text-muted-foreground text-sm md:text-xl">Loading top rated content...</div>
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
