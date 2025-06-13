
import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { MovieCard } from '@/components/MovieCard';
import { Footer } from '@/components/Footer';
import { tmdbApi, Movie } from '@/services/tmdb';

const Trending = () => {
  const [trendingContent, setTrendingContent] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const trending = await tmdbApi.getTrending();
      setTrendingContent(trending);
    } catch (error) {
      console.error('Error fetching trending:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-20 md:pb-8">
        <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 md:mb-8">Trending Now</h1>
          <p className="text-muted-foreground text-sm md:text-lg mb-4 md:mb-8">
            What's popular this week across movies and TV shows
          </p>
          
          {loading ? (
            <div className="text-center text-muted-foreground text-lg md:text-xl">Loading trending content...</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-4 lg:gap-6">
              {trendingContent.map((item) => (
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

export default Trending;
