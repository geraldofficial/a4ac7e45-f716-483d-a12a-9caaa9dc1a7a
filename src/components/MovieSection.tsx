
import React, { useState, useEffect } from 'react';
import { MovieCard } from './MovieCard';
import { MovieFilters } from './MovieFilters';
import { tmdbApi, Movie } from '@/services/tmdb';

export const MovieSection = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedType, setSelectedType] = useState<'all' | 'movie' | 'tv'>('all');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [movies, selectedType, selectedGenre, selectedYear, sortBy]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const [moviesData, tvData, trendingData] = await Promise.all([
        tmdbApi.getPopularMovies(),
        tmdbApi.getPopularTVShows(),
        tmdbApi.getTrending()
      ]);

      // Add media_type to distinguish between movies and TV shows
      const moviesWithType = moviesData.map(movie => ({ ...movie, media_type: 'movie' }));
      const tvWithType = tvData.map(tv => ({ ...tv, media_type: 'tv' }));
      const trendingWithType = trendingData.map(item => ({
        ...item,
        media_type: item.title ? 'movie' : 'tv'
      }));

      const allContent = [...moviesWithType, ...tvWithType, ...trendingWithType];
      
      // Remove duplicates based on id and media_type
      const uniqueContent = allContent.filter((item, index, self) =>
        index === self.findIndex(t => t.id === item.id && t.media_type === item.media_type)
      );

      setMovies(uniqueContent);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...movies];

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.media_type === selectedType);
    }

    // Filter by genre
    if (selectedGenre) {
      filtered = filtered.filter(item =>
        item.genre_ids?.includes(parseInt(selectedGenre))
      );
    }

    // Filter by year
    if (selectedYear) {
      filtered = filtered.filter(item => {
        const releaseDate = item.release_date || item.first_air_date;
        return releaseDate && new Date(releaseDate).getFullYear() === parseInt(selectedYear);
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity.desc':
          return (b.popularity || 0) - (a.popularity || 0);
        case 'popularity.asc':
          return (a.popularity || 0) - (b.popularity || 0);
        case 'vote_average.desc':
          return b.vote_average - a.vote_average;
        case 'vote_average.asc':
          return a.vote_average - b.vote_average;
        case 'release_date.desc':
          return new Date(b.release_date || b.first_air_date || '').getTime() - 
                 new Date(a.release_date || a.first_air_date || '').getTime();
        case 'release_date.asc':
          return new Date(a.release_date || a.first_air_date || '').getTime() - 
                 new Date(b.release_date || b.first_air_date || '').getTime();
        default:
          return 0;
      }
    });

    setFilteredMovies(filtered);
  };

  const handleClearFilters = () => {
    setSelectedType('all');
    setSelectedGenre('');
    setSelectedYear('');
    setSortBy('popularity.desc');
  };

  if (loading) {
    return (
      <div className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center text-white text-xl">Loading content...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 px-4">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-white mb-8 text-center">
          Discover Movies & TV Shows
        </h2>
        
        <MovieFilters
          selectedType={selectedType}
          selectedGenre={selectedGenre}
          selectedYear={selectedYear}
          sortBy={sortBy}
          onTypeChange={setSelectedType}
          onGenreChange={setSelectedGenre}
          onYearChange={setSelectedYear}
          onSortChange={setSortBy}
          onClearFilters={handleClearFilters}
        />
        
        {filteredMovies.length === 0 ? (
          <div className="text-center text-white text-xl">
            No content found matching your filters.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard key={`${movie.id}-${movie.media_type}`} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
