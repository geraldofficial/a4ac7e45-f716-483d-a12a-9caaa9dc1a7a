
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { MovieCard } from '@/components/MovieCard';
import { Footer } from '@/components/Footer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { tmdbApi, Movie } from '@/services/tmdb';
import { Search as SearchIcon, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const observer = useRef<IntersectionObserver>();
  const lastMovieElementRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !error) {
        loadMoreResults();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore, error]);

  useEffect(() => {
    if (query) {
      searchContent(query);
    } else {
      setResults([]);
      setPage(1);
      setTotalPages(0);
      setHasMore(false);
      setError(null);
    }
  }, [query]);

  const searchContent = async (searchQuery: string, pageNum: number = 1) => {
    if (pageNum === 1) {
      setLoading(true);
      setResults([]);
      setError(null);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const searchResults = await tmdbApi.searchMulti(searchQuery, pageNum);
      
      if (pageNum === 1) {
        setResults(searchResults.results);
        setPage(1);
      } else {
        setResults(prev => [...prev, ...searchResults.results]);
      }
      
      setTotalPages(searchResults.total_pages);
      setHasMore(pageNum < searchResults.total_pages);
      setError(null);
    } catch (error) {
      console.error('Error searching:', error);
      setError(pageNum === 1 ? 'Failed to search. Please try again.' : 'Failed to load more results.');
      if (pageNum === 1) {
        setResults([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreResults = async () => {
    if (!query || loadingMore || !hasMore || error) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    await searchContent(query, nextPage);
  };

  const handleRetry = () => {
    setError(null);
    if (query) {
      searchContent(query);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="pt-4 md:pt-16 sm:pt-20 lg:pt-24 pb-24 md:pb-16 lg:pb-20 px-4">
          <div className="container mx-auto">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <SearchIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                {query ? `Search results for "${query}"` : 'Search'}
              </h1>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="font-medium text-red-700 dark:text-red-300">Error</span>
                </div>
                <p className="text-red-600 dark:text-red-400 mb-3">{error}</p>
                <Button onClick={handleRetry} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12 sm:py-16 lg:py-20">
                <div className="text-foreground text-lg sm:text-xl">Searching...</div>
              </div>
            ) : results.length > 0 ? (
              <>
                {/* Mobile: 1 column, Tablet: 3 columns, Desktop: 4-6 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-4 lg:gap-6">
                  {results.map((item, index) => (
                    <div
                      key={`${item.id}-${item.media_type}`}
                      ref={index === results.length - 1 ? lastMovieElementRef : null}
                    >
                      <ErrorBoundary fallback={
                        <div className="aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                          <span className="text-muted-foreground text-sm">Failed to load</span>
                        </div>
                      }>
                        <MovieCard movie={item} />
                      </ErrorBoundary>
                    </div>
                  ))}
                </div>
                
                {loadingMore && (
                  <div className="text-center text-foreground text-lg mt-8">
                    Loading more results...
                  </div>
                )}
                
                {!hasMore && results.length > 0 && (
                  <div className="text-center text-muted-foreground text-sm mt-8">
                    You've reached the end of the search results.
                  </div>
                )}
              </>
            ) : query && !loading && !error ? (
              <div className="text-center py-12 sm:py-16 lg:py-20">
                <p className="text-muted-foreground text-lg sm:text-xl">No results found for "{query}"</p>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base">Try different keywords or check your spelling</p>
              </div>
            ) : null}
          </div>
        </div>
        
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default Search;
