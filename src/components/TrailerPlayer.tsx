
import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
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
  const [isMuted, setIsMuted] = useState(true); // Start muted for better UX
  
  return (
    <div className="relative w-full h-full">
      {/* Mute/Unmute Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70 rounded-full w-12 h-12 p-0 backdrop-blur-sm"
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </Button>

      {/* Auto-playing trailer */}
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${videoKey}&iv_load_policy=3&fs=0&disablekb=1`}
        title={`${title} Trailer`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={false}
        style={{
          pointerEvents: 'none', // Disable interaction with the iframe content
        }}
      />
      
      {/* Overlay to prevent clicking on the video */}
      <div 
        className="absolute inset-0 z-5"
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};
