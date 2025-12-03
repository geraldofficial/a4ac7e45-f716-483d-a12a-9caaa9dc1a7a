import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DetailPageHeader } from "@/components/DetailPageHeader";
import { DetailPageActions } from "@/components/DetailPageActions";
import { DetailPageInfo } from "@/components/DetailPageInfo";
import { DetailPageVideoPlayer } from "@/components/DetailPageVideoPlayer";
import { DetailPageModals } from "@/components/DetailPageModals";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useDetailPageState } from "@/hooks/useDetailPageState";

const DetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, addToWatchlist, removeFromWatchlist, isInWatchlist } = useAuth();
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
      (video) => video.site === "YouTube" && video.type === "Trailer" && video.official
    );
    if (officialTrailer) return officialTrailer;
    return content.videos.results.find(
      (video) => video.site === "YouTube" && video.type === "Trailer"
    ) || null;
  };

  const handleWatch = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to watch content.",
        variant: "destructive",
      });
      navigate("/auth");
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
      toast({ title: "Removed from watchlist", description: `${title} removed.` });
    } else {
      addToWatchlist(content.id);
      toast({ title: "Added to watchlist", description: `${title} added.` });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-muted-foreground text-sm">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🎬</div>
          <h2 className="text-foreground text-lg font-semibold mb-2">Not Found</h2>
          <p className="text-muted-foreground text-sm mb-6">
            This content doesn't exist or is unavailable.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => navigate("/")} size="sm">Home</Button>
            <Button onClick={() => navigate("/browse")} variant="outline" size="sm">Browse</Button>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const title = content.title || content.name || "Unknown Title";
  const trailer = getTrailer();

  return (
    <div className="min-h-screen bg-background">
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
          <div className="md:pt-16">
            <DetailPageHeader
              content={content}
              type={type}
              season={season}
              episode={episode}
              shouldResume={shouldResume}
              trailer={trailer}
              onBack={() => navigate(-1)}
            />

            <div className="container mx-auto px-4 py-4 -mt-2">
              <DetailPageActions
                shouldResume={shouldResume}
                user={user}
                isInWatchlist={isInWatchlist(content.id)}
                onWatch={handleWatch}
                onWatchlistToggle={handleWatchlistToggle}
                onShare={() => setShowShareModal(true)}
              />
            </div>

            <DetailPageInfo content={content} />
          </div>

          <div className="hidden md:block">
            <Footer />
          </div>

          <BottomNavigation />

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
