
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { watchHistoryService, WatchHistoryItem } from '@/services/watchHistory';
import { Play, Clock, Calendar, MoreHorizontal, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const ContinueWatching: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [recentItems, setRecentItems] = useState<WatchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContinueWatching();
  }, [user]);

  const loadContinueWatching = () => {
    setIsLoading(true);
    try {
      const continueWatchingItems = watchHistoryService.getContinueWatching(6);
      setRecentItems(continueWatchingItems);
    } catch (error) {
      console.error('Error loading continue watching:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueWatching = (item: WatchHistoryItem) => {
    // Navigate directly to video player with resume
    const route = `/${item.type}/${item.tmdbId}?watch=true&resume=true${item.season && item.episode ? `&season=${item.season}&episode=${item.episode}` : ''}`;
    navigate(route);
  };

  const handleRemoveItem = (item: WatchHistoryItem, event: React.MouseEvent) => {
    event.stopPropagation();
    watchHistoryService.removeFromHistory(item.id);
    loadContinueWatching();
    toast({
      title: "Removed from continue watching",
      description: `"${item.title}" has been removed.`,
    });
  };

  const formatProgress = (progress: number, duration?: number) => {
    if (duration && duration > 0) {
      const percentage = Math.round((progress / duration) * 100);
      return `${percentage}%`;
    }
    const hours = Math.floor(progress / 3600);
    const minutes = Math.floor((progress % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatTimeRemaining = (progress: number, duration?: number) => {
    if (!duration || duration <= progress) return '';
    
    const remaining = duration - progress;
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getProgressPercentage = (progress: number, duration?: number) => {
    if (!duration || duration === 0) return 0;
    return Math.min((progress / duration) * 100, 100);
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              Continue Watching
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card/50 rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-muted" />
                <div className="p-2 space-y-2">
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-2 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (recentItems.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-3 md:px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            Continue Watching
          </h2>
          <Button
            variant="ghost"
            onClick={() => navigate('/history')}
            className="text-primary hover:text-primary/80"
          >
            View All
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {recentItems.map((item) => {
            const progressPercentage = getProgressPercentage(item.progress, item.duration);
            
            return (
              <div
                key={item.id}
                className="group bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden hover:bg-card/90 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/10 hover:scale-105"
                onClick={() => handleContinueWatching(item)}
              >
                <div className="relative aspect-[3/4]">
                  <img
                    src={
                      item.poster_path
                        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                        : item.backdrop_path
                        ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}`
                        : 'https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=500&h=750&fit=crop'
                    }
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Enhanced Progress bar */}
                  {item.duration && (
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/40">
                      <div 
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  )}

                  {/* Play button with hover effect */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                    <Button
                      size="sm"
                      className="bg-primary/90 backdrop-blur-sm hover:bg-primary h-12 w-12 rounded-full p-0 shadow-lg"
                    >
                      <Play className="h-6 w-6" fill="currentColor" />
                    </Button>
                  </div>

                  {/* Content type and continue badge */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <Badge 
                      variant={item.type === 'movie' ? 'default' : 'secondary'} 
                      className="text-xs"
                    >
                      {item.type === 'movie' ? 'Movie' : 'TV'}
                    </Badge>
                  </div>

                  {/* Remove button */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                      onClick={(e) => handleRemoveItem(item, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-2">
                  <h3 className="font-medium text-foreground text-xs line-clamp-2 mb-1 leading-tight">
                    {item.title}
                  </h3>
                  
                  {item.type === 'tv' && item.season && item.episode && (
                    <p className="text-muted-foreground text-xs mb-1">
                      S{item.season}E{item.episode}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatProgress(item.progress, item.duration)}</span>
                  </div>

                  {/* Time remaining */}
                  {item.duration && (
                    <div className="text-xs text-green-500 font-medium">
                      {formatTimeRemaining(item.progress, item.duration)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
