import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTVGuest } from "@/contexts/TVGuestContext";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Content {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  runtime?: number;
  episode_run_time?: number[];
}

const WatchPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isGuestMode, addToGuestWatchHistory } = useTVGuest();
  const { toast } = useToast();

  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get parameters from URL
  const type = (searchParams.get("type") as "movie" | "tv") || "movie";
  const season = searchParams.get("season")
    ? parseInt(searchParams.get("season")!)
    : undefined;
  const episode = searchParams.get("episode")
    ? parseInt(searchParams.get("episode")!)
    : undefined;
  const shouldResume = searchParams.get("resume") === "true";

  // Memoize the display title calculation
  const displayTitle = useMemo(() => {
    if (!content) return "Loading...";

    const title = content.title || content.name || "Unknown Title";
    if (type === "tv" && season && episode) {
      return `${title} - Season ${season} Episode ${episode}`;
    }
    return title;
  }, [content, type, season, episode]);

  // Memoize the duration calculation
  const videoDuration = useMemo(() => {
    if (!content) return undefined;

    if (type === "tv" && content.episode_run_time?.length) {
      return content.episode_run_time[0] * 60; // Convert minutes to seconds
    }
    return content.runtime ? content.runtime * 60 : undefined;
  }, [content, type]);

  useEffect(() => {
    if (!id) {
      setError("No content ID provided");
      setLoading(false);
      return;
    }

    // Check if user has access (either logged in or in guest mode)
    if (!user && !isGuestMode) {
      toast({
        title: "Access Required",
        description: "Please sign in or use guest mode to watch content.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    fetchContent();
  }, [id, user, isGuestMode]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://api.themoviedb.org/3/${type}/${id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch content details");
      }

      const data = await response.json();
      setContent(data);

      // Add to watch history for guest users
      if (isGuestMode) {
        addToGuestWatchHistory({
          id: data.id,
          title: data.title || data.name,
          poster_path: data.poster_path,
          type,
          watchedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Error fetching content:", err);
      setError(err instanceof Error ? err.message : "Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Navigate back to detail page or home
    const detailPath = `/detail/${id}?type=${type}`;
    if (season && episode) {
      navigate(`${detailPath}&season=${season}&episode=${episode}`);
    } else {
      navigate(detailPath);
    }
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4" />
          <p className="text-gray-400">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">
            Content Not Available
          </h1>
          <p className="text-gray-400 mb-6">
            {error || "The requested content could not be found."}
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={handleHomeClick}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <VideoPlayer
        title={displayTitle}
        tmdbId={parseInt(id!)}
        type={type}
        season={season}
        episode={episode}
        poster_path={content.poster_path}
        backdrop_path={content.backdrop_path}
        duration={videoDuration}
        shouldResume={shouldResume}
        onClose={handleClose}
      />
    </div>
  );
};

export default WatchPage;
