
interface CachedMovie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path?: string;
  overview: string;
  cached_at: number;
  type: 'movie' | 'tv';
}

interface CacheStats {
  totalItems: number;
  totalSize: number;
  lastUpdated: number;
}

class CacheManager {
  private readonly CACHE_KEY = 'flickpick-offline-content';
  private readonly MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly MAX_CACHE_SIZE = 100; // Max items

  async cacheMovie(movie: any, type: 'movie' | 'tv' = 'movie'): Promise<void> {
    try {
      const cachedMovies = this.getCachedMovies();
      const cachedMovie: CachedMovie = {
        id: movie.id,
        title: movie.title || movie.name,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        overview: movie.overview,
        cached_at: Date.now(),
        type
      };

      // Remove if already exists
      const filtered = cachedMovies.filter(m => m.id !== movie.id || m.type !== type);
      
      // Add new item at the beginning
      filtered.unshift(cachedMovie);

      // Limit cache size
      const limited = filtered.slice(0, this.MAX_CACHE_SIZE);

      localStorage.setItem(this.CACHE_KEY, JSON.stringify(limited));

      // Cache images
      await this.cacheImages(movie);
    } catch (error) {
      console.error('Error caching movie:', error);
    }
  }

  private async cacheImages(movie: any): Promise<void> {
    if (!('caches' in window)) return;

    try {
      const imageCache = await caches.open('flickpick-images-v1');
      const promises = [];

      if (movie.poster_path) {
        const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        promises.push(imageCache.add(posterUrl));
      }

      if (movie.backdrop_path) {
        const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
        promises.push(imageCache.add(backdropUrl));
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Error caching images:', error);
    }
  }

  getCachedMovies(): CachedMovie[] {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return [];

      const movies: CachedMovie[] = JSON.parse(cached);
      const now = Date.now();

      // Filter out expired items
      return movies.filter(movie => 
        now - movie.cached_at < this.MAX_CACHE_AGE
      );
    } catch (error) {
      console.error('Error retrieving cached movies:', error);
      return [];
    }
  }

  getCachedMovie(id: number, type: 'movie' | 'tv' = 'movie'): CachedMovie | null {
    const cachedMovies = this.getCachedMovies();
    return cachedMovies.find(movie => movie.id === id && movie.type === type) || null;
  }

  removeCachedMovie(id: number, type: 'movie' | 'tv' = 'movie'): void {
    try {
      const cachedMovies = this.getCachedMovies();
      const filtered = cachedMovies.filter(m => m.id !== id || m.type !== type);
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing cached movie:', error);
    }
  }

  async clearCache(): Promise<void> {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      
      if ('caches' in window) {
        const imageCache = await caches.open('flickpick-images-v1');
        await imageCache.clear();
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  getCacheStats(): CacheStats {
    const cachedMovies = this.getCachedMovies();
    
    return {
      totalItems: cachedMovies.length,
      totalSize: new Blob([JSON.stringify(cachedMovies)]).size,
      lastUpdated: cachedMovies.length > 0 ? Math.max(...cachedMovies.map(m => m.cached_at)) : 0
    };
  }

  async isImageCached(imagePath: string): Promise<boolean> {
    if (!('caches' in window)) return false;

    try {
      const imageCache = await caches.open('flickpick-images-v1');
      const response = await imageCache.match(`https://image.tmdb.org/t/p/w500${imagePath}`);
      return !!response;
    } catch {
      return false;
    }
  }
}

export const cacheManager = new CacheManager();
