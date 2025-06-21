import React, { useState, useEffect } from "react";
import { Download, X, Tv, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTVGuest } from "@/contexts/TVGuestContext";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const TVInstallPrompt: React.FC = () => {
  const { showTVInstallPrompt, dismissTVInstallPrompt, isTVMode } =
    useTVGuest();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)",
      ).matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    checkInstalled();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      dismissTVInstallPrompt();
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener,
    );
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [dismissTVInstallPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback: Show manual installation instructions
      showManualInstallInstructions();
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }

      setDeferredPrompt(null);
      dismissTVInstallPrompt();
    } catch (error) {
      console.error("Error during installation:", error);
      showManualInstallInstructions();
    }
  };

  const showManualInstallInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    let instructions = "";

    if (userAgent.includes("chrome") || userAgent.includes("edge")) {
      instructions =
        "Click the install button in your browser's address bar, or go to Settings → Install FlickPick.";
    } else if (userAgent.includes("firefox")) {
      instructions =
        "Add FlickPick to your home screen through your browser menu.";
    } else if (userAgent.includes("safari")) {
      instructions = 'Tap the Share button and select "Add to Home Screen".';
    } else {
      instructions =
        'Look for "Add to Home Screen" or "Install App" in your browser menu.';
    }

    alert(
      `To install FlickPick:\n\n${instructions}\n\nThis will allow you to use FlickPick as a native app on your device.`,
    );
  };

  if (!showTVInstallPrompt || isInstalled) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="tv-modal max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-600 p-4 rounded-full">
              <Tv size={48} className="text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-white mb-2">
            Install FlickPick on Your TV
          </CardTitle>
          <p className="text-xl text-gray-300">
            Get the full TV experience with our downloadable app
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <Monitor className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">TV Optimized</h4>
              <p className="text-sm text-gray-300">
                Perfect for big screen viewing
              </p>
            </div>

            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <Smartphone className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Remote Control</h4>
              <p className="text-sm text-gray-300">
                Navigate with your TV remote
              </p>
            </div>

            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <Download className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Offline Ready</h4>
              <p className="text-sm text-gray-300">
                Works even without internet
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-lg">What you get:</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                No login required for guest viewing
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                Optimized for TV screens and remote controls
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                Faster loading and better performance
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                Works offline once installed
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-4">
            <Button
              onClick={handleInstall}
              className="tv-button tv-button-primary px-8 py-3"
              data-tv-focusable
            >
              <Download size={20} />
              <span className="ml-2">Install Now</span>
            </Button>

            <Button
              variant="outline"
              onClick={dismissTVInstallPrompt}
              className="tv-button tv-button-secondary px-6 py-3"
              data-tv-focusable
            >
              <X size={20} />
              <span className="ml-2">Maybe Later</span>
            </Button>
          </div>

          <p className="text-center text-sm text-gray-400">
            Installation is optional. FlickPick works great in your browser too!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TVInstallPrompt;
