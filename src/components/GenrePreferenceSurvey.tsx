
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
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">What are your favorite movie genres?</h3>
        <p className="text-white/70 text-sm">Select at least 3 genres to get personalized recommendations</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {movieGenres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => toggleGenre(genre.id)}
            className={`
              relative p-4 rounded-xl border-2 text-sm font-medium transition-all duration-300
              hover:scale-105 min-h-[60px] flex items-center justify-center
              backdrop-blur-sm shadow-lg hover:shadow-xl
              ${selectedGenres.includes(genre.id)
                ? 'border-purple-400 bg-purple-500/30 text-white shadow-purple-500/25'
                : 'border-white/20 bg-white/10 text-white hover:border-purple-400/50 hover:bg-white/15'
              }
            `}
          >
            {genre.name}
            {selectedGenres.includes(genre.id) && (
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center border-3 border-white shadow-lg animate-scale-in">
                <Check className="w-4 h-4 text-white font-bold" strokeWidth={3} />
              </div>
            )}
          </button>
        ))}
      </div>
      
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
          <div className={`w-2 h-2 rounded-full ${selectedGenres.length >= 3 ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
          <span className="text-white text-sm font-medium">
            Selected: {selectedGenres.length} genre{selectedGenres.length !== 1 ? 's' : ''}
          </span>
          {selectedGenres.length < 3 && (
            <span className="text-yellow-300 text-sm">
              (Need {3 - selectedGenres.length} more)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
