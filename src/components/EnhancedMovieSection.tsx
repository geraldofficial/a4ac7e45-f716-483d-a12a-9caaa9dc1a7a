
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MovieGrid } from './MovieGrid';
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
  const { user } = useAuth();

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
      } else {
        setRecommendedMovies(popularResponse.results);
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
            <CardTitle className="text-red-500">Oops! Something went wrong</CardTitle>
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
    <div className="space-y-8 md:space-y-12">
      <MovieGrid
        title={recommendationTitle}
        movies={recommendedMovies}
        priority={true}
      />

      <MovieGrid
        title="Trending Now"
        movies={trendingMovies}
        showRefresh={true}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      <MovieGrid
        title="Popular Movies"
        movies={popularMovies}
      />
    </div>
  );
};
