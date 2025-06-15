
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Plus, Check, Share, UserPlus } from 'lucide-react';

interface DetailPageActionsProps {
  shouldResume: boolean;
  user: any;
  isInWatchlist: boolean;
  onWatch: () => void;
  onWatchlistToggle: () => void;
  onShare: () => void;
  onWatchParty: () => void;
}

export const DetailPageActions: React.FC<DetailPageActionsProps> = ({
  shouldResume,
  user,
  isInWatchlist,
  onWatch,
  onWatchlistToggle,
  onShare,
  onWatchParty
}) => {
  return (
    <div className="flex gap-2 md:gap-4 flex-wrap">
      <Button 
        onClick={onWatch}
        size="sm"
        className="bg-primary hover:bg-primary/90 px-3 md:px-8 text-xs md:text-base"
      >
        <Play className="h-3 w-3 md:h-5 md:w-5 mr-1 md:mr-2" />
        {shouldResume ? 'Continue Watching' : 'Watch Now'}
      </Button>
      
      {user && (
        <Button
          onClick={onWatchlistToggle}
          variant="outline"
          size="sm"
          className="border-white/30 text-white hover:bg-white/20 px-3 md:px-6 text-xs md:text-base backdrop-blur-sm"
        >
          {isInWatchlist ? (
            <>
              <Check className="h-3 w-3 md:h-5 md:w-5 mr-1 md:mr-2" />
              <span className="hidden sm:inline">In Watchlist</span>
              <span className="sm:hidden">Added</span>
            </>
          ) : (
            <>
              <Plus className="h-3 w-3 md:h-5 md:w-5 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Add to Watchlist</span>
              <span className="sm:hidden">Add</span>
            </>
          )}
        </Button>
      )}

      <Button
        onClick={onShare}
        variant="outline"
        size="sm"
        className="border-white/30 text-white hover:bg-white/20 px-3 md:px-6 text-xs md:text-base backdrop-blur-sm"
      >
        <Share className="h-3 w-3 md:h-5 md:w-5 mr-1 md:mr-2" />
        <span className="hidden sm:inline">Share</span>
      </Button>

      <Button
        onClick={onWatchParty}
        variant="outline"
        size="sm"
        className="border-white/30 text-white hover:bg-white/20 px-3 md:px-6 text-xs md:text-base backdrop-blur-sm"
      >
        <UserPlus className="h-3 w-3 md:h-5 md:w-5 mr-1 md:mr-2" />
        <span className="hidden sm:inline">Watch Party</span>
        <span className="sm:hidden">Party</span>
      </Button>
    </div>
  );
};
