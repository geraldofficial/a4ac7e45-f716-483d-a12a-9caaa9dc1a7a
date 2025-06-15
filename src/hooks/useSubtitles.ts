
import { useState, useEffect } from 'react';

interface Subtitle {
  id: string;
  language: string;
  label: string;
  url: string;
  default?: boolean;
}

interface SubtitleCue {
  start: number;
  end: number;
  text: string;
}

export const useSubtitles = (subtitles: Subtitle[]) => {
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('off');
  const [currentCue, setCurrentCue] = useState<SubtitleCue | null>(null);
  const [subtitleCues, setSubtitleCues] = useState<SubtitleCue[]>([]);

  const loadSubtitleFile = async (url: string) => {
    try {
      const response = await fetch(url);
      const text = await response.text();
      
      // Simple VTT/SRT parser
      const cues: SubtitleCue[] = [];
      const lines = text.split('\n');
      let i = 0;
      
      while (i < lines.length) {
        const line = lines[i].trim();
        
        // Skip empty lines and WEBVTT headers
        if (!line || line === 'WEBVTT') {
          i++;
          continue;
        }
        
        // Look for timestamp line
        const timeMatch = line.match(/(\d{2}):(\d{2}):(\d{2})[.,](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[.,](\d{3})/);
        if (timeMatch) {
          const start = parseTime(timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[4]);
          const end = parseTime(timeMatch[5], timeMatch[6], timeMatch[7], timeMatch[8]);
          
          i++;
          let text = '';
          
          // Collect subtitle text
          while (i < lines.length && lines[i].trim() !== '') {
            text += (text ? '\n' : '') + lines[i].trim();
            i++;
          }
          
          if (text) {
            cues.push({ start, end, text });
          }
        } else {
          i++;
        }
      }
      
      setSubtitleCues(cues);
    } catch (error) {
      console.error('Error loading subtitle file:', error);
    }
  };

  const parseTime = (hours: string, minutes: string, seconds: string, milliseconds: string) => {
    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / 1000;
  };

  const updateCurrentCue = (currentTime: number) => {
    if (currentSubtitle === 'off' || subtitleCues.length === 0) {
      setCurrentCue(null);
      return;
    }

    const cue = subtitleCues.find(c => currentTime >= c.start && currentTime <= c.end);
    setCurrentCue(cue || null);
  };

  useEffect(() => {
    if (currentSubtitle !== 'off') {
      const subtitle = subtitles.find(s => s.id === currentSubtitle);
      if (subtitle) {
        loadSubtitleFile(subtitle.url);
      }
    } else {
      setSubtitleCues([]);
      setCurrentCue(null);
    }
  }, [currentSubtitle, subtitles]);

  return {
    currentSubtitle,
    setCurrentSubtitle,
    currentCue,
    updateCurrentCue,
    availableSubtitles: subtitles
  };
};
