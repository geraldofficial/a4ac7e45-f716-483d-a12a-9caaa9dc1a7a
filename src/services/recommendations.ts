
import { tmdbApi, Movie } from './tmdb';

interface GenreMapping {
  [key: number]: string;
}

const genreNames: GenreMapping = {
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

export const getPersonalizedRecommendations = async (
  genrePreferences: number[],
  page: number = 1
): Promise<{ results: Movie[]; total_pages: number; total_results: number }> => {
  try {
    if (genrePreferences.length === 0) {
      // Fallback to popular movies if no preferences
      return await tmdbApi.getPopularMovies(page);
    }

    // Get movies for each preferred genre and mix them
    const genrePromises = genrePreferences.slice(0, 3).map(genreId =>
      tmdbApi.getMoviesByGenre(genreId, page)
    );

    const genreResults = await Promise.all(genrePromises);
    
    // Combine and shuffle results
    const allMovies: Movie[] = [];
    const maxMoviesPerGenre = 7; // Limit per genre to create variety
    
    genreResults.forEach(result => {
      allMovies.push(...result.results.slice(0, maxMoviesPerGenre));
    });

    // Remove duplicates based on movie ID
    const uniqueMovies = allMovies.filter((movie, index, self) =>
      index === self.findIndex(m => m.id === movie.id)
    );

    // Shuffle the array for variety
    const shuffledMovies = uniqueMovies.sort(() => Math.random() - 0.5);

    return {
      results: shuffledMovies.slice(0, 20), // Return top 20
      total_pages: Math.ceil(shuffledMovies.length / 20),
      total_results: shuffledMovies.length
    };
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    // Fallback to popular movies
    return await tmdbApi.getPopularMovies(page);
  }
};

export const getGenreName = (genreId: number): string => {
  return genreNames[genreId] || 'Unknown';
};

export const getRecommendationTitle = (genrePreferences: number[]): string => {
  if (genrePreferences.length === 0) {
    return 'Popular Movies';
  }
  
  if (genrePreferences.length === 1) {
    return `Because you like ${getGenreName(genrePreferences[0])}`;
  }
  
  if (genrePreferences.length === 2) {
    return `${getGenreName(genrePreferences[0])} & ${getGenreName(genrePreferences[1])} picks`;
  }
  
  return `Personalized for you`;
};
