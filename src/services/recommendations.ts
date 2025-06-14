
import { tmdbApi, Movie } from './tmdb';

export const getPersonalizedRecommendations = async (
  genrePreferences: number[],
  page: number = 1
): Promise<{ results: Movie[]; total_pages: number }> => {
  try {
    // Fetch popular movies and filter by genres if preferences exist
    const movies = await tmdbApi.getPopularMovies(page);
    
    if (genrePreferences.length === 0) {
      return { results: movies, total_pages: 10 };
    }
    
    const filtered = movies.filter(movie => 
      movie.genre_ids?.some(id => genrePreferences.includes(id))
    );
    
    return { results: filtered, total_pages: 10 };
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return { results: [], total_pages: 1 };
  }
};

export const getRecommendationTitle = (genrePreferences: number[]): string => {
  if (genrePreferences.length === 0) return 'Recommended for You';
  return 'Based on Your Preferences';
};
