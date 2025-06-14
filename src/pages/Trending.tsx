
import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { MovieCard } from '@/components/MovieCard';
import { Footer } from '@/components/Footer';
import { tmdbApi, Movie } from '@/services/tmdb';
import { TrendingUp } from 'lucide-react';

const Trending = () => {
  const [trendingContent, setTrendingContent] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchTrending();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-24 md:pb-8">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-8">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-8">
            <div className="bg-primary/10 p-2 md:p-3 rounded-lg md:rounded-xl flex-shrink-0">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-foreground truncate">Trending Now</h1>
              <p className="text-muted-foreground text-sm md:text-lg">
                What's popular this week across movies and TV shows
              </p>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center text-muted-foreground text-sm md:text-xl py-12">Loading trending content...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
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
