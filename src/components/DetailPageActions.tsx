
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Plus, Check, Share, Users } from 'lucide-react';

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
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Primary Watch Button */}
      <Button 
        onClick={onWatch}
        size="lg" 
        className="flex-1 bg-white text-black hover:bg-gray-200 font-semibold h-12 text-base rounded-lg shadow-lg"
      >
        <Play className="mr-2 h-5 w-5 fill-current" />
        {shouldResume ? 'Resume' : 'Play'}
      </Button>

      {/* Secondary Actions */}
      <div className="flex gap-3">
        {/* Watchlist Button */}
        <Button 
          onClick={onWatchlistToggle}
          variant="outline" 
          size="lg"
          className="bg-gray-800/80 border-gray-600 text-white hover:bg-gray-700 h-12 px-4 rounded-lg"
        >
          {isInWatchlist ? (
            <Check className="h-5 w-5" />
          ) : (
            <Plus className="h-5 w-5" />
          )}
        </Button>

        {/* Watch Party Button */}
        <Button 
          onClick={onWatchParty}
          variant="outline" 
          size="lg"
          className="bg-red-600/80 border-red-500 text-white hover:bg-red-700 h-12 px-4 rounded-lg"
        >
          <Users className="h-5 w-5" />
        </Button>

        {/* Share Button */}
        <Button 
          onClick={onShare}
          variant="outline" 
          size="lg"
          className="bg-gray-800/80 border-gray-600 text-white hover:bg-gray-700 h-12 px-4 rounded-lg"
        >
          <Share className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
