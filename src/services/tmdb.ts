
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
  seasons?: Season[];
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

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  episodes?: Episode[];
}

export interface Episode {
  id: number;
  name: string;
  episode_number: number;
  air_date: string;
  overview: string;
}

export interface SearchResult {
  results: Movie[];
  total_pages: number;
  total_results: number;
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
      return { results: [], total_pages: 1, total_results: 0 };
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

  async getMovies(category: string, page: number = 1): Promise<Movie[]> {
    const data = await this.fetchFromTMDB(`/movie/${category}?page=${page}`);
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

  async getTVSeasonDetails(id: number, season: number): Promise<Season> {
    const data = await this.fetchFromTMDB(`/tv/${id}/season/${season}`);
    return data;
  }

  async searchMulti(query: string, page: number = 1): Promise<SearchResult> {
    const data = await this.fetchFromTMDB(`/search/multi?query=${encodeURIComponent(query)}&page=${page}`);
    return {
      results: data.results || [],
      total_pages: data.total_pages || 1,
      total_results: data.total_results || 0
    };
  }
}

export const tmdbApi = new TMDBApi();
