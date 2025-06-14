
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { watchHistoryService } from '@/services/watchHistory';
import { Play, Clock } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';

export const ContinueWatching = () => {
  const [continueItems, setContinueItems] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadContinueWatching = () => {
      const recentlyWatched = watchHistoryService.getRecentlyWatched(10);
      
      // Filter items that should be resumed (progress > 5% and < 90%)
      const resumeItems = recentlyWatched.filter(item => {
        if (!item.duration) return false;
        const percentage = (item.progress / item.duration) * 100;
        return percentage >= 5 && percentage <= 90;
      });
      
      setContinueItems(resumeItems.slice(0, 6));
    };

    loadContinueWatching();
  }, []);

  if (continueItems.length === 0) return null;

  return (
    <ErrorBoundary>
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="h-6 w-6 text-primary" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Continue Watching</h2>
          </div>
          
          <div className="flex overflow-x-auto space-x-4 scrollbar-hide scroll-smooth pb-4">
            {continueItems.map((item) => {
              const progressPercentage = item.duration 
                ? Math.round((item.progress / item.duration) * 100)
                : 0;

              const imageUrl = item.poster_path || item.backdrop_path
                ? `https://image.tmdb.org/t/p/w500${item.poster_path || item.backdrop_path}`
                : null;

              return (
                <div
                  key={`${item.type}-${item.tmdbId}-${item.season || ''}-${item.episode || ''}`}
                  className="flex-shrink-0 w-48 md:w-56 cursor-pointer group"
                  onClick={() => {
                    const mediaType = item.type;
                    navigate(`/${mediaType}/${item.tmdbId}`);
                  }}
                >
                  <div className="relative overflow-hidden rounded-lg bg-gray-800">
                    <div className="aspect-video relative">
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
                      
                      {/* Progress Bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      
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
                        {item.type === 'tv' && item.season && item.episode && (
                          <span className="text-muted-foreground ml-1">
                            S{item.season}E{item.episode}
                          </span>
                        )}
                      </h3>
                      <p className="text-muted-foreground text-xs mt-1">
                        {progressPercentage}% watched
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
