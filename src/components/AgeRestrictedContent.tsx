
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbApi } from '@/services/tmdb';
import { MovieCard } from '@/components/MovieCard';
import { Baby, Star, Heart, Sparkles, Users, TrendingUp, Film, Tv } from 'lucide-react';

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

  // Kids content - Animation and Family movies with proper age filtering
  const { data: animationMovies, isLoading: loadingAnimation } = useQuery({
    queryKey: ['animation-movies'],
    queryFn: () => tmdbApi.getMoviesByGenre(16), // Animation genre
    enabled: profile.is_child || profile.age_restriction <= 13
  });

  const { data: familyMovies, isLoading: loadingFamily } = useQuery({
    queryKey: ['family-movies'],
    queryFn: () => tmdbApi.getMoviesByGenre(10751), // Family genre
    enabled: profile.is_child || profile.age_restriction <= 13
  });

  // Adventure movies for kids
  const { data: adventureMovies, isLoading: loadingAdventure } = useQuery({
    queryKey: ['adventure-movies'],
    queryFn: () => tmdbApi.getMoviesByGenre(12), // Adventure genre
    enabled: profile.is_child || profile.age_restriction <= 13
  });

  // Popular content for all age groups
  const { data: popularContent, isLoading: loadingPopular } = useQuery({
    queryKey: ['popular-content', profile.age_restriction],
    queryFn: () => tmdbApi.getPopularMovies(),
  });

  // TV Shows for kids
  const { data: kidsTV, isLoading: loadingKidsTV } = useQuery({
    queryKey: ['kids-tv'],
    queryFn: () => tmdbApi.getTVShowsByGenre(10762), // Kids genre for TV
    enabled: profile.is_child
  });

  // Top rated content for teens and adults
  const { data: topRatedContent, isLoading: loadingTopRated } = useQuery({
    queryKey: ['top-rated-content'],
    queryFn: () => tmdbApi.getTopRatedMovies(),
    enabled: !profile.is_child
  });

  // Trending content for all ages
  const { data: trendingContent, isLoading: loadingTrending } = useQuery({
    queryKey: ['trending-content'],
    queryFn: () => tmdbApi.getTrending(),
  });

  // Popular TV Shows for all ages
  const { data: popularTV, isLoading: loadingPopularTV } = useQuery({
    queryKey: ['popular-tv'],
    queryFn: () => tmdbApi.getPopularTVShows(),
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
      // For kids profiles, only show highly rated family content
      if (profile.is_child) {
        return item.vote_average >= 6.0 && !item.adult;
      }
      
      // For teens, exclude adult content and very low rated items
      if (profile.age_restriction <= 16) {
        return item.vote_average >= 5.0 && !item.adult;
      }
      
      // Adults can see all content
      return true;
    }).slice(0, 12);
  };

  const isLoading = loadingAnimation || loadingFamily || loadingAdventure || loadingPopular || loadingKidsTV || loadingTopRated || loadingTrending || loadingPopularTV;

  if (profile.is_child) {
    return (
      <div className="space-y-8">
        {/* Kids Header */}
        <div className="text-center p-8 bg-gradient-to-r from-pink-400/20 via-purple-400/20 to-blue-400/20 rounded-3xl border border-pink-400/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-blue-500/10 animate-pulse"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Baby className="h-10 w-10 text-pink-400 animate-bounce" />
              <h2 className="text-4xl font-bold text-white">Hey {profile.name}!</h2>
              <Sparkles className="h-10 w-10 text-yellow-400 animate-pulse" />
            </div>
            <p className="text-pink-300 text-xl font-medium">Let's watch some amazing cartoons and animations!</p>
          </div>
        </div>

        {/* Animation Movies */}
        {animationMovies?.results && animationMovies.results.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                <Film className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white">Animated Adventures</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
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
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white">Family Fun Time</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
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
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white">Adventure Time</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
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
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl">
                <Tv className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white">Fun TV Shows</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {filterContentByAge(kidsTV.results).map((show) => (
                <div key={show.id} className="transform hover:scale-105 transition-transform duration-300">
                  <MovieCard movie={formatMovieData(show)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading message if no content */}
        {isLoading && (
          <div className="text-center p-12 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-3xl border border-purple-400/30">
            <Baby className="h-16 w-16 text-purple-400 mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-white mb-2">Getting your cartoons ready!</h3>
            <p className="text-purple-300 text-lg">We're loading the best animations just for you!</p>
          </div>
        )}

        {/* No content message */}
        {!isLoading && (!animationMovies?.results?.length && !familyMovies?.results?.length && !adventureMovies?.results?.length && !kidsTV?.results?.length) && (
          <div className="text-center p-12 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-3xl border border-purple-400/30">
            <Baby className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No content available</h3>
            <p className="text-purple-300 text-lg">We're working on adding more kid-friendly content!</p>
          </div>
        )}
      </div>
    );
  }

  // Teen content (age 13-16)
  if (profile.age_restriction <= 16) {
    return (
      <div className="space-y-8">
        <div className="text-center p-6 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl border border-blue-400/30">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {profile.name}!</h2>
          <p className="text-blue-300 text-lg">Discover content perfect for your age group</p>
        </div>

        {/* Teen Popular Content */}
        {popularContent?.results && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Popular for Teens</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {filterContentByAge(popularContent.results).map((movie) => (
                <MovieCard key={movie.id} movie={formatMovieData(movie)} />
              ))}
            </div>
          </div>
        )}

        {/* Teen Animations */}
        {animationMovies?.results && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Cool Animations</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {filterContentByAge(animationMovies.results).map((movie) => (
                <MovieCard key={movie.id} movie={formatMovieData(movie)} />
              ))}
            </div>
          </div>
        )}

        {/* Trending Content */}
        {trendingContent && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Trending Now</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {filterContentByAge(trendingContent).map((item) => (
                <MovieCard key={item.id} movie={formatMovieData(item)} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Adult content (18+)
  return (
    <div className="space-y-8">
      <div className="text-center p-6 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl border border-purple-400/30">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {profile.name}!</h2>
        <p className="text-purple-300 text-lg">
          {profile.age_restriction >= 21 ? 'Explore all the latest movies and shows' : 'Explore age-appropriate content'}
        </p>
      </div>

      {/* Trending Content */}
      {trendingContent && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">Trending Now</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filterContentByAge(trendingContent).map((item) => (
              <MovieCard key={item.id} movie={formatMovieData(item)} />
            ))}
          </div>
        </div>
      )}

      {/* Popular Movies */}
      {popularContent?.results && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
              <Film className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">Popular Movies</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filterContentByAge(popularContent.results).map((movie) => (
              <MovieCard key={movie.id} movie={formatMovieData(movie)} />
            ))}
          </div>
        </div>
      )}

      {/* Popular TV Shows */}
      {popularTV && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl">
              <Tv className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">Popular TV Shows</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filterContentByAge(popularTV).map((show) => (
              <MovieCard key={show.id} movie={formatMovieData(show)} />
            ))}
          </div>
        </div>
      )}

      {/* Top Rated Content (for adults only) */}
      {topRatedContent?.results && profile.age_restriction >= 18 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl">
              <Star className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white">Top Rated</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filterContentByAge(topRatedContent.results).map((movie) => (
              <MovieCard key={movie.id} movie={formatMovieData(movie)} />
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="text-center p-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-2xl font-bold text-white mb-2">Loading content...</h3>
          <p className="text-white/70 text-lg">Finding the best movies and shows for you!</p>
        </div>
      )}
    </div>
  );
};
