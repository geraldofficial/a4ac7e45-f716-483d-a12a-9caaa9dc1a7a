import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MovieCard } from './MovieCard';
import { LoadingSpinner } from './LoadingSpinner';
import { tmdbApi, Movie } from '@/services/tmdb';
import { getPersonalizedRecommendations, getRecommendationTitle } from '@/services/recommendations';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        
        // Fetch all sections in parallel
        const [popularResponse, trendingResponse] = await Promise.all([
          tmdbApi.getPopularMovies(1),
          tmdbApi.getTrendingMovies(1)
        ]);

        setPopularMovies(popularResponse.results);
        setTrendingMovies(trendingResponse.results);

        // Fetch personalized recommendations if user has preferences
        if (user && user.genre_preferences && user.genre_preferences.length > 0) {
          const recommendedResponse = await getPersonalizedRecommendations(user.genre_preferences, 1);
          setRecommendedMovies(recommendedResponse.results);
          setHasMoreRecommended(recommendedResponse.total_pages > 1);
        } else {
          // Fallback to popular movies for non-authenticated users
          setRecommendedMovies(popularResponse.results);
          setHasMoreRecommended(false);
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [user]);

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

  const MovieRow = ({ 
    title, 
    movies, 
    sectionId, 
    showScrollButtons = true 
  }: { 
    title: string; 
    movies: Movie[]; 
    sectionId: string; 
    showScrollButtons?: boolean;
  }) => (
    <section className="mb-4 md:mb-6">
      <div className="flex items-center justify-between mb-2 md:mb-3 px-2 md:px-4">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-4 bg-gradient-to-b from-primary to-primary/50 rounded-full"></div>
          <h2 className="text-base md:text-xl lg:text-2xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            {title}
          </h2>
        </div>
        {showScrollButtons && (
          <div className="hidden md:flex gap-1">
            <button
              onClick={() => scrollSection(sectionId, 'left')}
              className="p-1.5 rounded-full bg-card/80 hover:bg-card border border-border hover:border-primary/50 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
            >
              <ChevronLeft className="h-3 w-3 text-foreground" />
            </button>
            <button
              onClick={() => scrollSection(sectionId, 'right')}
              className="p-1.5 rounded-full bg-card/80 hover:bg-card border border-border hover:border-primary/50 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
            >
              <ChevronRight className="h-3 w-3 text-foreground" />
            </button>
          </div>
        )}
      </div>
      <div 
        id={sectionId}
        className="flex gap-2 md:gap-3 lg:gap-4 overflow-x-auto pb-2 px-2 md:px-4 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {movies.map((movie, index) => (
          <div 
            key={movie.id} 
            className="flex-shrink-0 w-28 sm:w-32 md:w-36 lg:w-40 xl:w-44"
            ref={sectionId === 'recommended' && index === movies.length - 1 ? lastMovieElementRef : null}
          >
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </section>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 md:py-16">
        <LoadingSpinner size="lg" text="Loading amazing content..." />
      </div>
    );
  }

  const recommendationTitle = user && user.genre_preferences 
    ? getRecommendationTitle(user.genre_preferences)
    : 'Popular Movies';

  return (
    <div className="space-y-3 md:space-y-4 lg:space-y-6">
      {/* Personalized Recommendations */}
      <MovieRow
        title={recommendationTitle}
        movies={recommendedMovies}
        sectionId="recommended"
        showScrollButtons={false}
      />

      {/* Trending Movies */}
      <MovieRow
        title="Trending Now"
        movies={trendingMovies}
        sectionId="trending"
      />

      {/* Popular Movies */}
      <MovieRow
        title="Popular Movies"
        movies={popularMovies}
        sectionId="popular"
      />

      {loadingMore && (
        <div className="text-center py-4">
          <LoadingSpinner size="md" text="Loading more recommendations..." />
        </div>
      )}
    </div>
  );
};
