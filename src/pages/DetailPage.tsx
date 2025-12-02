import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ModernNavbar } from "@/components/layout/ModernNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { DetailPageHeader } from "@/components/DetailPageHeader";
import { DetailPageActions } from "@/components/DetailPageActions";
import { DetailPageInfo } from "@/components/DetailPageInfo";
import { DetailPageVideoPlayer } from "@/components/DetailPageVideoPlayer";
import { DetailPageModals } from "@/components/DetailPageModals";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useDetailPageState } from "@/hooks/useDetailPageState";

const DetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, addToWatchlist, removeFromWatchlist, isInWatchlist } =
    useAuth();
  const { toast } = useToast();

  const {
    content,
    loading,
    isPlaying,
    showShareModal,
    type,
    season,
    episode,
    shouldResume,
    setIsPlaying,
    setShowShareModal,
  } = useDetailPageState(id);

  const getTrailer = () => {
    if (!content?.videos?.results) return null;

    const officialTrailer = content.videos.results.find(
      (video) =>
        video.site === "YouTube" && video.type === "Trailer" && video.official,
    );

    if (officialTrailer) return officialTrailer;

    const anyTrailer = content.videos.results.find(
      (video) => video.site === "YouTube" && video.type === "Trailer",
    );

    return anyTrailer || null;
  };

  const handleWatch = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to watch content.",
        variant: "destructive",
      });
      return;
    }
    setIsPlaying(true);
  };

  const handleWatchlistToggle = () => {
    if (!user || !content) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your watchlist.",
        variant: "destructive",
      });
      return;
    }

    const title = content.title || content.name || "Unknown Title";

    if (isInWatchlist(content.id)) {
      removeFromWatchlist(content.id);
      toast({
        title: "Removed from watchlist",
        description: `${title} has been removed from your watchlist.`,
      });
    } else {
      addToWatchlist(content.id);
      toast({
        title: "Added to watchlist",
        description: `${title} has been added to your watchlist.`,
      });
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
            <div className="text-white text-lg">Loading movie details...</div>
            <div className="text-gray-400 text-sm mt-2">Movie ID: {id}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🎬</div>
            <div className="text-white text-xl mb-2">Content Not Found</div>
            <p className="text-gray-400 mb-6">
              Sorry, we couldn't find{" "}
              {type === "movie" ? "this movie" : "this TV show"} (ID: {id}). It
              might not exist or be unavailable.
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate("/")} className="mr-2">
                Go Home
              </Button>
              <Button onClick={() => navigate("/browse")} variant="outline">
                Browse Content
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const title = content.title || content.name || "Unknown Title";
  const trailer = getTrailer();

  return (
    <div className="min-h-screen bg-gray-950">
      <DetailPageVideoPlayer
        isPlaying={isPlaying}
        title={title}
        contentId={content.id}
        type={type}
        season={season}
        episode={episode}
        posterPath={content.poster_path}
        backdropPath={content.backdrop_path}
        duration={content.runtime}
        shouldResume={shouldResume}
        onClose={() => setIsPlaying(false)}
      />

      {!isPlaying && (
        <>
          <ModernNavbar />

          <div className="pt-14 md:pt-16">
            <DetailPageHeader
              content={content}
              type={type}
              season={season}
              episode={episode}
              shouldResume={shouldResume}
              trailer={trailer}
              onBack={() => navigate(-1)}
            />

            <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 -mt-2">
              <div className="max-w-full md:max-w-2xl">
                <DetailPageActions
                  shouldResume={shouldResume}
                  user={user}
                  isInWatchlist={isInWatchlist(content.id)}
                  onWatch={handleWatch}
                  onWatchlistToggle={handleWatchlistToggle}
                  onShare={handleShare}
                />
              </div>
            </div>

            <DetailPageInfo content={content} />
          </div>

          <Footer />

          <DetailPageModals
            showShareModal={showShareModal}
            showWatchParty={false}
            content={content}
            type={type}
            onCloseShare={() => setShowShareModal(false)}
            onCloseWatchParty={() => {}}
          />
        </>
      )}
    </div>
  );
};

export default DetailPage;
