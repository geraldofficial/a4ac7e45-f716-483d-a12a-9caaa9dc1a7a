import React, { useState, useEffect } from 'react';
import { ModernNavbar } from '@/components/layout/ModernNavbar';
import { MovieCard } from '@/components/MovieCard';
import { Footer } from '@/components/Footer';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/contexts/AuthContext';
import { tmdbApi, Movie } from '@/services/tmdb';
import { Bookmark, Heart } from 'lucide-react';

const Watchlist = () => {
  const { user } = useAuth();
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.watchlist.length) {
      loadWatchlistMovies();
    } else {
      setLoading(false);
    }
  }, [user?.watchlist]);

  const loadWatchlistMovies = async () => {
    if (!user?.watchlist.length) return;
    
    setLoading(true);
    try {
      const moviePromises = user.watchlist.map(async (id) => {
        try {
          return await tmdbApi.getMovieDetails(id);
        } catch (error) {
          try {
            return await tmdbApi.getTVDetails(id);
          } catch (tvError) {
            return null;
          }
        }
      });

      const results = await Promise.all(moviePromises);
      setWatchlistMovies(results.filter((movie): movie is Movie => movie !== null));
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <ModernNavbar />
        <div className="md:pt-20 py-8 px-4">
          <div className="container mx-auto text-center">
            <div className="max-w-sm mx-auto">
              <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-xl font-bold text-foreground mb-2">My Watchlist</h1>
              <p className="text-muted-foreground text-sm">Please sign in to view your watchlist</p>
            </div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <ModernNavbar />
      
      <div className="md:pt-20 py-6 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Bookmark className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">My Watchlist</h1>
              <p className="text-muted-foreground text-sm">Your saved content</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : watchlistMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {watchlistMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-foreground mb-2">Empty watchlist</h2>
              <p className="text-muted-foreground text-sm mb-4">Add movies and shows to watch later</p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Heart className="h-3 w-3" />
                <span>Browse and discover content</span>
              </div>
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

export default Watchlist;
