import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MovieCard } from './MovieCard';
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
    showScrollButtons = true 
  }: { 
    title: string; 
    movies: Movie[]; 
    sectionId: string; 
    showScrollButtons?: boolean;
  }) => (
    <section className="mb-6 md:mb-8 lg:mb-12">
      <div className="flex items-center justify-between mb-3 md:mb-4 lg:mb-6 px-2 md:px-4 lg:px-6">
        <h2 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-foreground">
          {title}
        </h2>
        {showScrollButtons && (
          <div className="hidden md:flex gap-1 lg:gap-2">
            <button
              onClick={() => scrollSection(sectionId, 'left')}
              className="p-1.5 lg:p-2 rounded-full bg-accent hover:bg-accent/80 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" />
            </button>
            <button
              onClick={() => scrollSection(sectionId, 'right')}
              className="p-1.5 lg:p-2 rounded-full bg-accent hover:bg-accent/80 transition-colors"
            >
              <ChevronRight className="h-4 w-4 lg:h-5 lg:w-5" />
            </button>
          </div>
        )}
      </div>
      <div 
        id={sectionId}
        className="flex gap-2 md:gap-3 lg:gap-4 xl:gap-6 overflow-x-auto pb-2 md:pb-4 px-2 md:px-4 lg:px-6 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {movies.map((movie, index) => (
          <div 
            key={movie.id} 
            className="flex-shrink-0 w-24 sm:w-28 md:w-32 lg:w-40 xl:w-48"
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
      <div className="flex items-center justify-center py-8 md:py-12 lg:py-16 xl:py-20">
        <div className="text-foreground text-sm md:text-lg lg:text-xl">Loading amazing content...</div>
      </div>
    );
  }

  const recommendationTitle = user && user.genre_preferences 
    ? getRecommendationTitle(user.genre_preferences)
    : 'Popular Movies';

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 xl:space-y-12">
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
        <div className="text-center text-foreground text-sm md:text-lg py-2 md:py-4">
          Loading more recommendations...
        </div>
      )}
    </div>
  );
};
