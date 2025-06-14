
import { tmdbApi } from './tmdb';

// Genre mapping for recommendations
const genreNames: { [key: number]: string } = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western'
};

export const getPersonalizedRecommendations = async (genrePreferences: number[], page: number = 1) => {
  try {
    // Convert genre preferences to comma-separated string
    const genreIds = genrePreferences.join(',');
    
    // Get movies based on preferred genres
    const movies = await tmdbApi.discoverMovies(genreIds, 'popularity.desc', page);
    
    return {
      results: movies,
      total_pages: 20, // Reasonable default
      page
    };
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    // Fallback to popular movies
    const fallback = await tmdbApi.getPopularMovies(page);
    return {
      results: fallback,
      total_pages: 20,
      page
    };
  }
};

export const getRecommendationTitle = (genrePreferences: number[]): string => {
  if (!genrePreferences || genrePreferences.length === 0) {
    return 'Recommended for You';
  }
  
  const primaryGenre = genreNames[genrePreferences[0]];
  const secondaryGenre = genrePreferences.length > 1 ? genreNames[genrePreferences[1]] : null;
  
  if (secondaryGenre) {
    return `${primaryGenre} & ${secondaryGenre} Picks`;
  } else if (primaryGenre) {
    return `${primaryGenre} Recommendations`;
  }
  
  return 'Recommended for You';
};
