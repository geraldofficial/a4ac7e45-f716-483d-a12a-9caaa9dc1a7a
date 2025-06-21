import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
// Error suppression now handled by external script in HTML
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TVGuestProvider, useTVGuest } from "@/contexts/TVGuestContext";
import { ModernNavbar } from "@/components/layout/ModernNavbar";
import TVNavbar from "@/components/tv/TVNavbar";
import TVInstallPrompt from "@/components/tv/TVInstallPrompt";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SafeErrorBoundary } from "@/components/SafeErrorBoundary";
import { NetworkErrorHandler } from "@/components/NetworkErrorHandler";
import { ScrollToTop } from "./components/ScrollToTop";
import "@/styles/tv-styles.css";

// Import network diagnostics and error handling for debugging
import "./utils/migrationRunner";
// import "./utils/errorSuppression"; // Disabled - using external script instead
import "./utils/linkValidator";
import "./utils/settingsValidator";

// Lazy load pages for better performance
const Index = React.lazy(() => import("./pages/Index"));
const TVHome = React.lazy(() => import("./pages/TVHome"));
const Auth = React.lazy(() => import("./pages/Auth"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Profiles = React.lazy(() => import("./pages/Profiles"));
const Settings = React.lazy(() => import("./pages/Settings"));
const NotificationSettings = React.lazy(
  () => import("./pages/NotificationSettings"),
);
const Browse = React.lazy(() => import("./pages/Browse"));
const Movies = React.lazy(() => import("./pages/Movies"));
const TVShows = React.lazy(() => import("./pages/TVShows"));
const Trending = React.lazy(() => import("./pages/Trending"));
const Community = React.lazy(() => import("./pages/Community"));
const DetailPage = React.lazy(() => import("./pages/DetailPage"));
const WatchPage = React.lazy(() => import("./pages/WatchPage"));
const WatchParty = React.lazy(() => import("./pages/WatchParty"));
const Watchlist = React.lazy(() => import("./pages/Watchlist"));
const History = React.lazy(() => import("./pages/History"));
const Admin = React.lazy(() => import("./pages/Admin"));
const Help = React.lazy(() => import("./pages/Help"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Privacy = React.lazy(() => import("./pages/Privacy"));
const Terms = React.lazy(() => import("./pages/Terms"));
const Onboarding = React.lazy(() => import("./pages/Onboarding"));
const Donate = React.lazy(() => import("./pages/Donate"));

// Navigation component that switches between TV and regular navbar
const AppNavigation: React.FC = () => {
  const { isTVMode } = useTVGuest();

  if (isTVMode) {
    return <TVNavbar />;
  }

  return <ModernNavbar />;
};

// Home page component that switches between TV and regular home
const HomePage: React.FC = () => {
  const { isTVMode } = useTVGuest();

  if (isTVMode) {
    return <TVHome />;
  }

  return <Index />;
};

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
      },
    },
  });

  return (
    <ErrorBoundary>
      <SafeErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <TVGuestProvider>
              <NetworkErrorHandler>
                <AuthProvider>
                  <div className="min-h-screen bg-gray-950 text-white">
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <ScrollToTop />
                    <AppNavigation />
                    <TVInstallPrompt />

                    <main>
                      <React.Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-screen">
                            <div className="tv-loading">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                              <span className="ml-4">Loading FlickPick...</span>
                            </div>
                          </div>
                        }
                      >
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/auth" element={<Auth />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/profiles" element={<Profiles />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route
                            path="/notifications/settings"
                            element={<NotificationSettings />}
                          />
                          <Route path="/browse" element={<Browse />} />
                          <Route path="/movies" element={<Movies />} />
                          <Route path="/tv" element={<TVShows />} />
                          <Route path="/trending" element={<Trending />} />
                          <Route path="/community" element={<Community />} />
                          <Route path="/detail/:id" element={<DetailPage />} />
                          <Route path="/watch/:id" element={<WatchPage />} />
                          <Route
                            path="/watch-party/:id"
                            element={<WatchParty />}
                          />
                          <Route path="/watchlist" element={<Watchlist />} />
                          <Route path="/history" element={<History />} />
                          <Route path="/admin" element={<Admin />} />
                          <Route path="/help" element={<Help />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/privacy" element={<Privacy />} />
                          <Route path="/terms" element={<Terms />} />
                          <Route path="/onboarding" element={<Onboarding />} />
                          <Route path="/donate" element={<Donate />} />
                        </Routes>
                      </React.Suspense>
                    </main>
                  </BrowserRouter>
                </div>
              </AuthProvider>
            </TVGuestProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </SafeErrorBoundary>
    </ErrorBoundary>
  );
}

export default App;