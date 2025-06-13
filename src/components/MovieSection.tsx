
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MovieCard } from './MovieCard';
import { MovieFilters } from './MovieFilters';
import { tmdbApi, Movie } from '@/services/tmdb';

export const MovieSection = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Filter states
  const [selectedType, setSelectedType] = useState<'all' | 'movie' | 'tv'>('all');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');

  const observer = useRef<IntersectionObserver>();
  const lastMovieElementRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreContent();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [movies, selectedType, selectedGenre, selectedYear, sortBy]);

  const fetchContent = async () => {
    setLoading(true);
    setPage(1);
    try {
      const [moviesData, tvData, trendingData] = await Promise.all([
        tmdbApi.getPopularMovies(),
        tmdbApi.getPopularTVShows(),
        tmdbApi.getTrending()
      ]);

      // Add media_type to distinguish between movies and TV shows
      const moviesWithType: Movie[] = moviesData.map(movie => ({ 
        ...movie, 
        media_type: 'movie' as const 
      }));
      const tvWithType: Movie[] = tvData.map(tv => ({ 
        ...tv, 
        media_type: 'tv' as const 
      }));
      const trendingWithType: Movie[] = trendingData.map(item => ({
        ...item,
        media_type: (item.title ? 'movie' : 'tv') as 'movie' | 'tv'
      }));

      const allContent = [...moviesWithType, ...tvWithType, ...trendingWithType];
      
      // Remove duplicates based on id and media_type
      const uniqueContent = allContent.filter((item, index, self) =>
        index === self.findIndex(t => t.id === item.id && t.media_type === item.media_type)
      );

      setMovies(uniqueContent);
      setHasMore(true);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreContent = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      
      // Fetch more content from different endpoints
      const promises = [];
      if (nextPage <= 5) { // Limit to prevent too many requests
        promises.push(
          tmdbApi.discoverContent({ type: 'movie', page: nextPage }),
          tmdbApi.discoverContent({ type: 'tv', page: nextPage })
        );
      }

      if (promises.length > 0) {
        const results = await Promise.all(promises);
        const newMovies: Movie[] = [];
        
        results.forEach(result => {
          const contentWithType = result.results.map(item => ({
            ...item,
            media_type: (item.title ? 'movie' : 'tv') as 'movie' | 'tv'
          }));
          newMovies.push(...contentWithType);
        });

        // Remove duplicates
        const uniqueNewMovies = newMovies.filter(newMovie => 
          !movies.some(existingMovie => 
            existingMovie.id === newMovie.id && existingMovie.media_type === newMovie.media_type
          )
        );

        if (uniqueNewMovies.length > 0) {
          setMovies(prev => [...prev, ...uniqueNewMovies]);
          setPage(nextPage);
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more content:', error);
    } finally {
      setLoadingMore(false);
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
      <div className="py-8 sm:py-12 lg:py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center text-foreground text-lg sm:text-xl">Loading content...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 lg:py-20 px-4">
      <div className="container mx-auto">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-6 sm:mb-8 text-center">
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
          <div className="text-center text-foreground text-lg sm:text-xl">
            No content found matching your filters.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
              {filteredMovies.map((movie, index) => (
                <div
                  key={`${movie.id}-${movie.media_type}`}
                  ref={index === filteredMovies.length - 1 ? lastMovieElementRef : null}
                >
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
            
            {loadingMore && (
              <div className="text-center text-foreground text-lg mt-8">
                Loading more content...
              </div>
            )}
            
            {!hasMore && filteredMovies.length > 20 && (
              <div className="text-center text-muted-foreground text-sm mt-8">
                You've reached the end of the content.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
