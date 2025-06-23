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

const makeRequest = async (url: string, options = {}) => {
  try {
    const response = await fetch(url, { headers: getHeaders(), ...options });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("TMDB API Error:", error);
    throw error;
  }
};

export const tmdbApi = {
  getTrending: async () => {
    try {
      const data = await makeRequest(`${BASE_URL}/trending/all/day`);
      return data.results || [];
    } catch (error) {
      console.error("Error fetching trending:", error);
      return [];
    }
  },

  getTrendingMovies: async (page: number = 1) => {
    try {
      return await makeRequest(`${BASE_URL}/trending/movie/day?page=${page}`);
    } catch (error) {
      console.error("Error fetching trending movies:", error);
      return { results: [], total_pages: 0, page: 1, total_results: 0 };
    }
  },

  getPopularMovies: async (page: number = 1) => {
    try {
      return await makeRequest(`${BASE_URL}/movie/popular?page=${page}`);
    } catch (error) {
      console.error("Error fetching popular movies:", error);
      return { results: [], total_pages: 0, page: 1, total_results: 0 };
    }
  },

  getPopularTVShows: async () => {
    try {
      const data = await makeRequest(`${BASE_URL}/tv/popular`);
      return data.results || [];
    } catch (error) {
      console.error("Error fetching popular TV shows:", error);
      return [];
    }
  },

  getTopRatedMovies: async () => {
    try {
      return await makeRequest(`${BASE_URL}/movie/top_rated`);
    } catch (error) {
      console.error("Error fetching top rated movies:", error);
      return { results: [] };
    }
  },

  getNowPlayingMovies: async () => {
    try {
      return await makeRequest(`${BASE_URL}/movie/now_playing`);
    } catch (error) {
      console.error("Error fetching now playing movies:", error);
      return { results: [] };
    }
  },

  getUpcomingMovies: async () => {
    try {
      return await makeRequest(`${BASE_URL}/movie/upcoming`);
    } catch (error) {
      console.error("Error fetching upcoming movies:", error);
      return { results: [] };
    }
  },

  getTopRatedTVShows: async () => {
    try {
      return await makeRequest(`${BASE_URL}/tv/top_rated`);
    } catch (error) {
      console.error("Error fetching top rated TV shows:", error);
      return { results: [] };
    }
  },

  getOnTheAirTVShows: async () => {
    try {
      return await makeRequest(`${BASE_URL}/tv/on_the_air`);
    } catch (error) {
      console.error("Error fetching on the air TV shows:", error);
      return { results: [] };
    }
  },

  getAiringTodayTVShows: async () => {
    try {
      return await makeRequest(`${BASE_URL}/tv/airing_today`);
    } catch (error) {
      console.error("Error fetching airing today TV shows:", error);
      return { results: [] };
    }
  },

  getMoviesByGenre: async (genreId: number, page: number = 1) => {
    try {
      return await makeRequest(
        `${BASE_URL}/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&page=${page}&certification_country=US&certification.lte=PG-13`,
      );
    } catch (error) {
      console.error("Error fetching movies by genre:", error);
      return { results: [], total_pages: 0, page: 1, total_results: 0 };
    }
  },

  getTVShowsByGenre: async (genreId: number) => {
    try {
      return await makeRequest(
        `${BASE_URL}/discover/tv?with_genres=${genreId}&sort_by=popularity.desc`,
      );
    } catch (error) {
      console.error("Error fetching TV shows by genre:", error);
      return { results: [] };
    }
  },

  getTVShows: async () => {
    try {
      return await makeRequest(`${BASE_URL}/tv/popular`);
    } catch (error) {
      console.error("Error fetching TV shows:", error);
      return { results: [] };
    }
  },

  searchMovies: async (query: string, page: number = 1) => {
    try {
      if (!query || query.trim().length === 0) {
        return { results: [], total_pages: 0, page: 1, total_results: 0 };
      }
      return await makeRequest(
        `${BASE_URL}/search/movie?query=${encodeURIComponent(query.trim())}&page=${page}`,
      );
    } catch (error) {
      console.error("Error searching movies:", error);
      return { results: [], total_pages: 0, page: 1, total_results: 0 };
    }
  },

  searchTVShows: async (query: string, page: number = 1) => {
    try {
      if (!query || query.trim().length === 0) {
        return { results: [], total_pages: 0, page: 1, total_results: 0 };
      }
      return await makeRequest(
        `${BASE_URL}/search/tv?query=${encodeURIComponent(query.trim())}&page=${page}`,
      );
    } catch (error) {
      console.error("Error searching TV shows:", error);
      return { results: [], total_pages: 0, page: 1, total_results: 0 };
    }
  },

  searchMulti: async (query: string, page: number = 1) => {
    try {
      if (!query || query.trim().length === 0) {
        return { results: [], total_pages: 0, page: 1, total_results: 0 };
      }

      const data = await makeRequest(
        `${BASE_URL}/search/multi?query=${encodeURIComponent(query.trim())}&page=${page}`,
      );

      // Filter out person results and format movie/tv data
      const filteredResults = (data.results || [])
        .filter(
          (item: any) =>
            item.media_type === "movie" || item.media_type === "tv",
        )
        .map((item: any) => ({
          ...item,
          title: item.title || item.name,
          media_type: item.media_type || (item.title ? "movie" : "tv"),
        }));

      return {
        ...data,
        results: filteredResults,
      };
    } catch (error) {
      console.error("Error in multi search:", error);
      return { results: [], total_pages: 0, page: 1, total_results: 0 };
    }
  },

  searchSuggestions: async (query: string) => {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }

      const data = await makeRequest(
        `${BASE_URL}/search/multi?query=${encodeURIComponent(query.trim())}`,
      );
      return (data.results || [])
        .filter(
          (item: any) =>
            item.media_type === "movie" || item.media_type === "tv",
        )
        .slice(0, 8);
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
      return [];
    }
  },

  discover: async (params: any) => {
    try {
      const queryParams = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(
            ([_, value]) => value !== null && value !== undefined,
          ),
        ),
      );
      return await makeRequest(`${BASE_URL}/discover/movie?${queryParams}`);
    } catch (error) {
      console.error("Error in discover:", error);
      return { results: [], total_pages: 0, page: 1, total_results: 0 };
    }
  },

  discoverMovies: async (params: Record<string, string | number>) => {
    try {
      const queryParams = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params).filter(
            ([_, value]) => value !== null && value !== undefined,
          ),
        ),
      );
      return await makeRequest(`${BASE_URL}/discover/movie?${queryParams}`);
    } catch (error) {
      console.error("Error in discover movies:", error);
      return { results: [], total_pages: 0, page: 1, total_results: 0 };
    }
  },

  getMovieDetails: async (id: number | string) => {
    try {
      return await makeRequest(
        `${BASE_URL}/movie/${id}?append_to_response=credits,videos,similar`,
      );
    } catch (error) {
      console.error("Error fetching movie details:", error);
      throw error;
    }
  },

  getTVShowDetails: async (id: number | string) => {
    try {
      return await makeRequest(
        `${BASE_URL}/tv/${id}?append_to_response=credits,videos,similar`,
      );
    } catch (error) {
      console.error("Error fetching TV show details:", error);
      throw error;
    }
  },

  getTVDetails: async (id: number | string) => {
    try {
      return await makeRequest(
        `${BASE_URL}/tv/${id}?append_to_response=credits,videos,similar`,
      );
    } catch (error) {
      console.error("Error fetching TV details:", error);
      throw error;
    }
  },

  getTVSeasonDetails: async (id: number | string, seasonNumber: number) => {
    try {
      return await makeRequest(`${BASE_URL}/tv/${id}/season/${seasonNumber}`);
    } catch (error) {
      console.error("Error fetching TV season details:", error);
      throw error;
    }
  },

  getGenres: async () => {
    try {
      const [movieGenres, tvGenres] = await Promise.all([
        makeRequest(`${BASE_URL}/genre/movie/list`),
        makeRequest(`${BASE_URL}/genre/tv/list`),
      ]);

      return {
        movie: movieGenres.genres || [],
        tv: tvGenres.genres || [],
      };
    } catch (error) {
      console.error("Error fetching genres:", error);
      return {
        movie: [],
        tv: [],
      };
    }
  },
};