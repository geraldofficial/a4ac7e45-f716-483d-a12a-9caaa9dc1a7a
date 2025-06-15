
import { useEffect } from 'react';

interface KeyboardHandlers {
  onPlayPause?: () => void;
  onSeekForward?: () => void;
  onSeekBackward?: () => void;
  onVolumeUp?: () => void;
  onVolumeDown?: () => void;
  onMute?: () => void;
  onFullscreen?: () => void;
}

export const useKeyboardShortcuts = (handlers: KeyboardHandlers, isActive: boolean = true) => {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for video controls
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handlers.onPlayPause?.();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlers.onSeekBackward?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handlers.onSeekForward?.();
          break;
        case 'ArrowUp':
          e.preventDefault();
          handlers.onVolumeUp?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          handlers.onVolumeDown?.();
          break;
        case 'KeyM':
          e.preventDefault();
          handlers.onMute?.();
          break;
        case 'KeyF':
          e.preventDefault();
          handlers.onFullscreen?.();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlers, isActive]);
};
