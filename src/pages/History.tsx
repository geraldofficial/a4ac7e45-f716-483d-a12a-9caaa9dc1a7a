
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { watchHistoryService, WatchHistoryItem } from '@/services/watchHistory';
import { Clock, Play, Trash2, Calendar, Filter, Star, MoreHorizontal, Share, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';

const History = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'lastWatched' | 'progress' | 'title'>('lastWatched');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [filter, sortBy]);

  const loadHistory = () => {
    setIsLoading(true);
    try {
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
    } catch (error) {
      console.error('Error loading history:', error);
      toast({
        title: "Error loading history",
        description: "Failed to load your watch history.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueWatching = (item: WatchHistoryItem) => {
    // Navigate directly to the video player with resume parameter
    const route = `/${item.type}/${item.tmdbId}?watch=true&resume=true${item.season && item.episode ? `&season=${item.season}&episode=${item.episode}` : ''}`;
    navigate(route);
  };

  const handleViewDetails = (item: WatchHistoryItem) => {
    const route = `/${item.type}/${item.tmdbId}`;
    navigate(route);
  };

  const handleRemove = (id: string, title: string) => {
    watchHistoryService.removeFromHistory(id);
    loadHistory();
    toast({
      title: "Removed from history",
      description: `"${title}" has been removed from your watch history.`,
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
    
    let timeString = '';
    if (hours > 0) timeString += `${hours}h `;
    timeString += `${minutes}m`;
    
    if (duration && duration > 0) {
      const percentage = Math.round((progress / duration) * 100);
      return `${timeString} (${percentage}%)`;
    }
    
    return timeString;
  };

  const getProgressPercentage = (progress: number, duration?: number) => {
    if (!duration || duration === 0) return 0;
    return Math.min((progress / duration) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-primary';
  };

  const formatTimeRemaining = (progress: number, duration?: number) => {
    if (!duration || duration <= progress) return '';
    
    const remaining = duration - progress;
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Sign in required</h1>
            <p className="text-muted-foreground mb-6">Please sign in to view your watch history.</p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-16 md:pt-24 pb-20 px-3 md:px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">
                My Watch History
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                {history.length > 0 
                  ? `${history.length} item${history.length === 1 ? '' : 's'} • Continue watching from where you left off`
                  : 'Start watching to build your history'
                }
              </p>
            </div>
            {history.length > 0 && (
              <Button 
                variant="outline" 
                onClick={handleClearAll}
                className="text-xs md:text-sm hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
              >
                <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {/* Enhanced Filters */}
          {history.length > 0 && (
            <div className="flex gap-3 mb-8 flex-wrap items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filter:</span>
              </div>
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Content</SelectItem>
                  <SelectItem value="movie">Movies</SelectItem>
                  <SelectItem value="tv">TV Shows</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastWatched">Recently Watched</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>

              <Badge variant="secondary" className="ml-auto">
                {filter === 'all' ? 'All' : filter === 'movie' ? 'Movies' : filter === 'tv' ? 'TV Shows' : 'Completed'} • {history.length}
              </Badge>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card/50 rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <Clock className="h-20 w-20 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-foreground mb-3">No watch history yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start watching movies and TV shows to see your history here. Your progress will be automatically saved.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => navigate('/')} size="lg">
                    Browse Movies
                  </Button>
                  <Button onClick={() => navigate('/trending')} variant="outline" size="lg">
                    Trending Now
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item) => {
                const progressPercentage = getProgressPercentage(item.progress, item.duration);
                const progressColor = getProgressColor(progressPercentage);
                
                return (
                  <div
                    key={item.id}
                    className="group bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden hover:bg-card/90 hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                  >
                    <div className="relative aspect-video cursor-pointer" onClick={() => handleViewDetails(item)}>
                      <img
                        src={
                          item.backdrop_path
                            ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}`
                            : item.poster_path
                            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                            : 'https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=500&h=281&fit=crop'
                        }
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Enhanced Progress bar */}
                      {item.duration && (
                        <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/40">
                          <div 
                            className={`h-full transition-all duration-300 ${progressColor}`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      )}

                      {/* Content type badge */}
                      <div className="absolute top-3 left-3">
                        <Badge variant={item.type === 'movie' ? 'default' : 'secondary'} className="text-xs">
                          {item.type === 'movie' ? 'Movie' : 'TV Show'}
                        </Badge>
                      </div>

                      {/* Completion badge */}
                      {item.completed && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-green-500 text-white text-xs">
                            ✓ Completed
                          </Badge>
                        </div>
                      )}
                      
                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                        <Button
                          size="lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContinueWatching(item);
                          }}
                          className="bg-primary/90 backdrop-blur-sm hover:bg-primary text-primary-foreground shadow-lg"
                        >
                          <Play className="h-5 w-5 mr-2" />
                          Continue Watching
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-base line-clamp-2 mb-1 leading-tight">
                            {item.title}
                          </h3>
                          {item.type === 'tv' && item.season && item.episode && (
                            <p className="text-muted-foreground text-sm">
                              Season {item.season}, Episode {item.episode}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 ml-2"
                          onClick={() => handleRemove(item.id, item.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Progress information */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{formatProgress(item.progress, item.duration)}</span>
                        </div>
                        
                        {item.duration && !item.completed && (
                          <div className="text-sm text-primary font-medium">
                            {formatTimeRemaining(item.progress, item.duration)}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Watched {new Date(item.lastWatched).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleContinueWatching(item)}
                          className="flex-1"
                          size="sm"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {item.completed ? 'Watch Again' : 'Continue'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(item)}
                          className="px-3"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default History;
