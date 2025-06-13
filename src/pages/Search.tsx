
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { MovieCard } from '@/components/MovieCard';
import { Footer } from '@/components/Footer';
import { tmdbApi, Movie } from '@/services/tmdb';
import { Search as SearchIcon } from 'lucide-react';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const observer = useRef<IntersectionObserver>();
  const lastMovieElementRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreResults();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);

  useEffect(() => {
    if (query) {
      searchContent(query);
    } else {
      setResults([]);
      setPage(1);
      setTotalPages(0);
      setHasMore(false);
    }
  }, [query]);

  const searchContent = async (searchQuery: string, pageNum: number = 1) => {
    if (pageNum === 1) {
      setLoading(true);
      setResults([]);
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
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreResults = async () => {
    if (!query || loadingMore || !hasMore) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    await searchContent(query, nextPage);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 lg:pb-20 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <SearchIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              {query ? `Search results for "${query}"` : 'Search'}
            </h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 sm:py-16 lg:py-20">
              <div className="text-foreground text-lg sm:text-xl">Searching...</div>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                {results.map((item, index) => (
                  <div
                    key={`${item.id}-${item.media_type}`}
                    ref={index === results.length - 1 ? lastMovieElementRef : null}
                  >
                    <MovieCard movie={item} />
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
          ) : query ? (
            <div className="text-center py-12 sm:py-16 lg:py-20">
              <p className="text-muted-foreground text-lg sm:text-xl">No results found for "{query}"</p>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">Try different keywords or check your spelling</p>
            </div>
          ) : null}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Search;
