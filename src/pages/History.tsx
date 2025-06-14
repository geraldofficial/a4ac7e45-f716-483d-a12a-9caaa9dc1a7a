
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { watchHistoryService, WatchHistoryItem } from '@/services/watchHistory';
import { Clock, Play, Trash2, Calendar, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const History = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'lastWatched' | 'progress' | 'title'>('lastWatched');

  useEffect(() => {
    loadHistory();
  }, [filter, sortBy]);

  const loadHistory = () => {
    const options: any = {
      sortBy,
      sortOrder: 'desc' as const
    };

    if (filter === 'movie' || filter === 'tv') {
      options.type = filter;
    } else if (filter === 'completed') {
      options.completed = true;
    }

    const filteredHistory = watchHistoryService.getFilteredHistory(options);
    setHistory(filteredHistory);
  };

  const handleWatch = (item: WatchHistoryItem) => {
    const route = `/${item.type}/${item.tmdbId}`;
    navigate(route);
  };

  const handleRemove = (id: string) => {
    watchHistoryService.removeFromHistory(id);
    loadHistory();
    toast({
      title: "Removed from history",
      description: "Item has been removed from your watch history.",
    });
  };

  const handleClearAll = () => {
    watchHistoryService.clearHistory();
    setHistory([]);
    toast({
      title: "History cleared",
      description: "All items have been removed from your watch history.",
    });
  };

  const formatProgress = (progress: number, duration?: number) => {
    const hours = Math.floor(progress / 3600);
    const minutes = Math.floor((progress % 3600) / 60);
    const seconds = Math.floor(progress % 60);
    
    let timeString = '';
    if (hours > 0) timeString += `${hours}h `;
    if (minutes > 0) timeString += `${minutes}m `;
    if (hours === 0 && minutes === 0) timeString += `${seconds}s`;
    
    if (duration && duration > 0) {
      const percentage = Math.round((progress / duration) * 100);
      timeString += ` (${percentage}%)`;
    }
    
    return timeString;
  };

  const getProgressPercentage = (progress: number, duration?: number) => {
    if (!duration || duration === 0) return 0;
    return Math.min((progress / duration) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-16 md:pt-24 pb-20 px-3 md:px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">
                Watch History
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Continue watching from where you left off
              </p>
            </div>
            {history.length > 0 && (
              <Button 
                variant="outline" 
                onClick={handleClearAll}
                className="text-xs md:text-sm"
              >
                <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {/* Filters */}
          {history.length > 0 && (
            <div className="flex gap-3 mb-6 flex-wrap">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="movie">Movies</SelectItem>
                  <SelectItem value="tv">TV Shows</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastWatched">Recently Watched</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {history.length === 0 ? (
            <div className="text-center py-16">
              <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No watch history</h3>
              <p className="text-muted-foreground">
                Start watching movies and TV shows to see your history here
              </p>
              <Button onClick={() => navigate('/')} className="mt-4">
                Browse Content
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden hover:bg-card/90 transition-all duration-300"
                >
                  <div className="relative aspect-video">
                    <img
                      src={
                        item.backdrop_path
                          ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}`
                          : item.poster_path
                          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                          : 'https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=500&h=281&fit=crop'
                      }
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Progress bar */}
                    {item.duration && (
                      <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/30">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${getProgressPercentage(item.progress, item.duration)}%` }}
                        />
                      </div>
                    )}
                    
                    <Button
                      size="sm"
                      onClick={() => handleWatch(item)}
                      className="absolute bottom-3 right-3 bg-primary/90 backdrop-blur-sm hover:bg-primary"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Continue
                    </Button>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground text-sm md:text-base mb-2 line-clamp-2">
                      {item.title}
                      {item.type === 'tv' && item.season && item.episode && (
                        <span className="text-muted-foreground text-xs ml-2">
                          S{item.season}E{item.episode}
                        </span>
                      )}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Clock className="h-3 w-3" />
                      <span>{formatProgress(item.progress, item.duration)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(item.lastWatched).toLocaleDateString()}</span>
                    </div>
                    
                    {item.completed && (
                      <div className="text-xs text-green-500 mb-2">✓ Completed</div>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(item.id)}
                      className="w-full text-xs hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default History;
