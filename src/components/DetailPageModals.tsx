import React from 'react';
import { ShareModal } from './ShareModal';

interface DetailPageModalsProps {
  showShareModal: boolean;
  content: any;
  type: 'movie' | 'tv';
  onCloseShare: () => void;
}

export const DetailPageModals: React.FC<DetailPageModalsProps> = ({
  showShareModal,
  content,
  type,
  onCloseShare,
}) => {
  const shareableContent = {
    id: content?.id || 0,
    title: content?.title || content?.name || 'Unknown Title',
    type: type,
    poster_path: content?.poster_path,
    description: content?.overview
  };

  return (
    <>
      {showShareModal && (
        <ShareModal
          content={shareableContent}
          onClose={onCloseShare}
        />
      )}
    </>
  );
};
