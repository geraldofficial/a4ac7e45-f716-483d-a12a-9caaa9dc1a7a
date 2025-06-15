import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Play, Plus, Star, Info, RefreshCw } from 'lucide-react';
import { tmdbApi, Movie } from '@/services/tmdb';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
interface HeroCarouselProps {
  profile?: {
    id: string;
    name: string;
    is_child: boolean;
    age_restriction: number;
  };
}
export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  profile
}) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const {
    user,
    addToWatchlist,
    isInWatchlist
  } = useAuth();
  const {
    toast
  } = useToast();
  useEffect(() => {
    fetchAgeAppropriateMovies();
  }, [profile]);
  const filterContentByAge = (content: Movie[]) => {
    if (!content) return [];
    return content.filter(item => {
      if (profile?.is_child) {
        // For children: only family-friendly content with good ratings
        return item.vote_average >= 6.0 && !item.adult;
      }
      if (profile && profile.age_restriction <= 16) {
        // For teens: avoid adult content, prefer well-rated content
        return item.vote_average >= 5.0 && !item.adult;
      }

      // For adults or no profile: show all content
      return true;
    });
  };
  const fetchAgeAppropriateMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      let moviesResponse;
      if (profile?.is_child) {
        // For children: get family and animation movies
        const [familyMovies, animationMovies] = await Promise.all([tmdbApi.getMoviesByGenre(10751),
        // Family genre
        tmdbApi.getMoviesByGenre(16) // Animation genre
        ]);
        const combinedMovies = [...(familyMovies?.results || []), ...(animationMovies?.results || [])];

        // Remove duplicates and filter
        const uniqueMovies = combinedMovies.filter((movie, index, self) => index === self.findIndex(m => m.id === movie.id));
        moviesResponse = {
          results: filterContentByAge(uniqueMovies)
        };
      } else if (profile && profile.age_restriction <= 16) {
        // For teens: get adventure and comedy movies (teen-friendly genres)
        const [adventureMovies, comedyMovies] = await Promise.all([tmdbApi.getMoviesByGenre(12),
        // Adventure genre
        tmdbApi.getMoviesByGenre(35) // Comedy genre
        ]);
        const combinedMovies = [...(adventureMovies?.results || []), ...(comedyMovies?.results || [])];
        const uniqueMovies = combinedMovies.filter((movie, index, self) => index === self.findIndex(m => m.id === movie.id));
        moviesResponse = {
          results: filterContentByAge(uniqueMovies)
        };
      } else {
        // For adults or no profile: get popular movies
        moviesResponse = await tmdbApi.getPopularMovies();
        moviesResponse.results = filterContentByAge(moviesResponse.results || []);
      }
      if (moviesResponse && moviesResponse.results && moviesResponse.results.length > 0) {
        setMovies(moviesResponse.results.slice(0, 5));
      } else {
        throw new Error('No age-appropriate content available');
      }
    } catch (error) {
      console.error('Error fetching age-appropriate movies:', error);
      setError('Failed to load content. Please check your API configuration.');

      // Fallback to mock data based on profile
      const fallbackTitle = profile?.is_child ? 'Welcome to Kid-Friendly FlickPick' : 'Welcome to FlickPick';
      const fallbackOverview = profile?.is_child ? 'Discover amazing cartoons and family movies! Configure your TMDB API key to start exploring kid-friendly content!' : 'Discover amazing movies and TV shows. Configure your TMDB API key to start exploring!';
      setMovies([{
        id: 1,
        title: fallbackTitle,
        overview: fallbackOverview,
        poster_path: '',
        backdrop_path: '',
        vote_average: 8.5,
        release_date: '2024-01-01'
      }]);
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
        variant: "destructive"
      });
      return;
    }
    const title = movie.title || movie.name || 'Unknown Title';
    addToWatchlist(movie.id);
    toast({
      title: "Added to watchlist",
      description: `${title} has been added to your watchlist.`
    });
  };
  if (loading) {
    return <section className="relative w-full h-[100dvh] flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="text-foreground text-xl">
            {profile?.is_child ? 'Loading amazing cartoons...' : 'Loading amazing content...'}
          </div>
        </div>
      </section>;
  }
  if (error) {
    return <section className="relative w-full h-[100dvh] flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <div className="text-destructive text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-foreground">Content Loading Issue</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchAgeAppropriateMovies} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </section>;
  }
  return <section className="relative w-full h-[100dvh] overflow-hidden touch-pan-y">
      <Carousel className="w-full h-full" opts={{
      align: "start",
      loop: true
    }}>
        <CarouselContent className="h-full m-0">
          {movies.map(movie => {
          const title = movie.title || movie.name || 'Unknown Title';
          const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : 'https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=1920&h=1080&fit=crop';
          return <CarouselItem key={movie.id} className="h-full p-0 basis-full">
                <div className="relative w-full h-[100dvh]">
                  <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
                backgroundImage: `url(${backdropUrl})`
              }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>
                  
                  <div className="relative z-10 h-full flex items-center mr-0 ">
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
                          
                          {(movie.release_date || movie.first_air_date) && <span className="text-base sm:text-lg font-medium">
                              {new Date(movie.release_date || movie.first_air_date || '').getFullYear()}
                            </span>}
                          
                          <span className="px-2 sm:px-3 py-1 bg-primary/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium border border-primary/30">
                            {movie.title ? 'Movie' : 'TV Series'}
                          </span>
                          
                          {profile?.is_child && <span className="px-2 sm:px-3 py-1 bg-green-500/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium border border-green-500/30 text-green-300">
                              Kid-Friendly
                            </span>}
                        </div>
                        
                        <p className="text-gray-200 text-sm sm:text-base lg:text-lg leading-relaxed mb-6 sm:mb-8 max-w-2xl line-clamp-3">
                          {movie.overview}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 animate-fade-in">
                          <Button onClick={() => handleWatchClick(movie)} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold w-full sm:w-auto">
                            <Play className="h-5 w-5 sm:h-6 sm:w-6 mr-2 fill-current" />
                            Watch Now
                          </Button>
                          
                          <Button onClick={() => handleWatchClick(movie)} variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold w-full sm:w-auto">
                            <Info className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                            More Info
                          </Button>
                          
                          {user && !isInWatchlist(movie.id) && <Button onClick={() => handleWatchlistClick(movie)} variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold w-full sm:w-auto">
                              <Plus className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                              My List
                            </Button>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>;
        })}
        </CarouselContent>
        
        <CarouselPrevious className="left-2 sm:left-6 h-10 w-10 sm:h-12 sm:w-12 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm" />
        <CarouselNext className="right-2 sm:right-6 h-10 w-10 sm:h-12 sm:w-12 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm" />
      </Carousel>
    </section>;
};