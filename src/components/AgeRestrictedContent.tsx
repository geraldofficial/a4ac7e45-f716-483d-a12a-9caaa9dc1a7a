
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbApi } from '@/services/tmdb';
import { MovieCard } from '@/components/MovieCard';
import { Star, Heart, Sparkles, Users, TrendingUp, Film, Tv, Play } from 'lucide-react';

interface AgeRestrictedContentProps {
  profile: {
    id: string;
    name: string;
    is_child: boolean;
    age_restriction: number;
  };
}

export const AgeRestrictedContent: React.FC<AgeRestrictedContentProps> = ({ profile }) => {
  console.log('AgeRestrictedContent profile:', profile);

  // Kids content queries
  const { data: animationMovies, isLoading: loadingAnimation, error: animationError } = useQuery({
    queryKey: ['animation-movies', profile.id],
    queryFn: () => tmdbApi.getMoviesByGenre(16),
    enabled: profile.is_child || profile.age_restriction <= 13,
    retry: 3,
    staleTime: 1000 * 60 * 30
  });

  const { data: familyMovies, isLoading: loadingFamily, error: familyError } = useQuery({
    queryKey: ['family-movies', profile.id],
    queryFn: () => tmdbApi.getMoviesByGenre(10751),
    enabled: profile.is_child || profile.age_restriction <= 13,
    retry: 3,
    staleTime: 1000 * 60 * 30
  });

  const { data: adventureMovies, isLoading: loadingAdventure, error: adventureError } = useQuery({
    queryKey: ['adventure-movies', profile.id],
    queryFn: () => tmdbApi.getMoviesByGenre(12),
    enabled: profile.is_child || profile.age_restriction <= 13,
    retry: 3,
    staleTime: 1000 * 60 * 30
  });

  const { data: kidsTV, isLoading: loadingKidsTV, error: kidsTVError } = useQuery({
    queryKey: ['kids-tv', profile.id],
    queryFn: () => tmdbApi.getTVShowsByGenre(10762),
    enabled: profile.is_child,
    retry: 3,
    staleTime: 1000 * 60 * 30
  });

  // General content queries
  const { data: popularContent, isLoading: loadingPopular, error: popularError } = useQuery({
    queryKey: ['popular-content', profile.age_restriction],
    queryFn: () => tmdbApi.getPopularMovies(),
    retry: 3,
    staleTime: 1000 * 60 * 30
  });

  const { data: topRatedContent, isLoading: loadingTopRated, error: topRatedError } = useQuery({
    queryKey: ['top-rated-content', profile.id],
    queryFn: () => tmdbApi.getTopRatedMovies(),
    enabled: !profile.is_child,
    retry: 3,
    staleTime: 1000 * 60 * 30
  });

  const { data: trendingContent, isLoading: loadingTrending, error: trendingError } = useQuery({
    queryKey: ['trending-content', profile.id],
    queryFn: () => tmdbApi.getTrending(),
    retry: 3,
    staleTime: 1000 * 60 * 30
  });

  const { data: popularTV, isLoading: loadingPopularTV, error: popularTVError } = useQuery({
    queryKey: ['popular-tv', profile.id],
    queryFn: () => tmdbApi.getPopularTVShows(),
    retry: 3,
    staleTime: 1000 * 60 * 30
  });

  const formatMovieData = (item: any) => ({
    id: item.id,
    title: item.title || item.name,
    overview: item.overview || '',
    poster_path: item.poster_path || '',
    backdrop_path: item.backdrop_path || '',
    vote_average: item.vote_average || 0,
    release_date: item.release_date || item.first_air_date || '',
    media_type: item.media_type || (item.title ? 'movie' : 'tv')
  });

  const filterContentByAge = (content: any[]) => {
    if (!content) return [];
    
    return content.filter(item => {
      if (profile.is_child) {
        return item.vote_average >= 6.0 && !item.adult;
      }
      
      if (profile.age_restriction <= 16) {
        return item.vote_average >= 5.0 && !item.adult;
      }
      
      return true;
    }).slice(0, 12);
  };

  const isLoading = loadingAnimation || loadingFamily || loadingAdventure || loadingPopular || loadingKidsTV || loadingTopRated || loadingTrending || loadingPopularTV;
  const hasErrors = animationError || familyError || adventureError || popularError || kidsTVError || topRatedError || trendingError || popularTVError;

  // Debug logging
  console.log('Content loading states:', {
    isLoading,
    hasErrors,
    animationMovies: animationMovies?.results?.length || 0,
    familyMovies: familyMovies?.results?.length || 0,
    profile
  });

  if (profile.is_child) {
    return (
      <div className="space-y-6 px-4 sm:px-6 lg:px-8">
        {/* Kids Header */}
        <div className="text-center p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-pink-400/20 via-purple-400/20 to-blue-400/20 rounded-2xl lg:rounded-3xl border border-pink-400/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-blue-500/10 animate-pulse"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Play className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-pink-400 animate-bounce" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Hey {profile.name}!</h2>
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-yellow-400 animate-pulse" />
            </div>
            <p className="text-pink-300 text-lg sm:text-xl font-medium">Let's watch some amazing cartoons and animations!</p>
          </div>
        </div>

        {/* Animation Movies */}
        {animationMovies?.results && animationMovies.results.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl">
                <Film className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Animated Adventures</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
              {filterContentByAge(animationMovies.results).map((movie) => (
                <div key={movie.id} className="transform hover:scale-105 transition-transform duration-300">
                  <MovieCard movie={formatMovieData(movie)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Family Movies */}
        {familyMovies?.results && familyMovies.results.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl sm:rounded-2xl">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Family Fun Time</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
              {filterContentByAge(familyMovies.results).map((movie) => (
                <div key={movie.id} className="transform hover:scale-105 transition-transform duration-300">
                  <MovieCard movie={formatMovieData(movie)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Adventure Movies */}
        {adventureMovies?.results && adventureMovies.results.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl sm:rounded-2xl">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Adventure Time</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
              {filterContentByAge(adventureMovies.results).map((movie) => (
                <div key={movie.id} className="transform hover:scale-105 transition-transform duration-300">
                  <MovieCard movie={formatMovieData(movie)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kids TV Shows */}
        {kidsTV?.results && kidsTV.results.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl sm:rounded-2xl">
                <Tv className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Fun TV Shows</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
              {filterContentByAge(kidsTV.results).map((show) => (
                <div key={show.id} className="transform hover:scale-105 transition-transform duration-300">
                  <MovieCard movie={formatMovieData(show)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="text-center p-8 sm:p-12 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl lg:rounded-3xl border border-purple-400/30">
            <Play className="h-12 w-12 sm:h-16 sm:w-16 text-purple-400 mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Getting your cartoons ready!</h3>
            <p className="text-purple-300 text-base sm:text-lg">We're loading the best animations just for you!</p>
          </div>
        )}

        {/* Error state */}
        {hasErrors && !isLoading && (
          <div className="text-center p-8 sm:p-12 bg-gradient-to-r from-red-400/20 to-orange-400/20 rounded-2xl lg:rounded-3xl border border-red-400/30">
            <Play className="h-12 w-12 sm:h-16 sm:w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Oops! Something went wrong</h3>
            <p className="text-red-300 text-base sm:text-lg">We're having trouble loading content. Please try again later!</p>
          </div>
        )}

        {/* No content state */}
        {!isLoading && !hasErrors && (!animationMovies?.results?.length && !familyMovies?.results?.length && !adventureMovies?.results?.length && !kidsTV?.results?.length) && (
          <div className="text-center p-8 sm:p-12 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl lg:rounded-3xl border border-purple-400/30">
            <Play className="h-12 w-12 sm:h-16 sm:w-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">No content available</h3>
            <p className="text-purple-300 text-base sm:text-lg">We're working on adding more kid-friendly content!</p>
          </div>
        )}
      </div>
    );
  }

  // Teen and Adult content with improved mobile responsiveness
  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center p-4 sm:p-6 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl sm:rounded-2xl border border-blue-400/30">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome back, {profile.name}!</h2>
        <p className="text-blue-300 text-base sm:text-lg">
          {profile.age_restriction >= 21 ? 'Explore all the latest movies and shows' : 'Discover content perfect for your age group'}
        </p>
      </div>

      {/* Content sections with better mobile layout */}
      {trendingContent && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl sm:rounded-2xl">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">Trending Now</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filterContentByAge(trendingContent).map((item) => (
              <MovieCard key={item.id} movie={formatMovieData(item)} />
            ))}
          </div>
        </div>
      )}

      {popularContent?.results && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl">
              <Film className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">Popular Movies</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filterContentByAge(popularContent.results).map((movie) => (
              <MovieCard key={movie.id} movie={formatMovieData(movie)} />
            ))}
          </div>
        </div>
      )}

      {popularTV && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl sm:rounded-2xl">
              <Tv className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">Popular TV Shows</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filterContentByAge(popularTV).map((show) => (
              <MovieCard key={show.id} movie={formatMovieData(show)} />
            ))}
          </div>
        </div>
      )}

      {topRatedContent?.results && profile.age_restriction >= 18 && (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl sm:rounded-2xl">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">Top Rated</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filterContentByAge(topRatedContent.results).map((movie) => (
              <MovieCard key={movie.id} movie={formatMovieData(movie)} />
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="text-center p-8 sm:p-12">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Loading content...</h3>
          <p className="text-white/70 text-base sm:text-lg">Finding the best movies and shows for you!</p>
        </div>
      )}

      {/* Error state */}
      {hasErrors && !isLoading && (
        <div className="text-center p-8 sm:p-12 bg-gradient-to-r from-red-400/20 to-orange-400/20 rounded-xl sm:rounded-2xl border border-red-400/30">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Content unavailable</h3>
          <p className="text-red-300 text-base sm:text-lg">We're having trouble loading content. Please try again later!</p>
        </div>
      )}
    </div>
  );
};
