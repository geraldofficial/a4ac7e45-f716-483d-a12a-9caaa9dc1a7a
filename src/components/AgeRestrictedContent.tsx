
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbApi } from '@/services/tmdb';
import { MovieCard } from '@/components/MovieCard';
import { Baby, Star, Heart } from 'lucide-react';

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
    
    return content.filter(item => {
      // For kids profiles, only show G, PG rated content
      if (profile.is_child) {
        return item.vote_average >= 6.0; // Only well-rated content for kids
      }
      
      // For teen profiles, exclude very mature content
      if (profile.age_restriction <= 16) {
        return item.vote_average >= 5.0;
      }
      
      // Adult profiles can see all content
      return true;
    }).slice(0, 10);
  };

  if (profile.is_child) {
    return (
      <div className="space-y-8">
        {/* Kids Header */}
        <div className="text-center p-6 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-2xl border border-green-400/30">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Baby className="h-8 w-8 text-green-400" />
            <h2 className="text-3xl font-bold text-white">Hey {profile.name}!</h2>
          </div>
          <p className="text-green-300 text-lg">Here are some amazing animations and cartoons just for you!</p>
        </div>

        {/* Animation Movies */}
        {animationMovies?.results && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Star className="h-6 w-6 text-yellow-400" />
              <h3 className="text-2xl font-bold text-white">Animated Adventures</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {filterContentByAge(animationMovies.results).map((movie) => (
                <MovieCard key={movie.id} movie={formatMovieData(movie)} />
              ))}
            </div>
          </div>
        )}

        {/* Family Movies */}
        {familyMovies?.results && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Heart className="h-6 w-6 text-pink-400" />
              <h3 className="text-2xl font-bold text-white">Family Fun</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {filterContentByAge(familyMovies.results).map((movie) => (
                <MovieCard key={movie.id} movie={formatMovieData(movie)} />
              ))}
            </div>
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
