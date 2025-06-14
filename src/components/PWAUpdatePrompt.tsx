
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, Download } from 'lucide-react';

export const PWAUpdatePrompt: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setUpdateAvailable(true);
      });
    }

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (updateAvailable) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:w-96">
        <Alert>
          <RefreshCw className="h-4 w-4" />
          <AlertTitle>Update Available</AlertTitle>
          <AlertDescription className="mb-2">
            A new version of FlickPick is available.
          </AlertDescription>
          <Button onClick={handleUpdate} size="sm" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Update Now
          </Button>
        </Alert>
      </div>
    );
  }

  if (showInstallPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:w-96">
        <Alert>
          <Download className="h-4 w-4" />
          <AlertTitle>Install FlickPick</AlertTitle>
          <AlertDescription className="mb-2">
            Install FlickPick as an app for quick access and offline viewing.
          </AlertDescription>
          <div className="flex gap-2">
            <Button onClick={handleInstall} size="sm" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Install
            </Button>
            <Button 
              onClick={() => setShowInstallPrompt(false)} 
              variant="outline" 
              size="sm"
              className="flex-1"
            >
              Later
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return null;
};
