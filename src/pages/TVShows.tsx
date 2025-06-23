import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { MovieCard } from "@/components/MovieCard";
import { Footer } from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { tmdbApi, Movie } from "@/services/tmdb";
import { Tv, TrendingUp, Star, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const TVShows = () => {
  const [popularShows, setPopularShows] = useState<Movie[]>([]);
  const [topRatedShows, setTopRatedShows] = useState<Movie[]>([]);
  const [onTheAirShows, setOnTheAirShows] = useState<Movie[]>([]);
  const [airingTodayShows, setAiringTodayShows] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("popular");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTVShows();
  }, []);

  const fetchTVShows = async () => {
    try {
      setLoading(true);
      setError(null);

      const [popular, topRated, onTheAir, airingToday] = await Promise.all([
        tmdbApi.getPopularTVShows(),
        tmdbApi.getTopRatedTVShows(),
        tmdbApi.getOnTheAirTVShows(),
        tmdbApi.getAiringTodayTVShows(),
      ]);

      setPopularShows(popular.results);
      setTopRatedShows(topRated.results);
      setOnTheAirShows(onTheAir.results);
      setAiringTodayShows(airingToday.results);
    } catch (error) {
      console.error("Error fetching TV shows:", error);
      setError("Failed to load TV shows. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchTVShows();
  };

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="pt-16 md:pt-24 pb-20 px-3 md:px-4">
            <div className="container mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading TV shows...</p>
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
          <Navbar />
          <div className="pt-16 md:pt-24 pb-20 px-3 md:px-4">
            <div className="container mx-auto">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Tv className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">
                    Unable to Load TV Shows
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
        <Navbar />

        <div className="pt-16 md:pt-24 pb-20 px-3 md:px-4">
          <div className="container mx-auto">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <Tv className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    TV Shows
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Discover amazing television series from around the world
                  </p>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
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
                    value="on-air"
                    className="flex items-center gap-1"
                  >
                    <Clock className="h-4 w-4" />
                    <span className="hidden sm:inline">On Air</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="airing-today"
                    className="flex items-center gap-1"
                  >
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">Today</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="popular">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold">Popular TV Shows</h2>
                    <Badge variant="secondary">
                      {popularShows?.length || 0} shows
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    The most watched and talked about TV shows right now
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {popularShows?.map((show) => (
                    <MovieCard key={show.id} movie={show} type="tv" />
                  )) || []}
                </div>
              </TabsContent>

              <TabsContent value="top-rated">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold">Top Rated TV Shows</h2>
                    <Badge variant="secondary">
                      {topRatedShows?.length || 0} shows
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Critically acclaimed series with the highest ratings
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {topRatedShows?.map((show) => (
                    <MovieCard key={show.id} movie={show} type="tv" />
                  )) || []}
                </div>
              </TabsContent>

              <TabsContent value="on-air">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold">Currently On Air</h2>
                    <Badge variant="secondary">
                      {onTheAirShows?.length || 0} shows
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    TV shows that are currently airing new episodes
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {onTheAirShows?.map((show) => (
                    <MovieCard key={show.id} movie={show} type="tv" />
                  )) || []}
                </div>
              </TabsContent>

              <TabsContent value="airing-today">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold">Airing Today</h2>
                    <Badge variant="secondary">
                      {airingTodayShows?.length || 0} shows
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    TV shows with new episodes airing today
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {airingTodayShows?.map((show) => (
                    <MovieCard key={show.id} movie={show} type="tv" />
                  )) || []}
                </div>
              </TabsContent>
            </Tabs>

            {/* Stats */}
            <div className="mt-16 text-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card p-4 rounded-lg border">
                  <div className="text-2xl font-bold text-primary">
                    {popularShows?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Popular Shows
                  </div>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <div className="text-2xl font-bold text-primary">
                    {topRatedShows?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Top Rated</div>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <div className="text-2xl font-bold text-primary">
                    {onTheAirShows?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">On Air</div>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <div className="text-2xl font-bold text-primary">
                    {airingTodayShows?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Airing Today
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default TVShows;
