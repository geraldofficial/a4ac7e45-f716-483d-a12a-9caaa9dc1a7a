
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (query) {
      searchContent(query);
    }
  }, [query]);

  const searchContent = async (searchQuery: string) => {
    setLoading(true);
    try {
      const searchResults = await tmdbApi.search(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <SearchIcon className="h-6 w-6 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">
              {query ? `Search results for "${query}"` : 'Search'}
            </h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-white text-xl">Searching...</div>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {results.map((item) => (
                <MovieCard 
                  key={item.id} 
                  movie={item}
                />
              ))}
            </div>
          ) : query ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">No results found for "{query}"</p>
              <p className="text-gray-500 mt-2">Try different keywords or check your spelling</p>
            </div>
          ) : null}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Search;
