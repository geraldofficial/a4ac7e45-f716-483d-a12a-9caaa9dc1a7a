const DEFAULT_READ_ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5ZjRlMjI1ZDA3YTUyZGUwNmU1ZTE0ODdmNDU4MzdlMCIsIm5iZiI6MTc0OTU4MzU0OC40ODMsInN1YiI6IjY4NDg4NmJjZDdhZTVmMjkwNzFlYWY4MCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.i9SAf8EuvGQbVnKVxQWWuA2cl6AjShk7F9NhlQaFEZM";
const BASE_URL = "https://api.themoviedb.org/3";

// Function to get current API key (from admin settings or default)
const getApiKey = () => {
  try {
    return localStorage.getItem("tmdb_api_key") || DEFAULT_READ_ACCESS_TOKEN;
  } catch {
    return DEFAULT_READ_ACCESS_TOKEN;
  }
};

// Function to get headers with current API key
const getHeaders = () => ({
  Authorization: `Bearer ${getApiKey()}`,
  "Content-Type": "application/json;charset=utf-8",
});

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
  videos?: {
    results: Array<{
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
      official: boolean;
    }>;
  };
}

export const tmdbApi = {
  getTrending: async () => {
    const response = await fetch(`${BASE_URL}/trending/all/day`, { headers });
    const data = await response.json();
    return data.results;
  },

  getTrendingMovies: async (page: number = 1) => {
    const response = await fetch(
      `${BASE_URL}/trending/movie/day?page=${page}`,
      { headers: getHeaders() },
    );
    if (!response.ok) {
      throw new Error(
        `TMDB API Error: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  },

  getPopularMovies: async (page: number = 1) => {
    const response = await fetch(`${BASE_URL}/movie/popular?page=${page}`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(
        `TMDB API Error: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  },

  getPopularTVShows: async () => {
    const response = await fetch(`${BASE_URL}/tv/popular`, { headers });
    const data = await response.json();
    return data.results;
  },

  getTopRatedMovies: async () => {
    const response = await fetch(`${BASE_URL}/movie/top_rated`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(
        `TMDB API Error: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  },

  getNowPlayingMovies: async () => {
    const response = await fetch(`${BASE_URL}/movie/now_playing`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(
        `TMDB API Error: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  },

  getUpcomingMovies: async () => {
    const response = await fetch(`${BASE_URL}/movie/upcoming`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(
        `TMDB API Error: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  },

  getTopRatedTVShows: async () => {
    const response = await fetch(`${BASE_URL}/tv/top_rated`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(
        `TMDB API Error: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  },

  getOnTheAirTVShows: async () => {
    const response = await fetch(`${BASE_URL}/tv/on_the_air`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(
        `TMDB API Error: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  },

  getAiringTodayTVShows: async () => {
    const response = await fetch(`${BASE_URL}/tv/airing_today`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(
        `TMDB API Error: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  },

  getMoviesByGenre: async (genreId: number, page: number = 1) => {
    const response = await fetch(
      `${BASE_URL}/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&page=${page}&certification_country=US&certification.lte=PG-13`,
      { headers: getHeaders() },
    );
    if (!response.ok) {
      throw new Error(
        `TMDB API Error: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  },

  getTVShows: async () => {
    const response = await fetch(`${BASE_URL}/tv/popular`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(
        `TMDB API Error: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  },

  searchMovies: async (query: string) => {
    const response = await fetch(
      `${BASE_URL}/search/movie?query=${encodeURIComponent(query)}`,
      { headers: getHeaders() },
    );
    if (!response.ok) {
      throw new Error(
        `TMDB API Error: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  },

  searchTVShows: async (query: string) => {
    const response = await fetch(
      `${BASE_URL}/search/tv?query=${encodeURIComponent(query)}`,
      { headers: getHeaders() },
    );
    if (!response.ok) {
      throw new Error(
        `TMDB API Error: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  },

  searchMulti: async (query: string) => {
    const response = await fetch(
      `${BASE_URL}/search/multi?query=${encodeURIComponent(query)}`,
      { headers: getHeaders() },
    );
    if (!response.ok) {
      throw new Error(
        `TMDB API Error: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  },

  discoverMovies: async (params: Record<string, string | number>) => {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`${BASE_URL}/discover/movie?${queryParams}`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(
        `TMDB API Error: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  },

  getMovieDetails: async (id: number | string) => {
    const response = await fetch(
      `${BASE_URL}/movie/${id}?append_to_response=credits,videos,similar`,
      { headers: getHeaders() },
    );
    if (!response.ok) {
      throw new Error(
        `TMDB API Error: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  },

  getTVShowDetails: async (id: number | string) => {
    const response = await fetch(
      `${BASE_URL}/tv/${id}?append_to_response=credits,videos,similar`,
      { headers: getHeaders() },
    );
    if (!response.ok) {
      throw new Error(
        `TMDB API Error: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  },

  getTVDetails: async (id: number | string) => {
    const response = await fetch(
      `${BASE_URL}/tv/${id}?append_to_response=credits,videos,similar`,
      { headers: getHeaders() },
    );
    if (!response.ok) {
      throw new Error(
        `TMDB API Error: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  },

  getTVDetails: async (id: number | string) => {
    const response = await fetch(
      `${BASE_URL}/tv/${id}?append_to_response=credits,videos,similar`,
      { headers: getHeaders() },
    );
    if (!response.ok) {
      throw new Error(
        `TMDB API Error: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  },

  getTVSeasonDetails: async (id: number | string, seasonNumber: number) => {
    const response = await fetch(
      `${BASE_URL}/tv/${id}/season/${seasonNumber}`,
      { headers: getHeaders() },
    );
    if (!response.ok) {
      throw new Error(
        `TMDB API Error: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  },

  getGenres: async () => {
    const headers = getHeaders();
    const [movieGenres, tvGenres] = await Promise.all([
      fetch(`${BASE_URL}/genre/movie/list`, { headers }).then(async (res) => {
        if (!res.ok) {
          throw new Error(`TMDB API Error: ${res.status} ${res.statusText}`);
        }
        return res.json();
      }),
      fetch(`${BASE_URL}/genre/tv/list`, { headers }).then(async (res) => {
        if (!res.ok) {
          throw new Error(`TMDB API Error: ${res.status} ${res.statusText}`);
        }
        return res.json();
      }),
    ]);

    return {
      movie: movieGenres.genres,
      tv: tvGenres.genres,
    };
  },
};
