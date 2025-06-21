import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { tmdbApi, Movie } from "@/services/tmdb";
import { useToast } from "@/hooks/use-toast";

export const useDetailPageState = (id: string | undefined) => {
  const location = useLocation();
  const { toast } = useToast();
  const [content, setContent] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showWatchParty, setShowWatchParty] = useState(false);

  console.log("🔍 useDetailPageState called:", {
    id,
    pathname: location.pathname,
  });

  // Determine type from the current route with proper typing and memoization
  const type: "movie" | "tv" = useMemo(
    () => (location.pathname.startsWith("/movie/") ? "movie" : "tv"),
    [location.pathname],
  );

  // Memoize URL parameters parsing
  const urlParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const season = useMemo(() => {
    const seasonParam = urlParams.get("season");
    return seasonParam ? parseInt(seasonParam) : undefined;
  }, [urlParams]);

  const episode = useMemo(() => {
    const episodeParam = urlParams.get("episode");
    return episodeParam ? parseInt(episodeParam) : undefined;
  }, [urlParams]);

  const shouldResume = useMemo(
    () => urlParams.get("resume") === "true",
    [urlParams],
  );
  const autoWatch = useMemo(
    () => urlParams.get("watch") === "true",
    [urlParams],
  );

  // Memoize fetchContent function to prevent unnecessary re-creates
  const fetchContent = useCallback(async () => {
    if (!id) {
      console.log("No id provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log(`Fetching ${type} with id: ${id}`);
      const data =
        type === "movie"
          ? await tmdbApi.getMovieDetails(parseInt(id))
          : await tmdbApi.getTVDetails(parseInt(id));

      console.log("Fetched content:", data);
      setContent(data);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast({
        title: "Error",
        description: "Failed to load content details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, type, toast]);

  useEffect(() => {
    if (id) {
      console.log("Fetching content for:", {
        type,
        id,
        season,
        episode,
        shouldResume,
        autoWatch,
      });
      fetchContent();
    } else {
      console.log("Missing id:", { type, id });
      setLoading(false);
    }
  }, [fetchContent, id, season, episode]);

  useEffect(() => {
    // Auto-start player if watch=true in URL
    if (autoWatch && content && !loading) {
      setIsPlaying(true);
    }
  }, [autoWatch, content, loading]);

  return {
    content,
    loading,
    isPlaying,
    showShareModal,
    showWatchParty,
    type,
    season,
    episode,
    shouldResume,
    setIsPlaying,
    setShowShareModal,
    setShowWatchParty,
  };
};
