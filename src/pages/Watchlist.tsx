
import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { MovieCard } from '@/components/MovieCard';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { tmdbApi, Movie } from '@/services/tmdb';
import { Bookmark } from 'lucide-react';

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
          // Try to get movie details first
          return await tmdbApi.getMovieDetails(id);
        } catch (error) {
          // If movie fails, try TV show
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="pt-24 pb-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-3xl font-bold text-white mb-4">My Watchlist</h1>
            <p className="text-gray-400">Please sign in to view your watchlist</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Bookmark className="h-6 w-6 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">My Watchlist</h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-white text-xl">Loading your watchlist...</div>
            </div>
          ) : watchlistMovies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {watchlistMovies.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Bookmark className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-xl">Your watchlist is empty</p>
              <p className="text-gray-500 mt-2">Add movies and TV shows to your watchlist to watch them later</p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Watchlist;
