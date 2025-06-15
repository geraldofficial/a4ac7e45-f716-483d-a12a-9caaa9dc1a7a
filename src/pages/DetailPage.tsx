
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/VideoPlayer';
import { tmdbApi, Movie } from '@/services/tmdb';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Play, Plus, Check, Star, Calendar, Clock, Users, ArrowLeft, Share, UserPlus } from 'lucide-react';
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
  const releaseDate = content.release_date || content.first_air_date || '';
  const backdropUrl = content.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${content.backdrop_path}`
    : 'https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=1920&h=1080&fit=crop';

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
            <div className="relative h-[60vh] md:h-screen">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${backdropUrl})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
              </div>
              
              <div className="relative z-10 container mx-auto px-3 md:px-4 h-full flex items-end md:items-center">
                <div className="max-w-full md:max-w-2xl pb-4 md:pb-0">
                  <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="text-foreground mb-2 md:mb-4 hover:bg-accent p-1 md:p-2"
                    size="sm"
                  >
                    <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    <span className="text-xs md:text-sm">Back</span>
                  </Button>
                  
                  <h1 className="text-2xl md:text-5xl lg:text-7xl font-bold text-foreground mb-2 md:mb-6 leading-tight">
                    {getDisplayTitle()}
                  </h1>

                  {/* Show episode/season info for TV shows */}
                  {type === 'tv' && season && episode && (
                    <div className="mb-3 md:mb-4">
                      <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                        S{season}E{episode}
                      </span>
                      {shouldResume && (
                        <span className="ml-2 bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-sm">
                          Continue Watching
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 md:gap-6 text-foreground mb-2 md:mb-6 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 md:h-5 md:w-5 text-yellow-400 fill-current" />
                      <span className="text-sm md:text-lg font-semibold">{content.vote_average.toFixed(1)}</span>
                    </div>
                    
                    {releaseDate && (
                      <div className="flex items-center gap-1 md:gap-2">
                        <Calendar className="h-3 w-3 md:h-5 md:w-5" />
                        <span className="text-xs md:text-base">{new Date(releaseDate).getFullYear()}</span>
                      </div>
                    )}
                    
                    {content.runtime && (
                      <div className="flex items-center gap-1 md:gap-2">
                        <Clock className="h-3 w-3 md:h-5 md:w-5" />
                        <span className="text-xs md:text-base">{Math.floor(content.runtime / 60)}h {content.runtime % 60}m</span>
                      </div>
                    )}
                    
                    {content.number_of_seasons && (
                      <div className="flex items-center gap-1 md:gap-2">
                        <Users className="h-3 w-3 md:h-5 md:w-5" />
                        <span className="text-xs md:text-base">{content.number_of_seasons} Season{content.number_of_seasons > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground text-xs md:text-lg leading-relaxed mb-3 md:mb-8 max-w-full md:max-w-xl line-clamp-3 md:line-clamp-none">
                    {content.overview}
                  </p>
                  
                  <div className="flex gap-2 md:gap-4 flex-wrap">
                    <Button 
                      onClick={handleWatch}
                      size="sm"
                      className="bg-primary hover:bg-primary/90 px-3 md:px-8 text-xs md:text-base"
                    >
                      <Play className="h-3 w-3 md:h-5 md:w-5 mr-1 md:mr-2" />
                      {shouldResume ? 'Continue Watching' : 'Watch Now'}
                    </Button>
                    
                    {user && (
                      <Button
                        onClick={handleWatchlistToggle}
                        variant="outline"
                        size="sm"
                        className="border-border text-foreground hover:bg-accent px-3 md:px-6 text-xs md:text-base"
                      >
                        {isInWatchlist(content.id) ? (
                          <>
                            <Check className="h-3 w-3 md:h-5 md:w-5 mr-1 md:mr-2" />
                            <span className="hidden sm:inline">In Watchlist</span>
                            <span className="sm:hidden">Added</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3 md:h-5 md:w-5 mr-1 md:mr-2" />
                            <span className="hidden sm:inline">Add to Watchlist</span>
                            <span className="sm:hidden">Add</span>
                          </>
                        )}
                      </Button>
                    )}

                    <Button
                      onClick={handleShare}
                      variant="outline"
                      size="sm"
                      className="border-border text-foreground hover:bg-accent px-3 md:px-6 text-xs md:text-base"
                    >
                      <Share className="h-3 w-3 md:h-5 md:w-5 mr-1 md:mr-2" />
                      <span className="hidden sm:inline">Share</span>
                    </Button>

                    <Button
                      onClick={handleWatchParty}
                      variant="outline"
                      size="sm"
                      className="border-border text-foreground hover:bg-accent px-3 md:px-6 text-xs md:text-base"
                    >
                      <UserPlus className="h-3 w-3 md:h-5 md:w-5 mr-1 md:mr-2" />
                      <span className="hidden sm:inline">Watch Party</span>
                      <span className="sm:hidden">Party</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            {content.genres && content.genres.length > 0 && (
              <div className="bg-card/80 py-4 md:py-8">
                <div className="container mx-auto px-3 md:px-4">
                  <h3 className="text-foreground text-sm md:text-xl mb-2 md:mb-4 font-semibold">Genres</h3>
                  <div className="flex gap-1 md:gap-2 flex-wrap">
                    {content.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="bg-primary text-primary-foreground px-2 md:px-3 py-1 rounded-full text-xs md:text-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Cast */}
            {content.credits?.cast && content.credits.cast.length > 0 && (
              <div className="bg-card/60 py-4 md:py-8 pb-20 md:pb-8">
                <div className="container mx-auto px-3 md:px-4">
                  <h3 className="text-foreground text-sm md:text-xl mb-2 md:mb-4 font-semibold">Cast</h3>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
                    {content.credits.cast.slice(0, 12).map((actor) => (
                      <div key={actor.id} className="text-center">
                        <img
                          src={actor.profile_path 
                            ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=185&h=278&fit=crop'
                          }
                          alt={actor.name}
                          className="w-full aspect-[2/3] object-cover rounded-lg mb-1 md:mb-2"
                        />
                        <p className="text-foreground text-xs md:text-sm font-medium truncate">{actor.name}</p>
                        <p className="text-muted-foreground text-xs truncate">{actor.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
