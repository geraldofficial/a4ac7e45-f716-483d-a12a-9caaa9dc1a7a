
import React from 'react';

interface GenrePreferenceSurveyProps {
  selectedGenres: number[];
  onGenresChange: (genres: number[]) => void;
}

const genres = [
  { id: 28, name: 'Action', emoji: '🎬' },
  { id: 12, name: 'Adventure', emoji: '🗺️' },
  { id: 16, name: 'Animation', emoji: '🎨' },
  { id: 35, name: 'Comedy', emoji: '😂' },
  { id: 80, name: 'Crime', emoji: '🕵️' },
  { id: 99, name: 'Documentary', emoji: '📹' },
  { id: 18, name: 'Drama', emoji: '🎭' },
  { id: 10751, name: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { id: 14, name: 'Fantasy', emoji: '🧙‍♂️' },
  { id: 36, name: 'History', emoji: '📜' },
  { id: 27, name: 'Horror', emoji: '👻' },
  { id: 10402, name: 'Music', emoji: '🎵' },
  { id: 9648, name: 'Mystery', emoji: '🔍' },
  { id: 10749, name: 'Romance', emoji: '💕' },
  { id: 878, name: 'Sci-Fi', emoji: '🚀' },
  { id: 53, name: 'Thriller', emoji: '😱' },
  { id: 10752, name: 'War', emoji: '⚔️' },
  { id: 37, name: 'Western', emoji: '🤠' },
];

export const GenrePreferenceSurvey: React.FC<GenrePreferenceSurveyProps> = ({
  selectedGenres,
  onGenresChange,
}) => {
  const toggleGenre = (genreId: number) => {
    if (selectedGenres.includes(genreId)) {
      onGenresChange(selectedGenres.filter(id => id !== genreId));
    } else {
      onGenresChange([...selectedGenres, genreId]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <p className="text-white/70 text-sm">
          Select at least 3 genres you enjoy watching
        </p>
        <p className="text-white/50 text-xs mt-1">
          {selectedGenres.length}/3 minimum selected
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
        {genres.map((genre) => {
          const isSelected = selectedGenres.includes(genre.id);
          
          return (
            <button
              key={genre.id}
              onClick={() => toggleGenre(genre.id)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-purple-500 bg-purple-500/20 text-white'
                  : 'border-white/20 bg-white/5 text-white/70 hover:border-purple-500/50 hover:bg-purple-500/10'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{genre.emoji}</span>
                <span className="font-medium text-sm">{genre.name}</span>
              </div>
            </button>
          );
        })}
      </div>

      {selectedGenres.length < 3 && (
        <div className="text-center text-orange-400 text-sm">
          Please select at least 3 genres to continue
        </div>
      )}
    </div>
  );
};
