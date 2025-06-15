
import { useState, useEffect } from 'react';

interface CastMedia {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  videoUrl: string;
  contentType: string;
}

export const useChromecast = () => {
  const [isCastAvailable, setIsCastAvailable] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [castSession, setCastSession] = useState<any>(null);

  useEffect(() => {
    // Load Google Cast SDK
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
    script.async = true;
    
    script.onload = () => {
      window.__onGCastApiAvailable = (isAvailable: boolean) => {
        if (isAvailable) {
          initializeCast();
        }
      };
    };
    
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeCast = () => {
    const context = (window as any).cast.framework.CastContext.getInstance();
    
    context.setOptions({
      receiverApplicationId: (window as any).chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
      autoJoinPolicy: (window as any).chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
    });

    context.addEventListener((window as any).cast.framework.CastContextEventType.CAST_STATE_CHANGED, (event: any) => {
      setIsCastAvailable(event.castState !== (window as any).chrome.cast.ReceiverAvailability.UNAVAILABLE);
      setIsCasting(event.castState === (window as any).chrome.cast.ReceiverAvailability.AVAILABLE);
    });

    context.addEventListener((window as any).cast.framework.CastContextEventType.SESSION_STATE_CHANGED, (event: any) => {
      setCastSession(event.session);
      setIsCasting(!!event.session);
    });
  };

  const startCasting = async (media: CastMedia) => {
    try {
      const context = (window as any).cast.framework.CastContext.getInstance();
      const session = await context.requestSession();
      
      const mediaInfo = new (window as any).chrome.cast.media.MediaInfo(media.videoUrl, media.contentType);
      mediaInfo.metadata = new (window as any).chrome.cast.media.GenericMediaMetadata();
      mediaInfo.metadata.title = media.title;
      mediaInfo.metadata.subtitle = media.subtitle;
      
      if (media.imageUrl) {
        mediaInfo.metadata.images = [new (window as any).chrome.cast.Image(media.imageUrl)];
      }

      const request = new (window as any).chrome.cast.media.LoadRequest(mediaInfo);
      await session.loadMedia(request);
    } catch (error) {
      console.error('Error starting cast:', error);
    }
  };

  const stopCasting = async () => {
    try {
      const context = (window as any).cast.framework.CastContext.getInstance();
      const session = context.getCurrentSession();
      if (session) {
        await session.endSession(true);
      }
    } catch (error) {
      console.error('Error stopping cast:', error);
    }
  };

  return {
    isCastAvailable,
    isCasting,
    startCasting,
    stopCasting
  };
};
