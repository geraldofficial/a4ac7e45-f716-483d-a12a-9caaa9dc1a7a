
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Trash2, HardDrive } from 'lucide-react';
import { cacheManager } from '@/services/cacheManager';
import { useOffline } from '@/hooks/useOffline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OfflineDownloadsProps {
  movieId?: number;
  movieData?: any;
  type?: 'movie' | 'tv';
}

export const OfflineDownloads: React.FC<OfflineDownloadsProps> = ({
  movieId,
  movieData,
  type = 'movie'
}) => {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cachedMovies, setCachedMovies] = useState<any[]>([]);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const { isOffline } = useOffline();

  useEffect(() => {
    updateCacheData();
  }, []);

  useEffect(() => {
    if (movieId) {
      const cached = cacheManager.getCachedMovie(movieId, type);
      setIsDownloaded(!!cached);
    }
  }, [movieId, type]);

  const updateCacheData = () => {
    setCachedMovies(cacheManager.getCachedMovies());
    setCacheStats(cacheManager.getCacheStats());
  };

  const handleDownload = async () => {
    if (!movieData || !movieId) return;

    setIsDownloading(true);
    try {
      await cacheManager.cacheMovie(movieData, type);
      setIsDownloaded(true);
      updateCacheData();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRemove = async (id: number, itemType: 'movie' | 'tv') => {
    cacheManager.removeCachedMovie(id, itemType);
    if (id === movieId && itemType === type) {
      setIsDownloaded(false);
    }
    updateCacheData();
  };

  const handleClearAll = async () => {
    await cacheManager.clearCache();
    setIsDownloaded(false);
    updateCacheData();
  };

  // Single movie download button
  if (movieId && movieData) {
    return (
      <div className="flex items-center gap-2">
        {isDownloaded ? (
          <Button
            onClick={() => handleRemove(movieId, type)}
            variant="outline"
            size="sm"
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            <Download className="h-4 w-4 mr-1 fill-current" />
            Downloaded
          </Button>
        ) : (
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            size="sm"
            variant="outline"
          >
            <Download className="h-4 w-4 mr-1" />
            {isDownloading ? 'Downloading...' : 'Download'}
          </Button>
        )}
      </div>
    );
  }

  // Full downloads management interface
  return (
    <div className="space-y-6">
      {/* Cache Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total Items</div>
              <div className="font-semibold">{cacheStats?.totalItems || 0}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Storage Used</div>
              <div className="font-semibold">
                {cacheStats?.totalSize ? (cacheStats.totalSize / 1024).toFixed(1) + ' KB' : '0 KB'}
              </div>
            </div>
            <div className="col-span-2 md:col-span-1">
              <Button
                onClick={handleClearAll}
                variant="outline"
                size="sm"
                className="w-full"
                disabled={!cachedMovies.length}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offline Status */}
      {isOffline && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <p className="text-orange-800 text-sm">
              📴 You're currently offline. Only cached content is available.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Downloaded Movies */}
      <Card>
        <CardHeader>
          <CardTitle>Downloaded Content ({cachedMovies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {cachedMovies.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No downloaded content yet. Download movies and shows for offline viewing.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cachedMovies.map((movie) => (
                <div
                  key={`${movie.id}-${movie.type}`}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <img
                    src={movie.poster_path ? 
                      `https://image.tmdb.org/t/p/w92${movie.poster_path}` : 
                      '/placeholder.svg'
                    }
                    alt={movie.title}
                    className="w-12 h-18 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{movie.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {new Date(movie.cached_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleRemove(movie.id, movie.type)}
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
