
const API_KEY = '8265bd1679663a7ea12ac168da84d2e8';
const BASE_URL = 'https://api.themoviedb.org/3';

export interface Movie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids?: number[];
  popularity?: number;
  media_type?: 'movie' | 'tv';
  runtime?: number;
  number_of_seasons?: number;
  genres?: { id: number; name: string; }[];
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string;
    }[];
  };
  seasons?: {
    id: number;
    name: string;
    season_number: number;
    episode_count: number;
  }[];
}

export interface TVSeasonDetails {
  id: number;
  name: string;
  season_number: number;
  episodes: {
    id: number;
    name: string;
    episode_number: number;
    air_date: string;
    overview: string;
  }[];
}

export interface SearchResults {
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

class TMDBApi {
  private async fetchFromTMDB(endpoint: string) {
    const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${API_KEY}`;
    console.log('Fetching from TMDB:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('TMDB response:', data);
    return data;
  }

  async getPopularMovies(): Promise<Movie[]> {
    const data = await this.fetchFromTMDB('/movie/popular');
    return data.results;
  }

  async getPopularTVShows(): Promise<Movie[]> {
    const data = await this.fetchFromTMDB('/tv/popular');
    return data.results;
  }

  async getTrending(): Promise<Movie[]> {
    const data = await this.fetchFromTMDB('/trending/all/week');
    return data.results;
  }

  async searchMulti(query: string, page: number = 1): Promise<SearchResults> {
    const data = await this.fetchFromTMDB(`/search/multi?query=${encodeURIComponent(query)}&page=${page}`);
    return {
      results: data.results.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv'),
      total_pages: data.total_pages,
      total_results: data.total_results
    };
  }

  async search(query: string): Promise<Movie[]> {
    const data = await this.searchMulti(query);
    return data.results;
  }

  async searchSuggestions(query: string): Promise<Movie[]> {
    const data = await this.searchMulti(query, 1);
    return data.results.slice(0, 8); // Limit to 8 suggestions
  }

  async getMovieDetails(id: number): Promise<Movie> {
    const data = await this.fetchFromTMDB(`/movie/${id}?append_to_response=credits`);
    return data;
  }

  async getTVDetails(id: number): Promise<Movie> {
    const data = await this.fetchFromTMDB(`/tv/${id}?append_to_response=credits`);
    return data;
  }

  async getTVSeasonDetails(tvId: number, seasonNumber: number): Promise<TVSeasonDetails> {
    const data = await this.fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}`);
    return data;
  }

  async getMovieGenres(): Promise<Genre[]> {
    const data = await this.fetchFromTMDB('/genre/movie/list');
    return data.genres;
  }

  async getTVGenres(): Promise<Genre[]> {
    const data = await this.fetchFromTMDB('/genre/tv/list');
    return data.genres;
  }

  async discoverContent(params: {
    type: 'movie' | 'tv';
    genre?: number;
    year?: number;
    sortBy?: string;
    page?: number;
  }): Promise<SearchResults> {
    const { type, genre, year, sortBy = 'popularity.desc', page = 1 } = params;
    
    let endpoint = `/${type === 'movie' ? 'discover/movie' : 'discover/tv'}?page=${page}&sort_by=${sortBy}`;
    
    if (genre) {
      endpoint += `&with_genres=${genre}`;
    }
    
    if (year) {
      if (type === 'movie') {
        endpoint += `&year=${year}`;
      } else {
        endpoint += `&first_air_date_year=${year}`;
      }
    }
    
    const data = await this.fetchFromTMDB(endpoint);
    return {
      results: data.results,
      total_pages: data.total_pages,
      total_results: data.total_results
    };
  }
}

export const tmdbApi = new TMDBApi();
