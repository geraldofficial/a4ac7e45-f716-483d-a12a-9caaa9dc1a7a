import React from 'react';
import { Movie } from '@/services/tmdb';

interface DetailPageInfoProps {
  content: Movie;
}

export const DetailPageInfo: React.FC<DetailPageInfoProps> = ({ content }) => {
  return (
    <div className="pb-20 md:pb-8">
      {/* Genres */}
      {content.genres && content.genres.length > 0 && (
        <div className="bg-card/50 py-4">
          <div className="container mx-auto px-4">
            <h3 className="text-foreground text-sm font-semibold mb-2">Genres</h3>
            <div className="flex gap-2 flex-wrap">
              {content.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cast */}
      {content.credits?.cast && content.credits.cast.length > 0 && (
        <div className="bg-card/30 py-4">
          <div className="container mx-auto px-4">
            <h3 className="text-foreground text-sm font-semibold mb-3">Cast</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {content.credits.cast.slice(0, 12).map((actor) => (
                <div key={actor.id} className="text-center">
                  <img
                    src={actor.profile_path 
                      ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=185&h=278&fit=crop'
                    }
                    alt={actor.name}
                    className="w-full aspect-[2/3] object-cover rounded-lg mb-1"
                  />
                  <p className="text-foreground text-xs font-medium truncate">{actor.name}</p>
                  <p className="text-muted-foreground text-[10px] truncate">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
