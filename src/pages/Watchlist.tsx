
import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { MovieCard } from '@/components/MovieCard';
import { Footer } from '@/components/Footer';
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
            console.error(`Failed to load content with ID ${id}`);
            return null;
          }
        }
      });

      const results = await Promise.all(moviePromises);
      const validMovies = results.filter((movie): movie is Movie => movie !== null);
      setWatchlistMovies(validMovies);
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background dark">
        <Navbar />
        <div className="pt-24 md:pt-28 pb-24 md:pb-8 px-4">
          <div className="container mx-auto text-center">
            <div className="max-w-md mx-auto bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8">
              <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-4">My Watchlist</h1>
              <p className="text-muted-foreground">Please sign in to view your watchlist</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      
      <div className="pt-24 md:pt-28 pb-24 md:pb-8 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/10 p-3 rounded-xl">
              <Bookmark className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Watchlist</h1>
              <p className="text-muted-foreground">Your saved movies and TV shows</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <div className="text-foreground text-lg">Loading your watchlist...</div>
              </div>
            </div>
          ) : watchlistMovies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {watchlistMovies.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8">
                <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Your watchlist is empty</h2>
                <p className="text-muted-foreground mb-6">Add movies and TV shows to your watchlist to watch them later</p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Heart className="h-4 w-4" />
                  <span>Browse and discover amazing content</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Watchlist;
