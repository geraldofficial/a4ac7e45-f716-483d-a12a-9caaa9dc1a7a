
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { tmdbApi, Movie } from '@/services/tmdb';
import { useToast } from '@/hooks/use-toast';

export const useDetailPageState = (id: string | undefined) => {
  const location = useLocation();
  const { toast } = useToast();
  const [content, setContent] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showWatchParty, setShowWatchParty] = useState(false);

  // Determine type from the current route
  const type = location.pathname.startsWith('/movie/') ? 'movie' : 'tv';

  // Parse URL parameters
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
    setShowWatchParty
  };
};
