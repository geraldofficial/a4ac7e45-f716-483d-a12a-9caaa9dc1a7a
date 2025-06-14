import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ImprovedMovieCard } from './ImprovedMovieCard';
import { NetflixMobileCard } from './NetflixMobileCard';
import { LoadingSpinner } from './LoadingSpinner';
import { EmailSubscription } from './EmailSubscription';
import { tmdbApi, Movie } from '@/services/tmdb';
import { getPersonalizedRecommendations, getRecommendationTitle } from '@/services/recommendations';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const EnhancedMovieSection = () => {
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendedPage, setRecommendedPage] = useState(1);
  const [hasMoreRecommended, setHasMoreRecommended] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();
  
  const observer = useRef<IntersectionObserver>();
  const lastMovieElementRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreRecommended) {
        loadMoreRecommended();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMoreRecommended]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchMovies = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const [popularResponse, trendingResponse] = await Promise.all([
        tmdbApi.getPopularMovies(1),
        tmdbApi.getTrendingMovies('day')
      ]);

      setPopularMovies(popularResponse);
      setTrendingMovies(trendingResponse);

      if (user && user.genre_preferences && user.genre_preferences.length > 0) {
        const recommendedResponse = await getPersonalizedRecommendations(user.genre_preferences, 1);
        setRecommendedMovies(recommendedResponse.results);
        setHasMoreRecommended(recommendedResponse.total_pages > 1);
        setRecommendedPage(1);
      } else {
        setRecommendedMovies(popularResponse);
        setHasMoreRecommended(false);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError('Failed to load movies. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const loadMoreRecommended = async () => {
    if (!user || !user.genre_preferences || loadingMore || !hasMoreRecommended) return;
    
    setLoadingMore(true);
    try {
      const nextPage = recommendedPage + 1;
      const response = await getPersonalizedRecommendations(user.genre_preferences, nextPage);
      
      setRecommendedMovies(prev => [...prev, ...response.results]);
      setRecommendedPage(nextPage);
      setHasMoreRecommended(nextPage < response.total_pages);
    } catch (error) {
      console.error('Error loading more recommendations:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const scrollSection = (sectionId: string, direction: 'left' | 'right') => {
    const section = document.getElementById(sectionId);
    if (section) {
      const scrollAmount = window.innerWidth < 768 ? 200 : 400;
      section.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Netflix-style mobile row component with error boundary
  const NetflixMobileRow = ({ 
    title, 
    movies, 
    sectionId, 
    priority = false,
    size = 'small'
  }: { 
    title: string; 
    movies: Movie[]; 
    sectionId: string; 
    priority?: boolean;
    size?: 'small' | 'large';
  }) => {
    try {
      return (
        <div className="netflix-mobile-section">
          <h2 className="netflix-mobile-title">{title}</h2>
          <div className="netflix-mobile-row">
            <div 
              id={sectionId}
              className="netflix-mobile-scroll"
            >
              {movies.map((movie, index) => {
                try {
                  return (
                    <div 
                      key={movie.id}
                      ref={sectionId === 'recommended' && index === movies.length - 1 ? lastMovieElementRef : null}
                    >
                      <NetflixMobileCard 
                        movie={movie} 
                        size={size}
                        priority={priority && index < 6}
                      />
                    </div>
                  );
                } catch (error) {
                  console.error('Error rendering movie card:', error, movie);
                  return null;
                }
              })}
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error rendering NetflixMobileRow:', error);
      return (
        <div className="netflix-mobile-section">
          <h2 className="netflix-mobile-title">{title}</h2>
          <div className="p-4 text-center text-gray-500">
            Failed to load content
          </div>
        </div>
      );
    }
  };

  // Desktop row component (unchanged)
  const DesktopMovieRow = ({ 
    title, 
    movies, 
    sectionId, 
    showScrollButtons = true,
    priority = false
  }: { 
    title: string; 
    movies: Movie[]; 
    sectionId: string; 
    showScrollButtons?: boolean;
    priority?: boolean;
  }) => (
    <section className="mobile-section">
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
          <div className="flex-1 min-w-0">
            <h2 className="mobile-title text-foreground truncate">
              {title}
            </h2>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-2">
          {sectionId === 'trending' && (
            <Button
              onClick={() => fetchMovies(true)}
              variant="outline"
              size="sm"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          {showScrollButtons && (
            <div className="flex gap-2">
              <Button
                onClick={() => scrollSection(sectionId, 'left')}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => scrollSection(sectionId, 'right')}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div 
        id={sectionId}
        className="mobile-scroll-horizontal"
      >
        {movies.map((movie, index) => (
          <div 
            key={movie.id} 
            className="flex-shrink-0"
            ref={sectionId === 'recommended' && index === movies.length - 1 ? lastMovieElementRef : null}
          >
            <ImprovedMovieCard 
              movie={movie} 
              priority={priority && index < 6}
              variant="default"
            />
          </div>
        ))}
      </div>
    </section>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" text="Loading amazing content..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <Card className="w-full max-w-md mx-auto mobile-container">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive mobile-title">Oops! Something went wrong</CardTitle>
            <CardDescription className="mobile-subtitle">{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => fetchMovies()} variant="outline" className="touch-button">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const recommendationTitle = user && user.genre_preferences 
    ? getRecommendationTitle(user.genre_preferences)
    : 'Popular Movies';

  return (
    <div className={isMobile ? 'netflix-mobile-container' : 'content-with-bottom-nav'}>
      {/* Netflix-style mobile layout */}
      {isMobile ? (
        <>
          <NetflixMobileRow
            title={recommendationTitle}
            movies={recommendedMovies}
            sectionId="recommended"
            priority={true}
            size="large"
          />

          <NetflixMobileRow
            title="Trending Now"
            movies={trendingMovies}
            sectionId="trending"
            priority={false}
          />

          <NetflixMobileRow
            title="Popular Movies"
            movies={popularMovies}
            sectionId="popular"
            priority={false}
          />

          {loadingMore && (
            <div className="text-center py-6">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          )}
        </>
      ) : (
        /* Desktop layout (unchanged) */
        <>
          <section className="mobile-section px-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
              <h2 className="mobile-title text-foreground">
                Stay Updated
              </h2>
            </div>
            <EmailSubscription />
          </section>

          <DesktopMovieRow
            title={recommendationTitle}
            movies={recommendedMovies}
            sectionId="recommended"
            showScrollButtons={false}
            priority={true}
          />

          <DesktopMovieRow
            title="Trending Now"
            movies={trendingMovies}
            sectionId="trending"
            priority={false}
          />

          <DesktopMovieRow
            title="Popular Movies"
            movies={popularMovies}
            sectionId="popular"
            priority={false}
          />

          {loadingMore && (
            <div className="text-center py-6">
              <LoadingSpinner size="md" text="Loading more recommendations..." />
            </div>
          )}
        </>
      )}
    </div>
  );
};
