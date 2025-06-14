
import axios from 'axios';

const API_KEY = '9f4e225d07a52de06e5e1487f45837e0';
const BASE_URL = 'https://api.themoviedb.org/3';

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

export interface Movie {
  id: number;
  title?: string;
  name?: string; // For TV shows
  poster_path: string;
  overview: string;
  release_date?: string;
  first_air_date?: string; // For TV shows
  vote_average: number;
  vote_count: number; // Added missing vote_count property
  backdrop_path?: string;
  runtime?: number;
  number_of_seasons?: number; // For TV shows
  media_type?: 'movie' | 'tv' | 'person';
  genres?: Array<{ id: number; name: string }>;
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
  };
}

export interface TVShow {
  id: number;
  name: string;
  poster_path: string;
  overview: string;
  first_air_date: string;
  vote_average: number;
  backdrop_path?: string;
  number_of_seasons?: number;
  genres?: Array<{ id: number; name: string }>;
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
  };
}

export interface Person {
  id: number;
  name: string;
  profile_path: string;
  known_for_department: string;
}

export const tmdbApi = {
  async getMovies(category: 'popular' | 'top_rated' | 'now_playing' | 'upcoming', page: number = 1) {
    const response = await api.get(`/movie/${category}`, { params: { page } });
    return response.data;
  },

  async getTVShows(category: 'popular' | 'top_rated' | 'on_the_air', page: number = 1) {
    const response = await api.get(`/tv/${category}`, { params: { page } });
    return response.data;
  },

  async getPeople(category: 'popular', page: number = 1) {
    const response = await api.get(`/person/${category}`, { params: { page } });
    return response.data.results as Person[];
  },

  async getMovieDetails(id: number) {
    const response = await api.get(`/movie/${id}`, {
      params: { append_to_response: 'credits' }
    });
    return response.data;
  },

  async getTVShowDetails(id: number) {
    const response = await api.get(`/tv/${id}`, {
      params: { append_to_response: 'credits' }
    });
    return response.data;
  },

  // Alias for backward compatibility
  async getTVDetails(id: number) {
    return this.getTVShowDetails(id);
  },

  async getTVSeasonDetails(tvId: number, seasonNumber: number) {
    const response = await api.get(`/tv/${tvId}/season/${seasonNumber}`);
    return response.data;
  },

  async getMovieCredits(id: number) {
    const response = await api.get(`/movie/${id}/credits`);
    return response.data;
  },

  async getTVShowCredits(id: number) {
    const response = await api.get(`/tv/${id}/credits`);
    return response.data;
  },

  async searchMulti(query: string, page: number = 1) {
    const response = await api.get('/search/multi', {
      params: { query, page }
    });
    return response.data.results;
  },

  async getTrending(mediaType: 'movie' | 'tv' | 'person' = 'movie', timeWindow: 'day' | 'week' = 'day') {
    const response = await api.get(`/trending/${mediaType}/${timeWindow}`);
    return response.data.results;
  },

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'day') {
    return this.getTrending('movie', timeWindow);
  },

  async discoverMovies(genres: string = '', sortBy: string = 'popularity.desc', page: number = 1) {
    const response = await api.get('/discover/movie', {
      params: {
        with_genres: genres,
        sort_by: sortBy,
        page
      }
    });
    return response.data.results;
  },

  async discoverTVShows(genres: string = '', sortBy: string = 'popularity.desc', page: number = 1) {
    const response = await api.get('/discover/tv', {
      params: {
        with_genres: genres,
        sort_by: sortBy,
        page
      }
    });
    return response.data.results;
  },

  async getPopularMovies(page: number = 1) {
    const response = await this.getMovies('popular', page);
    return response.results;
  },

  async getPopularTVShows(page: number = 1) {
    const response = await this.getTVShows('popular', page);
    return response.results;
  },

  async getMoviesByGenre(genreId: number, page: number = 1) {
    return this.discoverMovies(genreId.toString(), 'popularity.desc', page);
  },
};
