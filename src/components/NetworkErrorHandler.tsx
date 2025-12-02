import React, { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface NetworkErrorHandlerProps {
  children: React.ReactNode;
}

export const NetworkErrorHandler: React.FC<NetworkErrorHandlerProps> = ({
  children,
}) => {
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNetworkError(null);
      console.log("📶 Network connection restored");
    };

    const handleOffline = () => {
      setIsOnline(false);
      setNetworkError("You are currently offline. Some features may not work.");
      console.log("📵 Network connection lost");
    };

    const handleFetchError = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.error?.includes("Failed to fetch")) {
        setNetworkError(
          "Network connection error. Please check your internet connection.",
        );
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("supabase-fetch-error", handleFetchError);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("supabase-fetch-error", handleFetchError);
    };
  }, [isOnline]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setNetworkError(null);
    // Force a page reload to reset any stuck states
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  if (networkError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert className="border-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span>{networkError}</span>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex-1"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Connection
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Refresh Page
            </Button>
          </div>

          <div className="text-sm text-muted-foreground text-center">
            If the problem persists, please check your internet connection or
            try again later.
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
