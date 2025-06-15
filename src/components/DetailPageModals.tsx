
import React from 'react';
import { ShareModal } from './ShareModal';
import { WatchParty } from './WatchParty';

interface DetailPageModalsProps {
  showShareModal: boolean;
  showWatchParty: boolean;
  content: {
    id: number;
    title?: string;
    name?: string;
    poster_path?: string;
    overview?: string;
  };
  type: 'movie' | 'tv';
  onCloseShare: () => void;
  onCloseWatchParty: () => void;
}

export const DetailPageModals: React.FC<DetailPageModalsProps> = ({
  showShareModal,
  showWatchParty,
  content,
  type,
  onCloseShare,
  onCloseWatchParty
}) => {
  const title = content.title || content.name || 'Unknown Title';

  return (
    <>
      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          content={{
            id: content.id,
            title,
            type: type as 'movie' | 'tv',
            poster_path: content.poster_path,
            description: content.overview
          }}
          onClose={onCloseShare}
        />
      )}

      {/* Watch Party Modal */}
      {showWatchParty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <WatchParty
            movieId={content.id}
            movieTitle={title}
            movieType={type as 'movie' | 'tv'}
            onClose={onCloseWatchParty}
          />
        </div>
      )}
    </>
  );
};
