
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { watchHistoryService, WatchHistoryItem } from '@/services/watchHistory';
import { Play, Clock, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const ContinueWatching: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentItems, setRecentItems] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    if (user) {
      // Get the most recent 6 items that have some progress
      const history = watchHistoryService.getFilteredHistory({
        sortBy: 'lastWatched',
        sortOrder: 'desc',
        limit: 6
      }).filter(item => item.progress > 0);
      
      setRecentItems(history);
    }
  }, [user]);

  const handleContinueWatching = (item: WatchHistoryItem) => {
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

  if (!user || recentItems.length === 0) {
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
          {recentItems.map((item) => (
            <div
              key={item.id}
              className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-xl overflow-hidden hover:bg-card/90 transition-all duration-300 cursor-pointer"
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
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Progress bar */}
                {item.duration && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${Math.min((item.progress / item.duration) * 100, 100)}%` }}
                    />
                  </div>
                )}

                <Button
                  size="sm"
                  className="absolute bottom-2 right-2 bg-primary/90 backdrop-blur-sm hover:bg-primary h-6 px-2"
                >
                  <Play className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="p-2">
                <h3 className="font-medium text-foreground text-xs line-clamp-2 mb-1">
                  {item.title}
                  {item.type === 'tv' && item.season && item.episode && (
                    <span className="text-muted-foreground text-xs block">
                      S{item.season}E{item.episode}
                    </span>
                  )}
                </h3>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatProgress(item.progress, item.duration)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
