
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Play, Plus, Star } from 'lucide-react';
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
      setMovies(popularMovies.slice(0, 5)); // Get top 5 movies
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
      <section className="relative h-screen flex items-center justify-center">
        <div className="text-foreground text-xl">Loading...</div>
      </section>
    );
  }

  return (
    <section className="relative h-screen overflow-hidden">
      <Carousel className="h-full">
        <CarouselContent className="h-full">
          {movies.map((movie) => {
            const title = movie.title || movie.name || 'Unknown Title';
            const backdropUrl = movie.backdrop_path 
              ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
              : 'https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=1920&h=1080&fit=crop';

            return (
              <CarouselItem key={movie.id} className="h-full">
                <div className="relative h-full">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${backdropUrl})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
                  </div>
                  
                  <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
                    <div className="max-w-2xl">
                      <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 animate-fade-in">
                        {title}
                      </h1>
                      
                      <div className="flex items-center gap-4 text-foreground mb-6">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 text-yellow-400 fill-current" />
                          <span className="text-lg font-semibold">{movie.vote_average.toFixed(1)}</span>
                        </div>
                        
                        {(movie.release_date || movie.first_air_date) && (
                          <span className="text-lg">
                            {new Date(movie.release_date || movie.first_air_date || '').getFullYear()}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-xl line-clamp-3">
                        {movie.overview}
                      </p>
                      
                      <div className="flex gap-4 animate-fade-in">
                        <Button 
                          onClick={() => handleWatchClick(movie)}
                          size="lg"
                          className="bg-primary hover:bg-primary/90 px-8"
                        >
                          <Play className="h-5 w-5 mr-2" />
                          Watch Now
                        </Button>
                        
                        {user && !isInWatchlist(movie.id) && (
                          <Button
                            onClick={() => handleWatchlistClick(movie)}
                            variant="outline"
                            size="lg"
                            className="border-border text-foreground hover:bg-accent px-8"
                          >
                            <Plus className="h-5 w-5 mr-2" />
                            Add to List
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
        
        <CarouselPrevious className="left-4 text-foreground border-border hover:bg-accent" />
        <CarouselNext className="right-4 text-foreground border-border hover:bg-accent" />
      </Carousel>
    </section>
  );
};
