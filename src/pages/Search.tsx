import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { MovieCard } from "@/components/MovieCard";
import { Footer } from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { tmdbApi, Movie } from "@/services/tmdb";
import { Search as SearchIcon, AlertTriangle, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [localQuery, setLocalQuery] = useState(query);
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("popularity");
  const [filterType, setFilterType] = useState("all");
  const { toast } = useToast();

  const observer = useRef<IntersectionObserver>();
  const lastMovieElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !error && !loading) {
          loadMoreResults();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore, error, loading],
  );

  const searchContent = async (searchQuery: string, pageNum: number = 1) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setPage(1);
      setTotalPages(0);
      setTotalResults(0);
      setHasMore(false);
      setError(null);
      return;
    }

    if (pageNum === 1) {
      setLoading(true);
      setResults([]);
      setError(null);
    } else {
      setLoadingMore(true);
    }

    try {
      let searchResults;

      // Search based on filter type
      if (filterType === "movie") {
        searchResults = await tmdbApi.searchMovies(searchQuery, pageNum);
      } else if (filterType === "tv") {
        searchResults = await tmdbApi.searchTVShows(searchQuery, pageNum);
      } else {
        searchResults = await tmdbApi.searchMulti(searchQuery, pageNum);
      }

      // Sort results if needed
      let sortedResults = searchResults.results || [];
      if (sortBy === "rating") {
        sortedResults = sortedResults.sort(
          (a: Movie, b: Movie) => b.vote_average - a.vote_average,
        );
      } else if (sortBy === "date") {
        sortedResults = sortedResults.sort((a: Movie, b: Movie) => {
          const dateA = new Date(a.release_date || a.first_air_date || "");
          const dateB = new Date(b.release_date || b.first_air_date || "");
          return dateB.getTime() - dateA.getTime();
        });
      }

      if (pageNum === 1) {
        setResults(sortedResults);
        setPage(1);
      } else {
        setResults((prev) => [...prev, ...sortedResults]);
      }

      setTotalPages(searchResults.total_pages || 0);
      setTotalResults(searchResults.total_results || 0);
      setHasMore(pageNum < (searchResults.total_pages || 0));
      setError(null);

      // Show success toast for new searches
      if (pageNum === 1 && sortedResults.length > 0) {
        toast({
          title: "Search completed",
          description: `Found ${searchResults.total_results} results for "${searchQuery}"`,
        });
      }
    } catch (error) {
      console.error("Error searching:", error);
      const errorMessage =
        pageNum === 1
          ? "Failed to search. Please check your connection and try again."
          : "Failed to load more results.";

      setError(errorMessage);

      if (pageNum === 1) {
        setResults([]);
      }

      toast({
        title: "Search Error",
        description: errorMessage,
        variant: "destructive",
      });
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchParams({ q: localQuery.trim() });
    }
  };

  const handleRetry = () => {
    setError(null);
    if (query) {
      searchContent(query);
    }
  };

  const handleClearSearch = () => {
    setLocalQuery("");
    setSearchParams({});
    setResults([]);
    setError(null);
  };

  const applyFilters = () => {
    if (query) {
      searchContent(query, 1);
    }
  };

  // Search when query changes
  useEffect(() => {
    setLocalQuery(query);
    if (query) {
      searchContent(query);
    } else {
      setResults([]);
      setPage(1);
      setTotalPages(0);
      setTotalResults(0);
      setHasMore(false);
      setError(null);
    }
  }, [query]);

  // Apply filters when they change
  useEffect(() => {
    if (query) {
      const timeoutId = setTimeout(() => {
        searchContent(query, 1);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [sortBy, filterType]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="pt-20 pb-32 md:pb-20 px-4 safe-area-top safe-area-bottom">
          <div className="container mx-auto max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <SearchIcon className="h-6 w-6 text-primary flex-shrink-0" />
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                  {query ? "Search Results" : "Search"}
                </h1>
              </div>

              {results.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="self-start sm:self-auto"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              )}
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <form onSubmit={handleSearch} className="relative max-w-2xl">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search for movies, TV shows..."
                    value={localQuery}
                    onChange={(e) => setLocalQuery(e.target.value)}
                    className="pl-10 pr-10 h-12 text-base border-border/50 focus:border-primary"
                  />
                  {localQuery && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSearch}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </form>
            </div>

            {/* Results Summary */}
            {query && (
              <div className="mb-6">
                <p className="text-muted-foreground">
                  {loading ? (
                    "Searching..."
                  ) : error ? (
                    "Search failed"
                  ) : (
                    <>
                      {totalResults > 0 ? (
                        <>
                          Found {totalResults.toLocaleString()} results for "
                          {query}"
                        </>
                      ) : (
                        <>No results found for "{query}"</>
                      )}
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Filters */}
            {showFilters && (
              <div className="mb-6 p-4 bg-card/50 border border-border/50 rounded-lg">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">
                      Content Type
                    </label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="movie">Movies</SelectItem>
                        <SelectItem value="tv">TV Shows</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">
                      Sort By
                    </label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popularity">Popularity</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="date">Release Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Active Filters */}
            {(filterType !== "all" || sortBy !== "popularity") && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filterType !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Type: {filterType === "tv" ? "TV Shows" : "Movies"}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setFilterType("all")}
                    />
                  </Badge>
                )}
                {sortBy !== "popularity" && (
                  <Badge variant="secondary" className="gap-1">
                    Sort: {sortBy === "rating" ? "Rating" : "Date"}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSortBy("popularity")}
                    />
                  </Badge>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-700 dark:text-red-300 mb-1">
                      Search Error
                    </p>
                    <p className="text-red-600 dark:text-red-400 text-sm mb-3">
                      {error}
                    </p>
                    <Button onClick={handleRetry} variant="outline" size="sm">
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-foreground text-lg">Searching...</p>
              </div>
            )}

            {/* Results Grid */}
            {results.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4 lg:gap-6 mb-8">
                  {results.map((item, index) => (
                    <div
                      key={`${item.id}-${item.media_type || filterType}`}
                      ref={
                        index === results.length - 1
                          ? lastMovieElementRef
                          : null
                      }
                    >
                      <ErrorBoundary
                        fallback={
                          <div className="aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                            <span className="text-muted-foreground text-sm text-center p-2">
                              Failed to load
                            </span>
                          </div>
                        }
                      >
                        <MovieCard movie={item} variant="compact" />
                      </ErrorBoundary>
                    </div>
                  ))}
                </div>

                {/* Load More Indicator */}
                {loadingMore && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-foreground">Loading more results...</p>
                  </div>
                )}

                {/* End of Results */}
                {!hasMore && results.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      You've reached the end of the search results.
                    </p>
                    {totalResults > results.length && (
                      <p className="text-muted-foreground text-sm mt-1">
                        Showing {results.length} of{" "}
                        {totalResults.toLocaleString()} results
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* No Results */}
            {query && !loading && !error && results.length === 0 && (
              <div className="text-center py-16">
                <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  Try different keywords or check your spelling
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button variant="outline" onClick={() => setLocalQuery("")}>
                    Clear Search
                  </Button>
                  <Button onClick={() => setShowFilters(!showFilters)}>
                    Adjust Filters
                  </Button>
                </div>
              </div>
            )}

            {/* Search Tips */}
            {!query && !loading && (
              <div className="text-center py-16">
                <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  Search for Movies & TV Shows
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Find your favorite content by title, actor, director, or genre
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto text-sm">
                  <div className="p-3 bg-card/50 rounded-lg">
                    <p className="font-medium mb-1">By Title</p>
                    <p className="text-muted-foreground">
                      "Avengers", "Breaking Bad"
                    </p>
                  </div>
                  <div className="p-3 bg-card/50 rounded-lg">
                    <p className="font-medium mb-1">By Actor</p>
                    <p className="text-muted-foreground">
                      "Tom Hanks", "Emma Stone"
                    </p>
                  </div>
                  <div className="p-3 bg-card/50 rounded-lg">
                    <p className="font-medium mb-1">By Genre</p>
                    <p className="text-muted-foreground">
                      "Comedy", "Thriller"
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default Search;
