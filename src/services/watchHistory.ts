interface WatchHistoryItem {
  tmdbId: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path?: string;
  backdrop_path?: string;
  season?: number;
  episode?: number;
  progress: number;
  duration?: number;
  lastWatched: number;
  lastSource?: string;
}

interface ResumeInfo {
  shouldResume: boolean;
  progress: number;
  percentage: number;
}

class WatchHistoryService {
  private readonly STORAGE_KEY = 'flickpick_watch_history';
  private readonly MAX_HISTORY_ITEMS = 50;

  private getHistory(): WatchHistoryItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading watch history:', error);
      return [];
    }
  }

  private saveHistory(history: WatchHistoryItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving watch history:', error);
    }
  }

  private getItemKey(tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number): string {
    if (type === 'tv' && season && episode) {
      return `${type}-${tmdbId}-s${season}e${episode}`;
    }
    return `${type}-${tmdbId}`;
  }

  addToHistory(item: Omit<WatchHistoryItem, 'lastWatched'>): void {
    const history = this.getHistory();
    const itemKey = this.getItemKey(item.tmdbId, item.type, item.season, item.episode);
    
    // Remove existing item if it exists
    const filteredHistory = history.filter(historyItem => 
      this.getItemKey(historyItem.tmdbId, historyItem.type, historyItem.season, historyItem.episode) !== itemKey
    );

    // Add new item at the beginning
    const newItem: WatchHistoryItem = {
      ...item,
      lastWatched: Date.now()
    };

    filteredHistory.unshift(newItem);

    // Keep only the most recent items
    const trimmedHistory = filteredHistory.slice(0, this.MAX_HISTORY_ITEMS);
    
    this.saveHistory(trimmedHistory);
  }

  updateProgress(tmdbId: number, type: 'movie' | 'tv', progress: number, season?: number, episode?: number): void {
    const history = this.getHistory();
    const itemKey = this.getItemKey(tmdbId, type, season, episode);
    
    const item = history.find(historyItem => 
      this.getItemKey(historyItem.tmdbId, historyItem.type, historyItem.season, historyItem.episode) === itemKey
    );

    if (item) {
      item.progress = progress;
      item.lastWatched = Date.now();
      this.saveHistory(history);
    }
  }

  getResumeInfo(tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number): ResumeInfo {
    const history = this.getHistory();
    const itemKey = this.getItemKey(tmdbId, type, season, episode);
    
    const item = history.find(historyItem => 
      this.getItemKey(historyItem.tmdbId, historyItem.type, historyItem.season, historyItem.episode) === itemKey
    );

    if (!item || item.progress < 30) {
      return { shouldResume: false, progress: 0, percentage: 0 };
    }

    const percentage = item.duration ? (item.progress / item.duration) * 100 : 0;
    
    // Don't resume if progress is less than 5% or more than 90%
    if (percentage < 5 || percentage > 90) {
      return { shouldResume: false, progress: 0, percentage };
    }

    return {
      shouldResume: true,
      progress: item.progress,
      percentage
    };
  }

  getHistory(): WatchHistoryItem[] {
    return this.getHistory();
  }

  getRecentlyWatched(limit: number = 10): WatchHistoryItem[] {
    const history = this.getHistory();
    return history
      .sort((a, b) => b.lastWatched - a.lastWatched)
      .slice(0, limit);
  }

  removeFromHistory(tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number): void {
    const history = this.getHistory();
    const itemKey = this.getItemKey(tmdbId, type, season, episode);
    
    const filteredHistory = history.filter(historyItem => 
      this.getItemKey(historyItem.tmdbId, historyItem.type, historyItem.season, historyItem.episode) !== itemKey
    );
    
    this.saveHistory(filteredHistory);
  }

  clearHistory(): void {
    this.saveHistory([]);
  }
}

export const watchHistoryService = new WatchHistoryService();
