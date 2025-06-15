
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
      const popularMoviesResponse = await tmdbApi.getPopularMovies();
      setMovies(popularMoviesResponse.results.slice(0, 5));
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
      <section className="relative w-full h-[100dvh] flex items-center justify-center bg-background">
        <div className="text-foreground text-xl">Loading...</div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-[100dvh] overflow-hidden touch-pan-y">
      <Carousel className="w-full h-full" opts={{ align: "start", loop: true }}>
        <CarouselContent className="h-full m-0">
          {movies.map((movie) => {
            const title = movie.title || movie.name || 'Unknown Title';
            const backdropUrl = movie.backdrop_path 
              ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
              : 'https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=1920&h=1080&fit=crop';

            return (
              <CarouselItem key={movie.id} className="h-full p-0 basis-full">
                <div className="relative w-full h-[100dvh]">
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${backdropUrl})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>
                  
                  <div className="relative z-10 h-full flex items-center">
                    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="max-w-4xl text-white pt-16 sm:pt-20">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight animate-fade-in">
                          {title}
                        </h1>
                        
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
                          <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400 fill-current" />
                            <span className="text-lg sm:text-xl font-semibold">{movie.vote_average.toFixed(1)}</span>
                          </div>
                          
                          {(movie.release_date || movie.first_air_date) && (
                            <span className="text-base sm:text-lg font-medium">
                              {new Date(movie.release_date || movie.first_air_date || '').getFullYear()}
                            </span>
                          )}
                          
                          <span className="px-2 sm:px-3 py-1 bg-primary/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium border border-primary/30">
                            {movie.title ? 'Movie' : 'TV Series'}
                          </span>
                        </div>
                        
                        <p className="text-gray-200 text-sm sm:text-base lg:text-lg leading-relaxed mb-6 sm:mb-8 max-w-2xl line-clamp-3">
                          {movie.overview}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 animate-fade-in">
                          <Button 
                            onClick={() => handleWatchClick(movie)}
                            size="lg"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold w-full sm:w-auto"
                          >
                            <Play className="h-5 w-5 sm:h-6 sm:w-6 mr-2 fill-current" />
                            Watch Now
                          </Button>
                          
                          <Button
                            onClick={() => handleWatchClick(movie)}
                            variant="outline"
                            size="lg"
                            className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold w-full sm:w-auto"
                          >
                            <Info className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                            More Info
                          </Button>
                          
                          {user && !isInWatchlist(movie.id) && (
                            <Button
                              onClick={() => handleWatchlistClick(movie)}
                              variant="outline"
                              size="lg"
                              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold w-full sm:w-auto"
                            >
                              <Plus className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                              My List
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        
        <CarouselPrevious className="left-2 sm:left-6 h-10 w-10 sm:h-12 sm:w-12 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm" />
        <CarouselNext className="right-2 sm:right-6 h-10 w-10 sm:h-12 sm:w-12 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm" />
      </Carousel>
    </section>
  );
};
