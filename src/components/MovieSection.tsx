
import React, { useState, useEffect } from 'react';
import { MovieCard } from './MovieCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  overview: string;
}

export const MovieSection = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTvShows] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMoviesAndShows();
  }, []);

  const fetchMoviesAndShows = async () => {
    try {
      // Note: In a real app, you would use your actual TMDB API key
      const API_KEY = 'your_tmdb_api_key_here';
      
      // For demo purposes, using mock data
      const mockMovies = [
        {
          id: 1,
          title: "The Dark Knight",
          poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
          release_date: "2008-07-18",
          vote_average: 9.0,
          overview: "Batman raises the stakes in his war on crime."
        },
        {
          id: 2,
          title: "Inception",
          poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
          release_date: "2010-07-16",
          vote_average: 8.8,
          overview: "A thief who steals corporate secrets through dream-sharing technology."
        },
        {
          id: 3,
          title: "Interstellar",
          poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
          release_date: "2014-11-07",
          vote_average: 8.6,
          overview: "A team of explorers travel through a wormhole in space."
        },
        {
          id: 4,
          title: "The Matrix",
          poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
          release_date: "1999-03-31",
          vote_average: 8.7,
          overview: "A hacker discovers reality is a computer simulation."
        }
      ];

      const mockTvShows = [
        {
          id: 101,
          title: "Breaking Bad",
          poster_path: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
          release_date: "2008-01-20",
          vote_average: 9.5,
          overview: "A high school chemistry teacher turned methamphetamine manufacturer."
        },
        {
          id: 102,
          title: "Stranger Things",
          poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
          release_date: "2016-07-15",
          vote_average: 8.7,
          overview: "Kids in a small town face supernatural forces."
        },
        {
          id: 103,
          title: "The Crown",
          poster_path: "/1M876KPjulVwppEpldhdc8V4o68.jpg",
          release_date: "2016-11-04",
          vote_average: 8.6,
          overview: "The reign of Queen Elizabeth II."
        },
        {
          id: 104,
          title: "Game of Thrones",
          poster_path: "/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
          release_date: "2011-04-17",
          vote_average: 8.9,
          overview: "Noble families vie for control of the Iron Throne."
        }
      ];

      setMovies(mockMovies);
      setTvShows(mockTvShows);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="text-white text-xl">Loading amazing content...</div>
      </div>
    );
  }

  return (
    <div className="py-20 px-4">
      <div className="container mx-auto">
        {/* Popular Movies Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Popular Movies</h2>
            <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
              View All
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} type="movie" />
            ))}
          </div>
        </section>

        {/* TV Series Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Popular TV Series</h2>
            <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
              View All
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tvShows.map((show) => (
              <MovieCard key={show.id} movie={show} type="tv" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
