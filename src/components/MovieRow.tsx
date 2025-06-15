
import React from 'react';
import { ImprovedMovieCard } from './ImprovedMovieCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '@/services/tmdb';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  sectionId: string;
  showScrollButtons?: boolean;
  priority?: boolean;
}

export const MovieRow: React.FC<MovieRowProps> = ({ 
  title, 
  movies, 
  sectionId, 
  showScrollButtons = true,
  priority = false
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
        {showScrollButtons && (
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scrollSection('left')}
              className="p-1.5 rounded-full bg-card/80 hover:bg-card border border-border hover:border-primary/50 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button
              onClick={() => scrollSection('right')}
              className="p-1.5 rounded-full bg-card/80 hover:bg-card border border-border hover:border-primary/50 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>
          </div>
        )}
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
