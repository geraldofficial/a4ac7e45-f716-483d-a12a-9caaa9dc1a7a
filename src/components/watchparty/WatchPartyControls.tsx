
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Volume2, Settings } from 'lucide-react';

interface WatchPartyControlsProps {
  isHost: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  disabled?: boolean;
}

export const WatchPartyControls: React.FC<WatchPartyControlsProps> = ({
  isHost,
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onSeek,
  onVolumeChange,
  disabled = false
}) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeekBack = () => {
    onSeek(Math.max(0, currentTime - 10));
  };

  const handleSeekForward = () => {
    onSeek(Math.min(duration, currentTime + 10));
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 space-y-3">
      {/* Host indicator */}
      {isHost && (
        <div className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full text-center">
          You have host controls
        </div>
      )}
      
      {!isHost && (
        <div className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full text-center">
          Synced with host
        </div>
      )}

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="relative">
          <div className="w-full h-2 bg-gray-700 rounded-full">
            <div
              className="h-full bg-red-600 rounded-full transition-all duration-200"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          {isHost && (
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={disabled || !isHost}
            />
          )}
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex items-center justify-center gap-2">
        <Button
          onClick={handleSeekBack}
          size="sm"
          variant="ghost"
          disabled={disabled || !isHost}
          className="text-gray-300 hover:text-white hover:bg-gray-700/50"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        
        <Button
          onClick={onPlayPause}
          size="sm"
          disabled={disabled || !isHost}
          className="bg-red-600 hover:bg-red-700 text-white w-10 h-10 rounded-full"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        
        <Button
          onClick={handleSeekForward}
          size="sm"
          variant="ghost"
          disabled={disabled || !isHost}
          className="text-gray-300 hover:text-white hover:bg-gray-700/50"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Volume control */}
      <div className="flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-gray-400" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-gray-700 rounded-full outline-none slider"
        />
        <span className="text-xs text-gray-400 w-8">{Math.round(volume * 100)}%</span>
      </div>
    </div>
  );
};
