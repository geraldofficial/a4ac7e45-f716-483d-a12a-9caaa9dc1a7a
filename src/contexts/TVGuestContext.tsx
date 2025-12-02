import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface WatchHistoryItem {
  id: number;
  title: string;
  poster_path?: string;
  type: string;
  watchedAt: string;
}

interface TVGuestContextType {
  isGuestMode: boolean;
  isTVMode: boolean;
  enableGuestMode: () => void;
  disableGuestMode: () => void;
  toggleTVMode: () => void;
  guestWatchlist: string[];
  addToGuestWatchlist: (movieId: string) => void;
  removeFromGuestWatchlist: (movieId: string) => void;
  guestHistory: string[];
  addToGuestHistory: (movieId: string) => void;
  addToGuestWatchHistory: (item: WatchHistoryItem) => void;
  clearGuestData: () => void;
  showTVInstallPrompt: boolean;
  dismissTVInstallPrompt: () => void;
}

const TVGuestContext = createContext<TVGuestContextType | undefined>(undefined);

export const useTVGuest = () => {
  const context = useContext(TVGuestContext);
  if (context === undefined) {
    throw new Error("useTVGuest must be used within a TVGuestProvider");
  }
  return context;
};

interface TVGuestProviderProps {
  children: ReactNode;
}

export const TVGuestProvider: React.FC<TVGuestProviderProps> = ({
  children,
}) => {
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isTVMode, setIsTVMode] = useState(false);
  const [guestWatchlist, setGuestWatchlist] = useState<string[]>([]);
  const [guestHistory, setGuestHistory] = useState<string[]>([]);
  const [showTVInstallPrompt, setShowTVInstallPrompt] = useState(false);

  useEffect(() => {
    const detectTVMode = () => {
      const isLargeScreen = window.innerWidth >= 1280;
      const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
      const isTV = window.matchMedia("tv").matches;
      const userAgent = navigator.userAgent.toLowerCase();
      const isTVUserAgent = /tv|webos|tizen|roku|chromecast|android tv/i.test(
        userAgent,
      );
      const fromTVSource = window.location.search.includes("source=tv");
      const savedTVMode = localStorage.getItem("flickpick-tv-mode") === "true";

      const tvModeDetected =
        isTV ||
        isTVUserAgent ||
        fromTVSource ||
        savedTVMode ||
        (isLargeScreen && isCoarsePointer);

      setIsTVMode(tvModeDetected);

      if (tvModeDetected) {
        const savedGuestMode =
          localStorage.getItem("flickpick-guest-mode") !== "false";
        setIsGuestMode(savedGuestMode);
      }

      if (
        tvModeDetected &&
        !localStorage.getItem("flickpick-install-dismissed")
      ) {
        setTimeout(() => {
          setShowTVInstallPrompt(true);
        }, 30000);
      }
    };

    detectTVMode();
    window.addEventListener("resize", detectTVMode);

    return () => window.removeEventListener("resize", detectTVMode);
  }, []);

  useEffect(() => {
    try {
      const savedWatchlist = localStorage.getItem("flickpick-guest-watchlist");
      if (savedWatchlist) {
        setGuestWatchlist(JSON.parse(savedWatchlist));
      }

      const savedHistory = localStorage.getItem("flickpick-guest-history");
      if (savedHistory) {
        setGuestHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.warn("Error loading guest data:", error);
    }
  }, []);

  useEffect(() => {
    if (isGuestMode) {
      localStorage.setItem(
        "flickpick-guest-watchlist",
        JSON.stringify(guestWatchlist),
      );
    }
  }, [guestWatchlist, isGuestMode]);

  useEffect(() => {
    if (isGuestMode) {
      localStorage.setItem(
        "flickpick-guest-history",
        JSON.stringify(guestHistory),
      );
    }
  }, [guestHistory, isGuestMode]);

  const enableGuestMode = () => {
    setIsGuestMode(true);
    localStorage.setItem("flickpick-guest-mode", "true");
  };

  const disableGuestMode = () => {
    setIsGuestMode(false);
    localStorage.setItem("flickpick-guest-mode", "false");
  };

  const toggleTVMode = () => {
    const newTVMode = !isTVMode;
    setIsTVMode(newTVMode);
    localStorage.setItem("flickpick-tv-mode", newTVMode.toString());

    if (newTVMode) {
      document.body.classList.add("tv-mode");
    } else {
      document.body.classList.remove("tv-mode");
    }
  };

  const addToGuestWatchlist = (movieId: string) => {
    if (!guestWatchlist.includes(movieId)) {
      setGuestWatchlist((prev) => [...prev, movieId]);
    }
  };

  const removeFromGuestWatchlist = (movieId: string) => {
    setGuestWatchlist((prev) => prev.filter((id) => id !== movieId));
  };

  const addToGuestHistory = (movieId: string) => {
    setGuestHistory((prev) => {
      const filtered = prev.filter((id) => id !== movieId);
      return [movieId, ...filtered].slice(0, 50);
    });
  };

  const addToGuestWatchHistory = (item: WatchHistoryItem) => {
    const movieId = item.id.toString();
    setGuestHistory((prev) => {
      const filtered = prev.filter((id) => id !== movieId);
      return [movieId, ...filtered].slice(0, 50);
    });
  };

  const clearGuestData = () => {
    setGuestWatchlist([]);
    setGuestHistory([]);
    localStorage.removeItem("flickpick-guest-watchlist");
    localStorage.removeItem("flickpick-guest-history");
  };

  const dismissTVInstallPrompt = () => {
    setShowTVInstallPrompt(false);
    localStorage.setItem("flickpick-install-dismissed", "true");
  };

  const value: TVGuestContextType = {
    isGuestMode,
    isTVMode,
    enableGuestMode,
    disableGuestMode,
    toggleTVMode,
    guestWatchlist,
    addToGuestWatchlist,
    removeFromGuestWatchlist,
    guestHistory,
    addToGuestHistory,
    addToGuestWatchHistory,
    clearGuestData,
    showTVInstallPrompt,
    dismissTVInstallPrompt,
  };

  return (
    <TVGuestContext.Provider value={value}>{children}</TVGuestContext.Provider>
  );
};

export default TVGuestProvider;
