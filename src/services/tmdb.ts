
const TMDB_API_KEY = '8c0d5c4c8f7e4c4a9c8c8c8c8c8c8c8c'; // Public demo key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface Movie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids?: number[];
  genres?: Genre[];
  runtime?: number;
  number_of_seasons?: number;
  media_type?: 'movie' | 'tv';
  credits?: {
    cast: Actor[];
  };
}

export interface Genre {
  id: number;
  name: string;
}

export interface Actor {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
}

class TMDBApi {
  private apiKey = TMDB_API_KEY;
  private baseUrl = TMDB_BASE_URL;

  private async fetchFromTMDB(endpoint: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}?api_key=${this.apiKey}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('TMDB API error:', error);
      return { results: [] };
    }
  }

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'day'): Promise<Movie[]> {
    const data = await this.fetchFromTMDB(`/trending/movie/${timeWindow}`);
    return data.results || [];
  }

  async getPopularMovies(page: number = 1): Promise<Movie[]> {
    const data = await this.fetchFromTMDB(`/movie/popular?page=${page}`);
    return data.results || [];
  }

  async getPopularTVShows(): Promise<Movie[]> {
    const data = await this.fetchFromTMDB('/tv/popular');
    return data.results || [];
  }

  async getTrending(): Promise<Movie[]> {
    const data = await this.fetchFromTMDB('/trending/all/day');
    return data.results || [];
  }

  async getMovieDetails(id: number): Promise<Movie> {
    const data = await this.fetchFromTMDB(`/movie/${id}?append_to_response=credits`);
    return data;
  }

  async getTVDetails(id: number): Promise<Movie> {
    const data = await this.fetchFromTMDB(`/tv/${id}?append_to_response=credits`);
    return data;
  }

  async getTVSeasonDetails(id: number, season: number): Promise<any> {
    const data = await this.fetchFromTMDB(`/tv/${id}/season/${season}`);
    return data;
  }

  async searchMulti(query: string): Promise<Movie[]> {
    const data = await this.fetchFromTMDB(`/search/multi?query=${encodeURIComponent(query)}`);
    return data.results || [];
  }
}

export const tmdbApi = new TMDBApi();
