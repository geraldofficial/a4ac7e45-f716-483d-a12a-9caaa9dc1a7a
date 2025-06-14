
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { watchHistoryService, WatchHistoryItem } from '@/services/watchHistory';
import { Play, Clock, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const RecentlyWatched: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentItems, setRecentItems] = useState<WatchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecentlyWatched();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadRecentlyWatched = () => {
    setIsLoading(true);
    try {
      const recentHistory = watchHistoryService.getFilteredHistory({
        sortBy: 'lastWatched',
        sortOrder: 'desc',
        limit: 8
      });
      setRecentItems(recentHistory);
    } catch (error) {
      console.error('Error loading recently watched:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueWatching = (item: WatchHistoryItem) => {
    const route = `/${item.type}/${item.tmdbId}?watch=true&resume=true${item.season && item.episode ? `&season=${item.season}&episode=${item.episode}` : ''}`;
    navigate(route);
  };

  const handleViewDetails = (item: WatchHistoryItem) => {
    const route = `/${item.type}/${item.tmdbId}`;
    navigate(route);
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

  const getProgressPercentage = (progress: number, duration?: number) => {
    if (!duration || duration === 0) return 0;
    return Math.min((progress / duration) * 100, 100);
  };

  if (!user || recentItems.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-3 md:px-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
            Recently Watched
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
            {[...Array(8)].map((_, i) => (
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

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-3 md:px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            Recently Watched
          </h2>
          <Button
            variant="ghost"
            onClick={() => navigate('/history')}
            className="text-primary hover:text-primary/80"
          >
            View All
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
          {recentItems.map((item) => {
            const progressPercentage = getProgressPercentage(item.progress, item.duration);
            
            return (
              <div
                key={item.id}
                className="group bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden hover:bg-card/90 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/10 hover:scale-105"
                onClick={() => handleViewDetails(item)}
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
                  
                  {/* Progress bar */}
                  {item.duration && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
                      <div 
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  )}

                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                    <Button
                      size="sm"
                      className="bg-primary/90 backdrop-blur-sm hover:bg-primary h-10 w-10 rounded-full p-0 shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContinueWatching(item);
                      }}
                    >
                      <Play className="h-4 w-4" fill="currentColor" />
                    </Button>
                  </div>

                  {/* Content type badge */}
                  <div className="absolute top-2 left-2">
                    <Badge 
                      variant={item.type === 'movie' ? 'default' : 'secondary'} 
                      className="text-xs"
                    >
                      {item.type === 'movie' ? 'Movie' : 'TV'}
                    </Badge>
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
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatProgress(item.progress, item.duration)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
