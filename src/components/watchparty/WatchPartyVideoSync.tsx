
import React, { useEffect, useRef } from 'react';
import { PlaybackSyncData } from '@/services/enhancedDatabaseWatchParty';

interface WatchPartyVideoSyncProps {
  isHost: boolean;
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onPlayStateChange: (isPlaying: boolean) => void;
  onSyncReceived?: (data: PlaybackSyncData) => void;
  syncData?: PlaybackSyncData;
}

export const WatchPartyVideoSync: React.FC<WatchPartyVideoSyncProps> = ({
  isHost,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onPlayStateChange,
  onSyncReceived,
  syncData
}) => {
  const lastSyncRef = useRef<number>(0);
  const syncThreshold = 2; // seconds

  // Handle incoming sync data for non-hosts
  useEffect(() => {
    if (!isHost && syncData && onSyncReceived) {
      const timeDiff = Math.abs(currentTime - syncData.position);
      const timeSinceLastSync = Date.now() - lastSyncRef.current;
      
      // Only sync if there's a significant time difference and enough time has passed
      if (timeDiff > syncThreshold && timeSinceLastSync > 3000) {
        lastSyncRef.current = Date.now();
        onSyncReceived(syncData);
      }
    }
  }, [syncData, currentTime, isHost, onSyncReceived]);

  // Host broadcasts sync events
  const broadcastSync = (position: number, playing: boolean) => {
    if (isHost) {
      onTimeUpdate(position);
      onPlayStateChange(playing);
    }
  };

  return (
    <div className="watch-party-sync-controller">
      {isHost && (
        <div className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
          Host Controls Active
        </div>
      )}
      {!isHost && syncData && (
        <div className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">
          Synced with Host
        </div>
      )}
    </div>
  );
};
