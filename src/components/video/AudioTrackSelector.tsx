
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2 } from 'lucide-react';

interface AudioTrack {
  id: string;
  language: string;
  label: string;
  codec?: string;
  channels?: string;
  default?: boolean;
}

interface AudioTrackSelectorProps {
  audioTracks: AudioTrack[];
  currentTrack: string;
  onTrackChange: (trackId: string) => void;
  className?: string;
}

export const AudioTrackSelector: React.FC<AudioTrackSelectorProps> = ({
  audioTracks,
  currentTrack,
  onTrackChange,
  className
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Volume2 className="h-4 w-4 text-white" />
      <Select value={currentTrack} onValueChange={onTrackChange}>
        <SelectTrigger className="w-32 h-8 bg-black/50 text-white border-white/20">
          <SelectValue placeholder="Audio" />
        </SelectTrigger>
        <SelectContent>
          {audioTracks.map((track) => (
            <SelectItem key={track.id} value={track.id}>
              {track.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
