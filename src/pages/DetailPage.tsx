import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/VideoPlayer';
import { DetailPageHeader } from '@/components/DetailPageHeader';
import { DetailPageActions } from '@/components/DetailPageActions';
import { DetailPageInfo } from '@/components/DetailPageInfo';
import { tmdbApi, Movie } from '@/services/tmdb';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ShareModal } from '@/components/ShareModal';
import { WatchParty } from '@/components/WatchParty';

const DetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showWatchParty, setShowWatchParty] = useState(false);
  const { user, addToWatchlist, removeFromWatchlist, isInWatchlist } = useAuth();
  const { toast } = useToast();

  // Determine type from the current route
  const type = location.pathname.startsWith('/movie/') ? 'movie' : 'tv';

  // Parse URL parameters for series/episode information and resume functionality
  const urlParams = new URLSearchParams(location.search);
  const season = urlParams.get('season') ? parseInt(urlParams.get('season')!) : undefined;
  const episode = urlParams.get('episode') ? parseInt(urlParams.get('episode')!) : undefined;
  const shouldResume = urlParams.get('resume') === 'true';
  const autoWatch = urlParams.get('watch') === 'true';

  useEffect(() => {
    if (id) {
      console.log('Fetching content for:', { type, id, season, episode, shouldResume, autoWatch });
      fetchContent();
    } else {
      console.log('Missing id:', { type, id });
      setLoading(false);
    }
  }, [type, id, season, episode]);

  useEffect(() => {
    // Auto-start player if watch=true in URL
    if (autoWatch && content && !loading) {
      setIsPlaying(true);
    }
  }, [autoWatch, content, loading]);

  const fetchContent = async () => {
    if (!id) {
      console.log('No id provided');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log(`Fetching ${type} with id: ${id}`);
      const data = type === 'movie' 
        ? await tmdbApi.getMovieDetails(parseInt(id))
        : await tmdbApi.getTVDetails(parseInt(id));
      
      console.log('Fetched content:', data);
      setContent(data);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "Error",
        description: "Failed to load content details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get the best trailer from videos
  const getTrailer = () => {
    if (!content?.videos?.results) return null;
    
    // Look for official trailers first
    const officialTrailer = content.videos.results.find(
      video => video.site === 'YouTube' && video.type === 'Trailer' && video.official
    );
    
    if (officialTrailer) return officialTrailer;
    
    // Fall back to any trailer
    const anyTrailer = content.videos.results.find(
      video => video.site === 'YouTube' && video.type === 'Trailer'
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

    const title = content.title || content.name || 'Unknown Title';

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

  const handleWatchParty = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to create watch parties.",
        variant: "destructive"
      });
      return;
    }
    setShowWatchParty(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 md:pt-24 pb-20 px-3 md:px-4">
          <div className="container mx-auto text-center">
            <div className="text-foreground text-sm md:text-xl">Loading content...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 md:pt-24 pb-20 px-3 md:px-4">
          <div className="container mx-auto text-center">
            <div className="text-foreground text-sm md:text-xl">Content not found</div>
            <p className="text-muted-foreground mt-2 text-xs md:text-base">Type: {type}, ID: {id}</p>
            <Button onClick={() => navigate('/')} className="mt-4" size="sm">
              Go Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const title = content.title || content.name || 'Unknown Title';
  const trailer = getTrailer();

  // Get display title with episode info for TV shows
  const getDisplayTitle = () => {
    if (type === 'tv' && season && episode) {
      return `${title} - Season ${season} Episode ${episode}`;
    }
    return title;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Video Player - Full Screen Overlay */}
      {isPlaying && (
        <VideoPlayer
          title={getDisplayTitle()}
          tmdbId={content.id}
          type={type}
          season={season}
          episode={episode}
          poster_path={content.poster_path}
          backdrop_path={content.backdrop_path}
          duration={content.runtime ? content.runtime * 60 : undefined}
          shouldResume={shouldResume}
          onClose={() => setIsPlaying(false)}
        />
      )}

      {!isPlaying && (
        <>
          <Navbar />
          
          <div className="pt-14 md:pt-16">
            {/* Hero Section */}
            <DetailPageHeader
              content={content}
              type={type}
              season={season}
              episode={episode}
              shouldResume={shouldResume}
              trailer={trailer}
              onBack={() => navigate(-1)}
            />

            {/* Action Buttons - Below the hero section */}
            <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 -mt-2">
              <div className="max-w-full md:max-w-2xl">
                <DetailPageActions
                  shouldResume={shouldResume}
                  user={user}
                  isInWatchlist={isInWatchlist(content.id)}
                  onWatch={handleWatch}
                  onWatchlistToggle={handleWatchlistToggle}
                  onShare={handleShare}
                  onWatchParty={handleWatchParty}
                />
              </div>
            </div>

            {/* Additional Info */}
            <DetailPageInfo content={content} />
          </div>
          
          <Footer />

          {/* Share Modal */}
          {showShareModal && (
            <ShareModal
              content={{
                id: content.id,
                title,
                type: type as 'movie' | 'tv',
                poster_path: content.poster_path,
                description: content.overview
              }}
              onClose={() => setShowShareModal(false)}
            />
          )}

          {/* Watch Party Modal */}
          {showWatchParty && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <WatchParty
                movieId={content.id}
                movieTitle={title}
                movieType={type as 'movie' | 'tv'}
                onClose={() => setShowWatchParty(false)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DetailPage;
