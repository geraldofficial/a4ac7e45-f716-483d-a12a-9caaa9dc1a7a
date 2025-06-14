
import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';

export const OfflineBanner = () => {
  const { isOffline, wasOffline } = useOffline();

  if (!isOffline && !wasOffline) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-sm font-medium transition-all duration-300 ${
        isOffline
          ? 'bg-red-600 text-white'
          : 'bg-green-600 text-white'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {isOffline ? (
          <>
            <WifiOff className="h-4 w-4" />
            <span>You're offline. Some features may be limited.</span>
          </>
        ) : (
          <>
            <Wifi className="h-4 w-4" />
            <span>Connection restored!</span>
          </>
        )}
      </div>
    </div>
  );
};
