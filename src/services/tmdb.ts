import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
}

interface TVShow {
  id: number;
  name: string;
  poster_path: string;
  overview: string;
  first_air_date: string;
  vote_average: number;
}

interface Person {
  id: number;
  name: string;
  profile_path: string;
  known_for_department: string;
}

export const tmdbApi = {
  async getMovies(category: 'popular' | 'top_rated' | 'now_playing' | 'upcoming', page: number = 1) {
    const response = await api.get(`/movie/${category}`, { params: { page } });
    return response.data.results as Movie[];
  },

  async getTVShows(category: 'popular' | 'top_rated' | 'on_the_air', page: number = 1) {
    const response = await api.get(`/tv/${category}`, { params: { page } });
    return response.data.results as TVShow[];
  },

  async getPeople(category: 'popular', page: number = 1) {
    const response = await api.get(`/person/${category}`, { params: { page } });
    return response.data.results as Person[];
  },

  async getMovieDetails(id: number) {
    const response = await api.get(`/movie/${id}`);
    return response.data;
  },

  async getTVShowDetails(id: number) {
    const response = await api.get(`/tv/${id}`);
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

  async searchMulti(query: string) {
    const response = await api.get('/search/multi', {
      params: { query, page: 1 }
    });
    return response.data.results;
  },

  async getTrending(mediaType: 'movie' | 'tv' | 'person' = 'movie', timeWindow: 'day' | 'week' = 'day') {
    const response = await api.get(`/trending/${mediaType}/${timeWindow}`);
    return response.data.results;
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
};
