
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Captions } from 'lucide-react';

interface Subtitle {
  id: string;
  language: string;
  label: string;
  url: string;
  default?: boolean;
}

interface SubtitleSelectorProps {
  subtitles: Subtitle[];
  currentSubtitle: string;
  onSubtitleChange: (subtitleId: string) => void;
  className?: string;
}

export const SubtitleSelector: React.FC<SubtitleSelectorProps> = ({
  subtitles,
  currentSubtitle,
  onSubtitleChange,
  className
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Captions className="h-4 w-4 text-white" />
      <Select value={currentSubtitle} onValueChange={onSubtitleChange}>
        <SelectTrigger className="w-32 h-8 bg-black/50 text-white border-white/20">
          <SelectValue placeholder="Subtitles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="off">Off</SelectItem>
          {subtitles.map((subtitle) => (
            <SelectItem key={subtitle.id} value={subtitle.id}>
              {subtitle.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
