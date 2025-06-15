
import React from 'react';
import { ShareModal } from './ShareModal';
import { FullyFunctionalWatchParty } from './FullyFunctionalWatchParty';

interface DetailPageModalsProps {
  showShareModal: boolean;
  showWatchParty: boolean;
  content: any;
  type: 'movie' | 'tv';
  onCloseShare: () => void;
  onCloseWatchParty: () => void;
  currentPlaybackTime?: number;
  isCurrentlyPlaying?: boolean;
  videoDuration?: number;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  onSeek?: (time: number) => void;
  onPlayPause?: () => void;
  onPlaybackSync?: (data: { position: number; isPlaying: boolean; timestamp: string }) => void;
}

export const DetailPageModals: React.FC<DetailPageModalsProps> = ({
  showShareModal,
  showWatchParty,
  content,
  type,
  onCloseShare,
  onCloseWatchParty,
  currentPlaybackTime,
  isCurrentlyPlaying,
  videoDuration,
  volume,
  onVolumeChange,
  onSeek,
  onPlayPause,
  onPlaybackSync
}) => {
  // Create ShareableContent object for ShareModal
  const shareableContent = {
    id: content?.id || 0,
    title: content?.title || content?.name || 'Unknown Title',
    type: type,
    poster_path: content?.poster_path,
    description: content?.overview
  };

  return (
    <>
      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          content={shareableContent}
          onClose={onCloseShare}
        />
      )}

      {/* Watch Party */}
      {showWatchParty && (
        <FullyFunctionalWatchParty
          movieId={content.id}
          movieTitle={shareableContent.title}
          movieType={type}
          onClose={onCloseWatchParty}
          currentPlaybackTime={currentPlaybackTime}
          isCurrentlyPlaying={isCurrentlyPlaying}
          videoDuration={videoDuration}
          volume={volume}
          onVolumeChange={onVolumeChange}
          onSeek={onSeek}
          onPlayPause={onPlayPause}
          onPlaybackSync={onPlaybackSync}
        />
      )}
    </>
  );
};
