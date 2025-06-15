
import React from 'react';
import { Movie } from '@/services/tmdb';

interface DetailPageInfoProps {
  content: Movie;
}

export const DetailPageInfo: React.FC<DetailPageInfoProps> = ({ content }) => {
  return (
    <>
      {/* Genres */}
      {content.genres && content.genres.length > 0 && (
        <div className="bg-card/80 py-4 md:py-8">
          <div className="container mx-auto px-3 md:px-4">
            <h3 className="text-foreground text-sm md:text-xl mb-2 md:mb-4 font-semibold">Genres</h3>
            <div className="flex gap-1 md:gap-2 flex-wrap">
              {content.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="bg-primary text-primary-foreground px-2 md:px-3 py-1 rounded-full text-xs md:text-sm"
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
        <div className="bg-card/60 py-4 md:py-8 pb-20 md:pb-8">
          <div className="container mx-auto px-3 md:px-4">
            <h3 className="text-foreground text-sm md:text-xl mb-2 md:mb-4 font-semibold">Cast</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
              {content.credits.cast.slice(0, 12).map((actor) => (
                <div key={actor.id} className="text-center">
                  <img
                    src={actor.profile_path 
                      ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=185&h=278&fit=crop'
                    }
                    alt={actor.name}
                    className="w-full aspect-[2/3] object-cover rounded-lg mb-1 md:mb-2"
                  />
                  <p className="text-foreground text-xs md:text-sm font-medium truncate">{actor.name}</p>
                  <p className="text-muted-foreground text-xs truncate">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
