import React from 'react';
import { TrendingUp, Heart, Clock, Star, Users, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { MovieCard } from '@/components/MovieCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { tmdbApi } from '@/services/tmdb';
import { AgeRestrictedContent } from '@/components/AgeRestrictedContent';

interface ContentRecommendationsProps {
  userId?: string;
  profileId?: string;
  profile?: {
    id: string;
    name: string;
    is_child: boolean;
    age_restriction: number;
  };
  className?: string;
}

interface RecommendationSection {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  items: any[];
}

export const ContentRecommendations: React.FC<ContentRecommendationsProps> = ({
  userId,
  profileId,
  profile,
  className = ''
}) => {
  // If we have a profile, show age-restricted content
  if (profile) {
    return (
      <div className={`space-y-8 ${className}`}>
        <AgeRestrictedContent profile={profile} />
      </div>
    );
  }

  // Default content when no profile is selected
  // Get trending content with error handling
  const { data: trending, error: trendingError, refetch: refetchTrending } = useQuery({
    queryKey: ['trending-all'],
    queryFn: () => tmdbApi.getTrending(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1
  });

  // Get popular movies with error handling
  const { data: popularMovies, error: popularMoviesError, refetch: refetchPopularMovies } = useQuery({
    queryKey: ['popular-movies'],
    queryFn: () => tmdbApi.getPopularMovies(),
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1
  });

  // Get popular TV shows with error handling
  const { data: popularTV, error: popularTVError, refetch: refetchPopularTV } = useQuery({
    queryKey: ['popular-tv'],
    queryFn: () => tmdbApi.getPopularTVShows(),
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1
  });

  // Check if we have any errors
  const hasErrors = trendingError || popularMoviesError || popularTVError;

  if (hasErrors) {
    return (
      <div className={`space-y-8 ${className}`}>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Unable to Load Content</h2>
          <p className="text-muted-foreground mb-6">
            We're having trouble connecting to our content database. This might be due to API configuration issues.
          </p>
          <div className="space-x-4">
            <Button 
              onClick={() => {
                refetchTrending();
                refetchPopularMovies();
                refetchPopularTV();
              }}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Get top rated content
  const { data: topRated } = useQuery({
    queryKey: ['top-rated-movies'],
    queryFn: () => tmdbApi.getTopRatedMovies(),
    staleTime: 1000 * 60 * 60 * 2 // 2 hours
  });

  // Get upcoming movies
  const { data: upcoming } = useQuery({
    queryKey: ['upcoming-movies'],
    queryFn: () => tmdbApi.getUpcomingMovies(),
    staleTime: 1000 * 60 * 60 * 6 // 6 hours
  });

  // Get genre-based recommendations (Action, Comedy, Drama)
  const { data: actionMovies } = useQuery({
    queryKey: ['genre-action'],
    queryFn: () => tmdbApi.getMoviesByGenre(28), // Action genre ID
    staleTime: 1000 * 60 * 60 * 2
  });

  const { data: comedyMovies } = useQuery({
    queryKey: ['genre-comedy'],
    queryFn: () => tmdbApi.getMoviesByGenre(35), // Comedy genre ID
    staleTime: 1000 * 60 * 60 * 2
  });

  const { data: dramaMovies } = useQuery({
    queryKey: ['genre-drama'],
    queryFn: () => tmdbApi.getMoviesByGenre(18), // Drama genre ID
    staleTime: 1000 * 60 * 60 * 2
  });

  const recommendationSections: RecommendationSection[] = [
    {
      title: "Trending Now",
      description: "What everyone's watching today",
      icon: <TrendingUp className="h-5 w-5" />,
      badge: "Hot",
      items: trending?.slice(0, 10) || []
    },
    {
      title: "Popular Movies",
      description: "Most popular movies right now",
      icon: <Star className="h-5 w-5" />,
      items: popularMovies?.results?.slice(0, 10) || []
    },
    {
      title: "Popular TV Shows",
      description: "Binge-worthy series everyone loves",
      icon: <Users className="h-5 w-5" />,
      items: popularTV?.slice(0, 10) || []
    },
    {
      title: "Top Rated",
      description: "Critically acclaimed masterpieces",
      icon: <Heart className="h-5 w-5" />,
      badge: "Critics' Choice",
      items: topRated?.results?.slice(0, 10) || []
    },
    {
      title: "Coming Soon",
      description: "Upcoming releases to look forward to",
      icon: <Clock className="h-5 w-5" />,
      badge: "New",
      items: upcoming?.results?.slice(0, 10) || []
    },
    {
      title: "Action & Adventure",
      description: "High-octane thrills and excitement",
      icon: <Zap className="h-5 w-5" />,
      items: actionMovies?.results?.slice(0, 10) || []
    },
    {
      title: "Comedy",
      description: "Laugh-out-loud entertainment",
      icon: <Heart className="h-5 w-5" />,
      items: comedyMovies?.results?.slice(0, 10) || []
    },
    {
      title: "Drama",
      description: "Compelling stories and characters",
      icon: <Star className="h-5 w-5" />,
      items: dramaMovies?.results?.slice(0, 10) || []
    }
  ];

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

  if (!trending && !popularMovies && !popularTV) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Discover Amazing Content</h2>
        <p className="text-muted-foreground">Personalized recommendations just for you</p>
      </div>

      {recommendationSections.map((section, index) => {
        if (section.items.length === 0) return null;

        return (
          <div key={index} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {section.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-foreground">{section.title}</h3>
                    {section.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {section.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>

            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {section.items.map((item, itemIndex) => (
                  <div key={`${section.title}-${item.id}-${itemIndex}`} className="flex-shrink-0">
                    <MovieCard
                      movie={formatMovieData(item)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* Personalized Section (if user data available) */}
      {userId && (
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-6 border border-purple-200/20">
          <div className="text-center">
            <Heart className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="text-xl font-semibold mb-2">More Personalized Recommendations Coming Soon!</h3>
            <p className="text-muted-foreground mb-4">
              We're analyzing your viewing preferences to provide even better recommendations.
            </p>
            <Badge variant="outline" className="bg-primary/5">
              <Zap className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
};
