
const TMDB_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5ZjRlMjI1ZDA3YTUyZGUwNmU1ZTE0ODdmNDU4MzdlMCIsIm5iZiI6MTc0OTU4MzU0OC40ODMsInN1YiI6IjY4NDg4NmJjZDdhZTVmMjkwNzFlYWY4MCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.i9SAf8EuvGQbVnKVxQWWuA2cl6AjShk7F9NhlQaFEZM';
const BASE_URL = 'https://api.themoviedb.org/3';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_API_KEY}`
  }
};

export interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  genres?: { id: number; name: string }[];
  production_companies?: { id: number; name: string; logo_path: string }[];
  videos?: {
    results: Array<{
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }>;
  };
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string;
    }>;
  };
}

export const tmdbApi = {
  // Get popular movies
  getPopularMovies: async (): Promise<Movie[]> => {
    const response = await fetch(`${BASE_URL}/movie/popular`, options);
    const data = await response.json();
    return data.results;
  },

  // Get popular TV shows
  getPopularTVShows: async (): Promise<Movie[]> => {
    const response = await fetch(`${BASE_URL}/tv/popular`, options);
    const data = await response.json();
    return data.results;
  },

  // Get trending content
  getTrending: async (timeWindow: 'day' | 'week' = 'week'): Promise<Movie[]> => {
    const response = await fetch(`${BASE_URL}/trending/all/${timeWindow}`, options);
    const data = await response.json();
    return data.results;
  },

  // Search movies and TV shows
  search: async (query: string): Promise<Movie[]> => {
    const response = await fetch(`${BASE_URL}/search/multi?query=${encodeURIComponent(query)}`, options);
    const data = await response.json();
    return data.results.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv');
  },

  // Real-time search suggestions
  searchSuggestions: async (query: string): Promise<Movie[]> => {
    if (!query.trim()) return [];
    const response = await fetch(`${BASE_URL}/search/multi?query=${encodeURIComponent(query)}&page=1`, options);
    const data = await response.json();
    return data.results
      .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
      .slice(0, 8);
  },

  // Get movie details with additional info
  getMovieDetails: async (movieId: number): Promise<Movie> => {
    const response = await fetch(`${BASE_URL}/movie/${movieId}?append_to_response=videos,credits`, options);
    return response.json();
  },

  // Get TV show details with additional info
  getTVDetails: async (tvId: number): Promise<Movie> => {
    const response = await fetch(`${BASE_URL}/tv/${tvId}?append_to_response=videos,credits`, options);
    return response.json();
  },

  // Get genres
  getMovieGenres: async () => {
    const response = await fetch(`${BASE_URL}/genre/movie/list`, options);
    const data = await response.json();
    return data.genres;
  },

  getTVGenres: async () => {
    const response = await fetch(`${BASE_URL}/genre/tv/list`, options);
    const data = await response.json();
    return data.genres;
  }
};
