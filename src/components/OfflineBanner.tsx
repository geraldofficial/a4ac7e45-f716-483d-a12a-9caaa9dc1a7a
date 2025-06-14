
import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Show "back online" message briefly
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't show banner if online and no recent status change
  if (isOnline && !showBanner) return null;

  return (
    <div className={`fixed top-16 left-0 right-0 z-40 transition-all duration-300 ${
      showBanner ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className={`px-4 py-2 text-center text-white text-sm font-medium ${
        isOnline ? 'bg-green-600' : 'bg-red-600'
      }`}>
        <div className="flex items-center justify-center space-x-2">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4" />
              <span>You're back online!</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <span>You're offline. Some features may not work.</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
