
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Play, Plus, Star, Info } from 'lucide-react';
import { tmdbApi, Movie } from '@/services/tmdb';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const HeroCarousel = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, addToWatchlist, isInWatchlist } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPopularMovies();
  }, []);

  const fetchPopularMovies = async () => {
    try {
      const popularMovies = await tmdbApi.getPopularMovies();
      setMovies(popularMovies.slice(0, 5));
    } catch (error) {
      console.error('Error fetching popular movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchClick = (movie: Movie) => {
    const type = movie.title ? 'movie' : 'tv';
    navigate(`/${type}/${movie.id}`);
  };

  const handleWatchlistClick = (movie: Movie) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your watchlist.",
        variant: "destructive",
      });
      return;
    }

    const title = movie.title || movie.name || 'Unknown Title';
    addToWatchlist(movie.id);
    toast({
      title: "Added to watchlist",
      description: `${title} has been added to your watchlist.`,
    });
  };

  if (loading) {
    return (
      <section className="relative w-full h-screen flex items-center justify-center bg-background">
        <div className="text-foreground text-xl">Loading...</div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-screen overflow-hidden">
      <Carousel className="w-full h-full" opts={{ align: "start", loop: true }}>
        <CarouselContent className="h-full m-0">
          {movies.map((movie) => {
            const title = movie.title || movie.name || 'Unknown Title';
            const backdropUrl = movie.backdrop_path 
              ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
              : 'https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=1920&h=1080&fit=crop';

            return (
              <CarouselItem key={movie.id} className="h-full p-0 basis-full">
                <div className="relative w-full h-full">
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${backdropUrl})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>
                  
                  <div className="relative z-10 container mx-auto px-6 h-full flex items-center pt-20">
                    <div className="max-w-2xl text-white">
                      <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in">
                        {title}
                      </h1>
                      
                      <div className="flex items-center gap-6 mb-6">
                        <div className="flex items-center gap-2">
                          <Star className="h-6 w-6 text-yellow-400 fill-current" />
                          <span className="text-xl font-semibold">{movie.vote_average.toFixed(1)}</span>
                        </div>
                        
                        {(movie.release_date || movie.first_air_date) && (
                          <span className="text-lg font-medium">
                            {new Date(movie.release_date || movie.first_air_date || '').getFullYear()}
                          </span>
                        )}
                        
                        <span className="px-3 py-1 bg-primary/20 backdrop-blur-sm rounded-full text-sm font-medium border border-primary/30">
                          {movie.title ? 'Movie' : 'TV Series'}
                        </span>
                      </div>
                      
                      <p className="text-gray-200 text-lg leading-relaxed mb-8 max-w-2xl line-clamp-3">
                        {movie.overview}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 animate-fade-in">
                        <Button 
                          onClick={() => handleWatchClick(movie)}
                          size="lg"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold"
                        >
                          <Play className="h-6 w-6 mr-2 fill-current" />
                          Watch Now
                        </Button>
                        
                        <Button
                          onClick={() => handleWatchClick(movie)}
                          variant="outline"
                          size="lg"
                          className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-3 text-lg font-semibold"
                        >
                          <Info className="h-6 w-6 mr-2" />
                          More Info
                        </Button>
                        
                        {user && !isInWatchlist(movie.id) && (
                          <Button
                            onClick={() => handleWatchlistClick(movie)}
                            variant="outline"
                            size="lg"
                            className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-3 text-lg font-semibold"
                          >
                            <Plus className="h-6 w-6 mr-2" />
                            My List
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        
        <CarouselPrevious className="left-6 h-12 w-12 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm" />
        <CarouselNext className="right-6 h-12 w-12 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm" />
      </Carousel>
    </section>
  );
};
