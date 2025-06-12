
import React from 'react';

interface VideoPlayerProps {
  title: string;
  tmdbId: number;
  type: 'movie' | 'tv';
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ title, tmdbId, type }) => {
  // VidSrc URL construction
  const videoUrl = `https://vidsrc.to/embed/${type}/${tmdbId}`;

  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <iframe
        src={videoUrl}
        title={title}
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        allowFullScreen
        allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
        style={{ border: 'none' }}
      />
    </div>
  );
};
