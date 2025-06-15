
import React, { useState } from 'react';
import { Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TrailerPlayerProps {
  videoKey: string;
  title: string;
  backdropPath?: string;
  onClose?: () => void;
}

export const TrailerPlayer: React.FC<TrailerPlayerProps> = ({ 
  videoKey, 
  title, 
  backdropPath,
  onClose 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const backdropUrl = backdropPath 
    ? `https://image.tmdb.org/t/p/original${backdropPath}`
    : 'https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=1920&h=1080&fit=crop';

  if (!isPlaying) {
    return (
      <div 
        className="relative w-full h-full bg-cover bg-center cursor-pointer group"
        style={{ backgroundImage: `url(${backdropUrl})` }}
        onClick={() => setIsPlaying(true)}
      >
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white rounded-full w-20 h-20 p-0 shadow-2xl group-hover:scale-110 transition-transform"
          >
            <Play className="h-8 w-8 ml-1" />
          </Button>
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <p className="text-sm opacity-80">Click to play trailer</p>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70 rounded-full w-10 h-10 p-0"
        >
          <X className="h-5 w-5" />
        </Button>
      )}
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`}
        title={`${title} Trailer`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};
