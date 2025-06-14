
import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface LoadingWithTimeoutProps {
  timeout?: number;
  onTimeout?: () => void;
  text?: string;
  fallback?: React.ReactNode;
}

export const LoadingWithTimeout: React.FC<LoadingWithTimeoutProps> = ({
  timeout = 10000, // 10 seconds default
  onTimeout,
  text = "Loading FlickPick...",
  fallback
}) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasTimedOut(true);
      onTimeout?.();
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onTimeout]);

  const handleRetry = () => {
    setHasTimedOut(false);
    window.location.reload();
  };

  if (hasTimedOut) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">Taking longer than expected</h2>
          <p className="text-muted-foreground">
            FlickPick is taking a while to load. This might be due to a slow connection or server issues.
          </p>
          <Button onClick={handleRetry} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
};
