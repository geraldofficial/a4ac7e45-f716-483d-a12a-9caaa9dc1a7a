import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface LoadingWithTimeoutProps {
  timeout?: number;
  onTimeout?: () => void;
  text?: string;
  fallback?: React.ReactNode;
}

export const LoadingWithTimeout: React.FC<LoadingWithTimeoutProps> = ({
  timeout = 10000,
  onTimeout,
  text = "Loading...",
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

  if (hasTimedOut) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">Taking longer than expected</h2>
          <p className="text-muted-foreground text-sm">This might be due to a slow connection.</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (fallback) return <>{fallback}</>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <img
          src="https://cdn.builder.io/api/v1/assets/3a5e046f24294e60a3c1afd0f4c614eb/chatgpt-image-jun-21-2025-03_27_04-pm-65410f?format=webp&width=800"
          alt="FlickPick"
          className="h-10 w-auto mx-auto"
        />
        <Spinner size="lg" />
        <p className="text-muted-foreground text-sm">{text}</p>
      </div>
    </div>
  );
};
