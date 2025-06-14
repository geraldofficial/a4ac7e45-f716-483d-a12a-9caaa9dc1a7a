
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { watchHistoryService } from '@/services/watchHistory';
import { History, Play } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';

export const RecentlyWatched = () => {
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRecentlyWatched = () => {
      const recent = watchHistoryService.getRecentlyWatched(8);
      setRecentItems(recent);
    };

    loadRecentlyWatched();
  }, []);

  if (recentItems.length === 0) return null;

  return (
    <ErrorBoundary>
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <History className="h-6 w-6 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Recently Watched</h2>
          </div>
          
          <div className="flex overflow-x-auto space-x-4 scrollbar-hide scroll-smooth pb-4">
            {recentItems.map((item) => {
              const imageUrl = item.poster_path
                ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
                : null;

              const formatDate = (timestamp: number) => {
                const date = new Date(timestamp);
                const now = new Date();
                const diffMs = now.getTime() - date.getTime();
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                
                if (diffDays === 0) return 'Today';
                if (diffDays === 1) return 'Yesterday';
                if (diffDays < 7) return `${diffDays} days ago`;
                return date.toLocaleDateString();
              };

              return (
                <div
                  key={`${item.type}-${item.tmdbId}-${item.season || ''}-${item.episode || ''}`}
                  className="flex-shrink-0 w-40 md:w-48 cursor-pointer group"
                  onClick={() => {
                    navigate(`/${item.type}/${item.tmdbId}`);
                  }}
                >
                  <div className="relative overflow-hidden rounded-lg bg-gray-800">
                    <div className="aspect-[2/3] relative">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <Play className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Play Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity duration-300">
                        <div className="bg-white rounded-full p-3 shadow-lg">
                          <Play className="h-6 w-6 text-black fill-current" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <h3 className="text-foreground font-medium text-sm line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-xs mt-1">
                        {formatDate(item.lastWatched)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
};
