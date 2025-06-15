
const READ_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5ZjRlMjI1ZDA3YTUyZGUwNmU1ZTE0ODdmNDU4MzdlMCIsIm5iZiI6MTc0OTU4MzU0OC40ODMsInN1YiI6IjY4NDg4NmJjZDdhZTVmMjkwNzFlYWY4MCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.i9SAf8EuvGQbVnKVxQWWuA2cl6AjShk7F9NhlQaFEZM';
const BASE_URL = 'https://api.themoviedb.org/3';

const headers = {
  'Authorization': `Bearer ${READ_ACCESS_TOKEN}`,
  'Content-Type': 'application/json;charset=utf-8'
};

export interface Movie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number;
  adult?: boolean;
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string;
    }>;
  };
  seasons?: Array<{
    id: number;
    name: string;
    season_number: number;
    episode_count: number;
  }>;
  episodes?: Array<{
    id: number;
    name: string;
    episode_number: number;
    air_date: string;
    overview: string;
  }>;
}

export const tmdbApi = {
  getTrending: async () => {
    const response = await fetch(`${BASE_URL}/trending/all/day`, { headers });
    const data = await response.json();
    return data.results;
  },

  getTrendingMovies: async (page: number = 1) => {
    const response = await fetch(`${BASE_URL}/trending/movie/day?page=${page}`, { headers });
    return await response.json();
  },

  getPopularMovies: async (page: number = 1) => {
    const response = await fetch(`${BASE_URL}/movie/popular?page=${page}`, { headers });
    return await response.json();
  },

  getPopularTVShows: async () => {
    const response = await fetch(`${BASE_URL}/tv/popular`, { headers });
    const data = await response.json();
    return data.results;
  },

  getTopRatedMovies: async () => {
    const response = await fetch(`${BASE_URL}/movie/top_rated`, { headers });
    return await response.json();
  },

  getUpcomingMovies: async () => {
    const response = await fetch(`${BASE_URL}/movie/upcoming`, { headers });
    return await response.json();
  },

  getMoviesByGenre: async (genreId: number, page: number = 1) => {
    const response = await fetch(`${BASE_URL}/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&page=${page}&certification_country=US&certification.lte=PG-13`, { headers });
    return await response.json();
  },

  getTVShowsByGenre: async (genreId: number) => {
    const response = await fetch(`${BASE_URL}/discover/tv?with_genres=${genreId}&sort_by=popularity.desc`, { headers });
    return await response.json();
  },

  searchMovies: async (query: string) => {
    const response = await fetch(`${BASE_URL}/search/movie?query=${encodeURIComponent(query)}`, { headers });
    return await response.json();
  },

  searchTVShows: async (query: string) => {
    const response = await fetch(`${BASE_URL}/search/tv?query=${encodeURIComponent(query)}`, { headers });
    return await response.json();
  },

  searchMulti: async (query: string, page: number = 1) => {
    const response = await fetch(`${BASE_URL}/search/multi?query=${encodeURIComponent(query)}&page=${page}`, { headers });
    return await response.json();
  },

  searchSuggestions: async (query: string) => {
    const response = await fetch(`${BASE_URL}/search/multi?query=${encodeURIComponent(query)}`, { headers });
    const data = await response.json();
    return data.results.slice(0, 8);
  },

  discover: async (params: any) => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${BASE_URL}/discover/movie?${queryParams}`, { headers });
    return await response.json();
  },

  getMovieDetails: async (id: number | string) => {
    const response = await fetch(`${BASE_URL}/movie/${id}?append_to_response=credits,videos,similar`, { headers });
    return await response.json();
  },

  getTVShowDetails: async (id: number | string) => {
    const response = await fetch(`${BASE_URL}/tv/${id}?append_to_response=credits,videos,similar`, { headers });
    return await response.json();
  },

  getTVDetails: async (id: number | string) => {
    const response = await fetch(`${BASE_URL}/tv/${id}?append_to_response=credits,videos,similar`, { headers });
    return await response.json();
  },

  getTVSeasonDetails: async (id: number | string, seasonNumber: number) => {
    const response = await fetch(`${BASE_URL}/tv/${id}/season/${seasonNumber}`, { headers });
    return await response.json();
  },

  getGenres: async () => {
    const [movieGenres, tvGenres] = await Promise.all([
      fetch(`${BASE_URL}/genre/movie/list`, { headers }).then(res => res.json()),
      fetch(`${BASE_URL}/genre/tv/list`, { headers }).then(res => res.json())
    ]);
    
    return {
      movie: movieGenres.genres,
      tv: tvGenres.genres
    };
  }
};
