
import React from 'react';
import { ImprovedMovieCard } from './ImprovedMovieCard';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Movie } from '@/services/tmdb';

interface EnhancedMovieRowProps {
  title: string;
  movies: Movie[];
  sectionId: string;
  showScrollButtons?: boolean;
  priority?: boolean;
  showRefresh?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  lastMovieElementRef?: (node: HTMLDivElement) => void;
}

export const EnhancedMovieRow: React.FC<EnhancedMovieRowProps> = ({ 
  title, 
  movies, 
  sectionId, 
  showScrollButtons = true,
  priority = false,
  showRefresh = false,
  refreshing = false,
  onRefresh,
  lastMovieElementRef
}) => {
  const scrollSection = (direction: 'left' | 'right') => {
    const section = document.getElementById(sectionId);
    if (section) {
      const scrollAmount = window.innerWidth < 768 ? 200 : 400;
      section.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="mb-8 md:mb-12">
      <div className="flex items-center justify-between mb-4 md:mb-6 px-3 md:px-6">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/50 rounded-full"></div>
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {showRefresh && onRefresh && (
            <Button
              onClick={onRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
              className="hidden md:flex"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          {showScrollButtons && (
            <div className="hidden md:flex gap-2">
              <Button
                onClick={() => scrollSection('left')}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => scrollSection('right')}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      <div 
        id={sectionId}
        className="flex gap-3 md:gap-4 lg:gap-6 overflow-x-auto pb-4 px-3 md:px-6 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {movies.map((movie, index) => (
          <div 
            key={movie.id} 
            className="flex-shrink-0 w-32 sm:w-36 md:w-40 lg:w-48 xl:w-52"
            ref={sectionId === 'recommended' && index === movies.length - 1 ? lastMovieElementRef : null}
          >
            <ImprovedMovieCard 
              movie={movie} 
              priority={priority && index < 6}
              variant="default"
            />
          </div>
        ))}
      </div>
    </section>
  );
};
