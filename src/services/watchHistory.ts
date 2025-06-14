
export interface WatchHistoryItem {
  id: string;
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
  completed?: boolean;
}

export interface ResumeInfo {
  shouldResume: boolean;
  progress: number;
  percentage: number;
  source?: string;
}

interface GetFilteredHistoryOptions {
  sortBy?: 'lastWatched' | 'progress' | 'title';
  sortOrder?: 'asc' | 'desc';
  type?: 'movie' | 'tv';
  completed?: boolean;
}

class WatchHistoryService {
  private readonly STORAGE_KEY = 'flickpick_watch_history';
  private readonly MAX_HISTORY_ITEMS = 50;

  private getStoredHistory(): WatchHistoryItem[] {
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

  private generateItemId(tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number): string {
    return this.getItemKey(tmdbId, type, season, episode);
  }

  addToHistory(item: Omit<WatchHistoryItem, 'lastWatched' | 'id'>): void {
    const history = this.getStoredHistory();
    const itemId = this.generateItemId(item.tmdbId, item.type, item.season, item.episode);
    
    // Remove existing item if it exists
    const filteredHistory = history.filter(historyItem => historyItem.id !== itemId);

    // Add new item at the beginning
    const newItem: WatchHistoryItem = {
      ...item,
      id: itemId,
      lastWatched: Date.now()
    };

    filteredHistory.unshift(newItem);

    // Keep only the most recent items
    const trimmedHistory = filteredHistory.slice(0, this.MAX_HISTORY_ITEMS);
    
    this.saveHistory(trimmedHistory);
  }

  updateProgress(
    tmdbId: number, 
    type: 'movie' | 'tv', 
    progress: number, 
    season?: number, 
    episode?: number,
    duration?: number,
    source?: string
  ): void {
    const history = this.getStoredHistory();
    const itemId = this.generateItemId(tmdbId, type, season, episode);
    
    const item = history.find(historyItem => historyItem.id === itemId);

    if (item) {
      item.progress = progress;
      item.lastWatched = Date.now();
      if (duration) item.duration = duration;
      if (source) item.lastSource = source;
      
      // Mark as completed if progress is near the end
      if (duration && progress > duration * 0.9) {
        item.completed = true;
      }
      
      this.saveHistory(history);
    }
  }

  getResumeInfo(tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number): ResumeInfo {
    const history = this.getStoredHistory();
    const itemId = this.generateItemId(tmdbId, type, season, episode);
    
    const item = history.find(historyItem => historyItem.id === itemId);

    if (!item || item.progress < 30) {
      return { shouldResume: false, progress: 0, percentage: 0 };
    }

    const percentage = item.duration ? (item.progress / item.duration) * 100 : 0;
    
    // Don't resume if progress is less than 5% or more than 90%
    if (percentage < 5 || percentage > 90) {
      return { shouldResume: false, progress: 0, percentage, source: item.lastSource };
    }

    return {
      shouldResume: true,
      progress: item.progress,
      percentage,
      source: item.lastSource
    };
  }

  getHistory(): WatchHistoryItem[] {
    return this.getStoredHistory();
  }

  getFilteredHistory(options: GetFilteredHistoryOptions = {}): WatchHistoryItem[] {
    let history = this.getStoredHistory();

    // Apply type filter
    if (options.type) {
      history = history.filter(item => item.type === options.type);
    }

    // Apply completed filter
    if (options.completed !== undefined) {
      history = history.filter(item => !!item.completed === options.completed);
    }

    // Apply sorting
    const sortBy = options.sortBy || 'lastWatched';
    const sortOrder = options.sortOrder || 'desc';

    history.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'progress':
          aValue = a.progress;
          bValue = b.progress;
          break;
        case 'lastWatched':
        default:
          aValue = a.lastWatched;
          bValue = b.lastWatched;
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return history;
  }

  getRecentlyWatched(limit: number = 10): WatchHistoryItem[] {
    const history = this.getStoredHistory();
    return history
      .sort((a, b) => b.lastWatched - a.lastWatched)
      .slice(0, limit);
  }

  removeFromHistory(id: string): void {
    const history = this.getStoredHistory();
    const filteredHistory = history.filter(historyItem => historyItem.id !== id);
    this.saveHistory(filteredHistory);
  }

  clearHistory(): void {
    this.saveHistory([]);
  }
}

export const watchHistoryService = new WatchHistoryService();
