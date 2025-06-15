
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { EnhancedMovieRow } from './EnhancedMovieRow';
import { LoadingSpinner } from './LoadingSpinner';
import { EmailSubscription } from './EmailSubscription';
import { tmdbApi, Movie } from '@/services/tmdb';
import { getPersonalizedRecommendations, getRecommendationTitle } from '@/services/recommendations';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw } from 'lucide-react';
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
        tmdbApi.getTrendingMovies(1)
      ]);

      setPopularMovies(popularResponse.results);
      setTrendingMovies(trendingResponse.results);

      if (user && user.genre_preferences && user.genre_preferences.length > 0) {
        const recommendedResponse = await getPersonalizedRecommendations(user.genre_preferences, 1);
        setRecommendedMovies(recommendedResponse.results);
        setHasMoreRecommended(recommendedResponse.total_pages > 1);
        setRecommendedPage(1);
      } else {
        setRecommendedMovies(popularResponse.results);
        setHasMoreRecommended(false);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError('Failed to load movies. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.genre_preferences]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const loadMoreRecommended = useCallback(async () => {
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
  }, [user, recommendedPage, loadingMore, hasMoreRecommended]);

  const recommendationTitle = useMemo(() => 
    user && user.genre_preferences 
      ? getRecommendationTitle(user.genre_preferences)
      : 'Popular Movies',
    [user?.genre_preferences]
  );

  const handleRefresh = useCallback(() => {
    fetchMovies(true);
  }, [fetchMovies]);

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

  return (
    <div className="space-y-6 md:space-y-8 lg:space-y-12">
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

      <EnhancedMovieRow
        title={recommendationTitle}
        movies={recommendedMovies}
        sectionId="recommended"
        showScrollButtons={false}
        priority={true}
        lastMovieElementRef={lastMovieElementRef}
      />

      <EnhancedMovieRow
        title="Trending Now"
        movies={trendingMovies}
        sectionId="trending"
        priority={false}
        showRefresh={true}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      <EnhancedMovieRow
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
