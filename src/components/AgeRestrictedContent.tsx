
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbApi } from '@/services/tmdb';
import { MovieCard } from '@/components/MovieCard';
import { Baby, Star, Heart, Sparkles } from 'lucide-react';

interface AgeRestrictedContentProps {
  profile: {
    id: string;
    name: string;
    is_child: boolean;
    age_restriction: number;
  };
}

export const AgeRestrictedContent: React.FC<AgeRestrictedContentProps> = ({ profile }) => {
  // Kids content - Animation and Family movies
  const { data: animationMovies } = useQuery({
    queryKey: ['animation-movies'],
    queryFn: () => tmdbApi.getMoviesByGenre(16), // Animation genre
    enabled: profile.is_child
  });

  const { data: familyMovies } = useQuery({
    queryKey: ['family-movies'],
    queryFn: () => tmdbApi.getMoviesByGenre(10751), // Family genre
    enabled: profile.is_child
  });

  // Popular animations for kids
  const { data: popularAnimations } = useQuery({
    queryKey: ['popular-animations'],
    queryFn: () => tmdbApi.getPopularMovies(),
    enabled: profile.is_child
  });

  // Teen content
  const { data: teenContent } = useQuery({
    queryKey: ['teen-content'],
    queryFn: () => tmdbApi.getPopularMovies(),
    enabled: !profile.is_child && profile.age_restriction <= 16
  });

  // Adult content
  const { data: adultContent } = useQuery({
    queryKey: ['adult-content'],
    queryFn: () => tmdbApi.getTrending(),
    enabled: !profile.is_child && profile.age_restriction >= 18
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
    
    if (profile.is_child) {
      // For kids, show all content from family/animation genres
      return content.slice(0, 12);
    }
    
    return content.filter(item => {
      // For teen profiles, exclude very mature content
      if (profile.age_restriction <= 16) {
        return item.vote_average >= 4.0;
      }
      
      // Adult profiles can see all content
      return true;
    }).slice(0, 12);
  };

  if (profile.is_child) {
    return (
      <div className="space-y-8">
        {/* Kids Header */}
        <div className="text-center p-8 bg-gradient-to-r from-pink-400/20 via-purple-400/20 to-blue-400/20 rounded-3xl border border-pink-400/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-blue-500/10 animate-pulse"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Baby className="h-10 w-10 text-pink-400 animate-bounce" />
              <h2 className="text-4xl font-bold text-white">Hey {profile.name}! 🌟</h2>
              <Sparkles className="h-10 w-10 text-yellow-400 animate-pulse" />
            </div>
            <p className="text-pink-300 text-xl font-medium">Let's watch some amazing cartoons and animations!</p>
            <div className="mt-4 flex justify-center gap-4 text-2xl">
              🎭 🎪 🎨 🎪 🎭
            </div>
          </div>
        </div>

        {/* Animation Movies */}
        {animationMovies?.results && animationMovies.results.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white">Animated Adventures 🚀</h3>
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
              <h3 className="text-3xl font-bold text-white">Family Fun Time 🎪</h3>
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

        {/* Popular Content for Kids */}
        {popularAnimations?.results && popularAnimations.results.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white">Popular Right Now 🔥</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {filterContentByAge(popularAnimations.results).map((movie) => (
                <div key={movie.id} className="transform hover:scale-105 transition-transform duration-300">
                  <MovieCard movie={formatMovieData(movie)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fun message if no content */}
        {(!animationMovies?.results?.length && !familyMovies?.results?.length && !popularAnimations?.results?.length) && (
          <div className="text-center p-12 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-3xl border border-purple-400/30">
            <Baby className="h-16 w-16 text-purple-400 mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-white mb-2">Getting your cartoons ready! 🎬</h3>
            <p className="text-purple-300 text-lg">We're loading the best animations just for you!</p>
          </div>
        )}
      </div>
    );
  }

  // Teen content
  if (profile.age_restriction <= 16) {
    return (
      <div className="space-y-8">
        <div className="text-center p-6 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl border border-blue-400/30">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {profile.name}!</h2>
          <p className="text-blue-300 text-lg">Discover content perfect for your age group</p>
        </div>

        {teenContent?.results && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Popular for Teens</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {filterContentByAge(teenContent.results).map((movie) => (
                <MovieCard key={movie.id} movie={formatMovieData(movie)} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Adult content
  return (
    <div className="space-y-8">
      <div className="text-center p-6 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl border border-purple-400/30">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {profile.name}!</h2>
        <p className="text-purple-300 text-lg">Explore all the latest movies and shows</p>
      </div>

      {adultContent && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">Trending Now</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filterContentByAge(adultContent).map((movie) => (
              <MovieCard key={movie.id} movie={formatMovieData(movie)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
