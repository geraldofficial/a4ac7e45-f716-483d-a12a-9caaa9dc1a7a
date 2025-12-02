
import React from 'react';
import { ShareModal } from './ShareModal';

interface DetailPageModalsProps {
  showShareModal: boolean;
  showWatchParty: boolean;
  content: any;
  type: 'movie' | 'tv';
  onCloseShare: () => void;
  onCloseWatchParty: () => void;
}

export const DetailPageModals: React.FC<DetailPageModalsProps> = ({
  showShareModal,
  content,
  type,
  onCloseShare,
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
    </>
  );
};
