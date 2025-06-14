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
}

const WATCH_HISTORY_KEY = 'flickpick_watch_history';
const MAX_HISTORY_ITEMS = 50;

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
        lastWatched: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        // Update existing item
        history[existingIndex] = newItem;
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

  updateProgress(tmdbId: number, type: 'movie' | 'tv', progress: number, season?: number, episode?: number): void {
    try {
      const history = this.getHistory();
      const itemIndex = history.findIndex(
        h => h.tmdbId === tmdbId && 
             h.type === type && 
             h.season === season && 
             h.episode === episode
      );

      if (itemIndex >= 0) {
        history[itemIndex].progress = progress;
        history[itemIndex].lastWatched = new Date().toISOString();
        localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(history));
      }
    } catch (error) {
      console.error('Error updating watch progress:', error);
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
  }
};
