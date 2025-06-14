
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ImprovedMovieCard } from './ImprovedMovieCard';
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
      const scrollAmount = window.innerWidth < 768 ? 150 : 400;
      section.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const MovieRow = ({ 
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
    <section className="mb-6 md:mb-12 movie-section">
      <div className="flex items-center justify-between mb-4 md:mb-6 px-3 md:px-6">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/50 rounded-full"></div>
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {sectionId === 'trending' && (
            <Button
              onClick={() => fetchMovies(true)}
              variant="outline"
              size="sm"
              disabled={refreshing}
              className="hidden md:flex"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          {showScrollButtons && (
            <div className="hidden md:flex gap-2">
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
        className="horizontal-scroll movie-row"
      >
        {movies.map((movie, index) => (
          <div 
            key={movie.id} 
            className="movie-card-mobile md:w-40 lg:w-48 xl:w-52 movie-card"
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
      <div className="flex items-center justify-center py-16 md:py-24">
        <LoadingSpinner size="lg" text="Loading amazing content..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16 md:py-24">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Oops! Something went wrong</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => fetchMovies()} variant="outline">
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
    <div className="space-y-4 md:space-y-8 lg:space-y-12 pb-mobile-nav">
      {/* Email Subscription Section */}
      <section className="px-3 md:px-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/50 rounded-full"></div>
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-foreground">
            Stay Updated
          </h2>
        </div>
        <EmailSubscription />
      </section>

      {/* Personalized Recommendations */}
      <MovieRow
        title={recommendationTitle}
        movies={recommendedMovies}
        sectionId="recommended"
        showScrollButtons={false}
        priority={true}
      />

      {/* Trending Movies */}
      <MovieRow
        title="Trending Now"
        movies={trendingMovies}
        sectionId="trending"
        priority={false}
      />

      {/* Popular Movies */}
      <MovieRow
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
    </div>
  );
};
