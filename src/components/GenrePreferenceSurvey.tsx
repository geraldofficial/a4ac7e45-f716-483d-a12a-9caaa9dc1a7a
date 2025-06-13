
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface GenrePreferenceSurveyProps {
  selectedGenres: number[];
  onGenresChange: (genres: number[]) => void;
  className?: string;
}

const movieGenres = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
];

export const GenrePreferenceSurvey: React.FC<GenrePreferenceSurveyProps> = ({
  selectedGenres,
  onGenresChange,
  className = ''
}) => {
  const toggleGenre = (genreId: number) => {
    if (selectedGenres.includes(genreId)) {
      onGenresChange(selectedGenres.filter(id => id !== genreId));
    } else {
      onGenresChange([...selectedGenres, genreId]);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">What are your favorite movie genres?</h3>
        <p className="text-sm text-muted-foreground">Select at least 3 genres to get personalized recommendations</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {movieGenres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => toggleGenre(genre.id)}
            className={`
              relative p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200
              hover:scale-105 min-h-[50px] flex items-center justify-center
              ${selectedGenres.includes(genre.id)
                ? 'border-primary bg-primary/20 text-primary'
                : 'border-border text-foreground hover:border-primary/50'
              }
            `}
          >
            {genre.name}
            {selectedGenres.includes(genre.id) && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
          </button>
        ))}
      </div>
      
      <div className="text-sm text-muted-foreground">
        Selected: {selectedGenres.length} genre{selectedGenres.length !== 1 ? 's' : ''}
        {selectedGenres.length < 3 && (
          <span className="text-yellow-500 ml-2">
            (Select at least {3 - selectedGenres.length} more)
          </span>
        )}
      </div>
    </div>
  );
};
