
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/VideoPlayer';
import { tmdbApi, Movie } from '@/services/tmdb';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Play, Plus, Check, Star, Calendar, Clock, Users, ArrowLeft } from 'lucide-react';

const DetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const { user, addToWatchlist, removeFromWatchlist, isInWatchlist } = useAuth();
  const { toast } = useToast();

  // Determine type from the current route
  const type = location.pathname.startsWith('/movie/') ? 'movie' : 'tv';

  useEffect(() => {
    if (id) {
      console.log('Fetching content for:', { type, id });
      fetchContent();
    } else {
      console.log('Missing id:', { type, id });
      setLoading(false);
    }
  }, [type, id]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 px-4">
          <div className="container mx-auto text-center">
            <div className="text-foreground text-xl">Loading content...</div>
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
        <div className="pt-24 pb-20 px-4">
          <div className="container mx-auto text-center">
            <div className="text-foreground text-xl">Content not found</div>
            <p className="text-muted-foreground mt-2">Type: {type}, ID: {id}</p>
            <Button onClick={() => navigate('/')} className="mt-4">
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-16">
        {/* Hero Section */}
        <div className="relative h-screen">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backdropUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          </div>
          
          <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="text-foreground mb-4 hover:bg-accent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
                {title}
              </h1>
              
              <div className="flex items-center gap-6 text-foreground mb-6">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-semibold">{content.vote_average.toFixed(1)}</span>
                </div>
                
                {releaseDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>{new Date(releaseDate).getFullYear()}</span>
                  </div>
                )}
                
                {content.runtime && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{Math.floor(content.runtime / 60)}h {content.runtime % 60}m</span>
                  </div>
                )}
                
                {content.number_of_seasons && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>{content.number_of_seasons} Season{content.number_of_seasons > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
              
              <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-xl">
                {content.overview}
              </p>
              
              <div className="flex gap-4">
                <Button 
                  onClick={handleWatch}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 px-8"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Watch Now
                </Button>
                
                {user && (
                  <Button
                    onClick={handleWatchlistToggle}
                    variant="outline"
                    size="lg"
                    className="border-border text-foreground hover:bg-accent"
                  >
                    {isInWatchlist(content.id) ? (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        In Watchlist
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5 mr-2" />
                        Add to Watchlist
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Video Player Section */}
        {isPlaying && (
          <div className="bg-card py-8">
            <div className="container mx-auto px-4">
              <VideoPlayer
                title={title}
                tmdbId={content.id}
                type={type}
              />
            </div>
          </div>
        )}

        {/* Additional Info */}
        {content.genres && content.genres.length > 0 && (
          <div className="bg-card/80 py-8">
            <div className="container mx-auto px-4">
              <h3 className="text-foreground text-xl mb-4">Genres</h3>
              <div className="flex gap-2 flex-wrap">
                {content.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm"
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
          <div className="bg-card/60 py-8">
            <div className="container mx-auto px-4">
              <h3 className="text-foreground text-xl mb-4">Cast</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {content.credits.cast.slice(0, 12).map((actor) => (
                  <div key={actor.id} className="text-center">
                    <img
                      src={actor.profile_path 
                        ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=185&h=278&fit=crop'
                      }
                      alt={actor.name}
                      className="w-full aspect-[2/3] object-cover rounded-lg mb-2"
                    />
                    <p className="text-foreground text-sm font-medium">{actor.name}</p>
                    <p className="text-muted-foreground text-xs">{actor.character}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default DetailPage;
