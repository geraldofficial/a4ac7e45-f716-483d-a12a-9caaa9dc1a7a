
const API_KEY = '3c1ad5a8c5c564f5b2c5b4b1e6b2b5b1';
const BASE_URL = 'https://api.themoviedb.org/3';

export const tmdbApi = {
  getTrending: async () => {
    const response = await fetch(`${BASE_URL}/trending/all/day?api_key=${API_KEY}`);
    const data = await response.json();
    return data.results;
  },

  getPopularMovies: async () => {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
    return await response.json();
  },

  getPopularTVShows: async () => {
    const response = await fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}`);
    const data = await response.json();
    return data.results;
  },

  getTopRatedMovies: async () => {
    const response = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`);
    return await response.json();
  },

  getUpcomingMovies: async () => {
    const response = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`);
    return await response.json();
  },

  getMoviesByGenre: async (genreId: number) => {
    const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`);
    return await response.json();
  },

  getTVShowsByGenre: async (genreId: number) => {
    const response = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`);
    return await response.json();
  },

  searchMovies: async (query: string) => {
    const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    return await response.json();
  },

  searchTVShows: async (query: string) => {
    const response = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    return await response.json();
  },

  getMovieDetails: async (id: string) => {
    const response = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=credits,videos,similar`);
    return await response.json();
  },

  getTVShowDetails: async (id: string) => {
    const response = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&append_to_response=credits,videos,similar`);
    return await response.json();
  },

  getGenres: async () => {
    const [movieGenres, tvGenres] = await Promise.all([
      fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`).then(res => res.json()),
      fetch(`${BASE_URL}/genre/tv/list?api_key=${API_KEY}`).then(res => res.json())
    ]);
    
    return {
      movie: movieGenres.genres,
      tv: tvGenres.genres
    };
  }
};
