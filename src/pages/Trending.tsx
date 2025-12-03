import React, { useState, useEffect } from 'react';
import { ModernNavbar } from '@/components/layout/ModernNavbar';
import { MovieCard } from '@/components/MovieCard';
import { Footer } from '@/components/Footer';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Spinner } from '@/components/ui/spinner';
import { tmdbApi, Movie } from '@/services/tmdb';
import { TrendingUp } from 'lucide-react';

const Trending = () => {
  const [trendingContent, setTrendingContent] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchTrending();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <ModernNavbar />
      <div className="md:pt-20">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-foreground">Trending Now</h1>
              <p className="text-muted-foreground text-sm">What's popular this week</p>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {trendingContent.map((item) => (
                <MovieCard key={item.id} movie={item} />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="hidden md:block">
        <Footer />
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Trending;
