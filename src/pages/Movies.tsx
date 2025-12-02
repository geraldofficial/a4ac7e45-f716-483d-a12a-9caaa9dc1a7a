import React, { useState, useEffect } from "react";
import { ModernNavbar } from "@/components/layout/ModernNavbar";
import { MovieCard } from "@/components/MovieCard";
import { Footer } from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { tmdbApi, Movie } from "@/services/tmdb";
import { Film, TrendingUp, Star, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const Movies = () => {
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("popular");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      const [popular, topRated, nowPlaying, upcoming] = await Promise.all([
        tmdbApi.getPopularMovies(),
        tmdbApi.getTopRatedMovies(),
        tmdbApi.getNowPlayingMovies(),
        tmdbApi.getUpcomingMovies(),
      ]);

      setPopularMovies(popular.results);
      setTopRatedMovies(topRated.results);
      setNowPlayingMovies(nowPlaying.results);
      setUpcomingMovies(upcoming.results);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setError("Failed to load movies. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchMovies();
  };

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-background">
          <ModernNavbar />
          <div className="pt-16 md:pt-24 pb-20 px-3 md:px-4">
            <div className="container mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading movies...</p>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </ErrorBoundary>
    );
  }

  if (error) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-background">
          <ModernNavbar />
          <div className="pt-16 md:pt-24 pb-20 px-3 md:px-4">
            <div className="container mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">
                    Unable to Load Movies
                  </h2>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button onClick={handleRetry}>Try Again</Button>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <ModernNavbar />

        <div className="pt-16 md:pt-24 pb-20 px-3 md:px-4">
          <div className="container mx-auto">
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <Film className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    Movies
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Explore the latest and greatest movies from around the world
                  </p>
                </div>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="flex justify-center mb-8">
                <TabsList className="grid w-full max-w-md grid-cols-4">
                  <TabsTrigger
                    value="popular"
                    className="flex items-center gap-1"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span className="hidden sm:inline">Popular</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="top-rated"
                    className="flex items-center gap-1"
                  >
                    <Star className="h-4 w-4" />
                    <span className="hidden sm:inline">Top Rated</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="now-playing"
                    className="flex items-center gap-1"
                  >
                    <Clock className="h-4 w-4" />
                    <span className="hidden sm:inline">Now Playing</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="upcoming"
                    className="flex items-center gap-1"
                  >
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">Upcoming</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="popular">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold">Popular Movies</h2>
                    <Badge variant="secondary">
                      {popularMovies?.length || 0} movies
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    The most watched and talked about movies right now
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {popularMovies?.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  )) || []}
                </div>
              </TabsContent>

              <TabsContent value="top-rated">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold">Top Rated Movies</h2>
                    <Badge variant="secondary">
                      {topRatedMovies?.length || 0} movies
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Critically acclaimed films with the highest ratings
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {topRatedMovies?.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  )) || []}
                </div>
              </TabsContent>

              <TabsContent value="now-playing">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold">Now Playing</h2>
                    <Badge variant="secondary">
                      {nowPlayingMovies?.length || 0} movies
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Movies currently playing in theaters
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {nowPlayingMovies?.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  )) || []}
                </div>
              </TabsContent>

              <TabsContent value="upcoming">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold">Upcoming Movies</h2>
                    <Badge variant="secondary">
                      {upcomingMovies?.length || 0} movies
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Exciting movies coming soon to theaters
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {upcomingMovies?.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  )) || []}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default Movies;
