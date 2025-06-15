
import React, { useRef, useImperativeHandle, forwardRef } from 'react';

interface VideoPlayerIframeProps {
  src: string;
  title: string;
  onLoad: () => void;
  onError: () => void;
  className?: string;
}

export interface VideoPlayerIframeRef {
  requestFullscreen: () => void;
}

export const VideoPlayerIframe = forwardRef<VideoPlayerIframeRef, VideoPlayerIframeProps>(({
  src,
  title,
  onLoad,
  onError,
  className = "w-full h-full"
}, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useImperativeHandle(ref, () => ({
    requestFullscreen: () => {
      if (iframeRef.current) {
        iframeRef.current.requestFullscreen();
      }
    }
  }));

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title={title}
      className={className}
      allowFullScreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
      onLoad={onLoad}
      onError={onError}
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
});

VideoPlayerIframe.displayName = 'VideoPlayerIframe';
