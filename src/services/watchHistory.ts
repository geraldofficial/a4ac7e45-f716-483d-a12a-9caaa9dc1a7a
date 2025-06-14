export interface WatchHistoryItem {
  id: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path?: string;
  season?: number;
  episode?: number;
  progress: number; // Progress in seconds
  duration?: number; // Total duration in seconds
  lastWatched: string;
  backdrop_path?: string;
  // Enhanced fields
  watchCount?: number; // Track how many times watched
  completed?: boolean; // Mark as completed when progress >= 90%
  rating?: number; // User rating (1-5 stars)
}

const WATCH_HISTORY_KEY = 'flickpick_watch_history';
const MAX_HISTORY_ITEMS = 50;
const COMPLETION_THRESHOLD = 0.9; // 90% completion

export const watchHistoryService = {
  getHistory(): WatchHistoryItem[] {
    try {
      const history = localStorage.getItem(WATCH_HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error loading watch history:', error);
      return [];
    }
  },

  // Enhanced: Get history with sorting and filtering options
  getFilteredHistory(options: {
    type?: 'movie' | 'tv';
    completed?: boolean;
    sortBy?: 'lastWatched' | 'progress' | 'title' | 'rating';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
  } = {}): WatchHistoryItem[] {
    let history = this.getHistory();

    // Apply filters
    if (options.type) {
      history = history.filter(item => item.type === options.type);
    }
    
    if (typeof options.completed === 'boolean') {
      history = history.filter(item => !!item.completed === options.completed);
    }

    // Apply sorting
    if (options.sortBy) {
      history.sort((a, b) => {
        let aValue: any = a[options.sortBy!];
        let bValue: any = b[options.sortBy!];

        // Handle different data types
        if (options.sortBy === 'lastWatched') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        } else if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return options.sortOrder === 'desc' ? 1 : -1;
        if (aValue > bValue) return options.sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }

    // Apply limit
    if (options.limit) {
      history = history.slice(0, options.limit);
    }

    return history;
  },

  addToHistory(item: Omit<WatchHistoryItem, 'id' | 'lastWatched'>): void {
    try {
      const history = this.getHistory();
      const existingIndex = history.findIndex(
        h => h.tmdbId === item.tmdbId && 
             h.type === item.type && 
             h.season === item.season && 
             h.episode === item.episode
      );

      const newItem: WatchHistoryItem = {
        ...item,
        id: `${item.tmdbId}-${item.type}-${item.season || 0}-${item.episode || 0}`,
        lastWatched: new Date().toISOString(),
        watchCount: 1,
        completed: item.duration ? (item.progress / item.duration) >= COMPLETION_THRESHOLD : false
      };

      if (existingIndex >= 0) {
        // Update existing item, preserve watch count and rating
        const existing = history[existingIndex];
        newItem.watchCount = (existing.watchCount || 0) + 1;
        newItem.rating = existing.rating; // Preserve user rating
        history[existingIndex] = newItem;
        
        // Move to front if recently watched
        const updatedItem = history.splice(existingIndex, 1)[0];
        history.unshift(updatedItem);
      } else {
        // Add new item at the beginning
        history.unshift(newItem);
      }

      // Keep only the most recent items
      const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Error saving to watch history:', error);
    }
  },

  updateProgress(tmdbId: number, type: 'movie' | 'tv', progress: number, season?: number, episode?: number, duration?: number): void {
    try {
      const history = this.getHistory();
      const itemIndex = history.findIndex(
        h => h.tmdbId === tmdbId && 
             h.type === type && 
             h.season === season && 
             h.episode === episode
      );

      if (itemIndex >= 0) {
        const item = history[itemIndex];
        item.progress = progress;
        item.lastWatched = new Date().toISOString();
        
        // Update duration if provided
        if (duration) {
          item.duration = duration;
        }
        
        // Update completion status
        if (item.duration) {
          item.completed = (progress / item.duration) >= COMPLETION_THRESHOLD;
        }

        localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(history));
      }
    } catch (error) {
      console.error('Error updating watch progress:', error);
    }
  },

  // Enhanced: Set user rating for an item
  setRating(id: string, rating: number): void {
    try {
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const history = this.getHistory();
      const itemIndex = history.findIndex(item => item.id === id);
      
      if (itemIndex >= 0) {
        history[itemIndex].rating = rating;
        localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(history));
      }
    } catch (error) {
      console.error('Error setting rating:', error);
    }
  },

  // Enhanced: Get statistics
  getStats(): {
    totalItems: number;
    totalWatchTime: number; // in seconds
    completedItems: number;
    movieCount: number;
    tvShowCount: number;
    averageRating?: number;
    topRatedItems: WatchHistoryItem[];
  } {
    try {
      const history = this.getHistory();
      const totalWatchTime = history.reduce((total, item) => total + (item.progress || 0), 0);
      const completedItems = history.filter(item => item.completed).length;
      const movieCount = history.filter(item => item.type === 'movie').length;
      const tvShowCount = history.filter(item => item.type === 'tv').length;
      
      const ratedItems = history.filter(item => item.rating);
      const averageRating = ratedItems.length > 0 
        ? ratedItems.reduce((sum, item) => sum + (item.rating || 0), 0) / ratedItems.length
        : undefined;

      const topRatedItems = history
        .filter(item => item.rating && item.rating >= 4)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 10);

      return {
        totalItems: history.length,
        totalWatchTime,
        completedItems,
        movieCount,
        tvShowCount,
        averageRating,
        topRatedItems
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalItems: 0,
        totalWatchTime: 0,
        completedItems: 0,
        movieCount: 0,
        tvShowCount: 0,
        topRatedItems: []
      };
    }
  },

  // Enhanced: Search history
  searchHistory(query: string): WatchHistoryItem[] {
    try {
      const history = this.getHistory();
      const lowerQuery = query.toLowerCase();
      
      return history.filter(item => 
        item.title.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('Error searching history:', error);
      return [];
    }
  },

  // Enhanced: Export history (useful for data portability)
  exportHistory(): string {
    try {
      const history = this.getHistory();
      return JSON.stringify(history, null, 2);
    } catch (error) {
      console.error('Error exporting history:', error);
      return '[]';
    }
  },

  // Enhanced: Import history (with validation)
  importHistory(jsonData: string): boolean {
    try {
      const importedHistory = JSON.parse(jsonData) as WatchHistoryItem[];
      
      // Validate structure
      if (!Array.isArray(importedHistory)) {
        throw new Error('Invalid data format');
      }

      // Basic validation of required fields
      const isValid = importedHistory.every(item => 
        item.id && item.tmdbId && item.type && item.title && item.progress !== undefined
      );

      if (!isValid) {
        throw new Error('Invalid history item structure');
      }

      localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(importedHistory));
      return true;
    } catch (error) {
      console.error('Error importing history:', error);
      return false;
    }
  },

  removeFromHistory(id: string): void {
    try {
      const history = this.getHistory();
      const filteredHistory = history.filter(item => item.id !== id);
      localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error('Error removing from watch history:', error);
    }
  },

  clearHistory(): void {
    try {
      localStorage.removeItem(WATCH_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing watch history:', error);
    }
  },

  // Enhanced: Clear old items (older than specified days)
  clearOldHistory(daysOld: number = 30): number {
    try {
      const history = this.getHistory();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const filteredHistory = history.filter(item => 
        new Date(item.lastWatched) > cutoffDate
      );
      
      const removedCount = history.length - filteredHistory.length;
      localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(filteredHistory));
      
      return removedCount;
    } catch (error) {
      console.error('Error clearing old history:', error);
      return 0;
    }
  }
};
