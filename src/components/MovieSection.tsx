
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MovieRow } from './MovieRow';
import { LoadingSpinner } from './LoadingSpinner';
import { tmdbApi, Movie } from '@/services/tmdb';
import { getPersonalizedRecommendations, getRecommendationTitle } from '@/services/recommendations';
import { useAuth } from '@/contexts/AuthContext';

export const MovieSection = () => {
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
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

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      
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
      } else {
        setRecommendedMovies(popularResponse.results);
        setHasMoreRecommended(false);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 md:py-24">
        <LoadingSpinner size="lg" text="Loading amazing content..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 lg:space-y-12">
      <MovieRow
        title={recommendationTitle}
        movies={recommendedMovies}
        sectionId="recommended"
        showScrollButtons={false}
        priority={true}
      />

      <MovieRow
        title="Trending Now"
        movies={trendingMovies}
        sectionId="trending"
        priority={false}
      />

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
