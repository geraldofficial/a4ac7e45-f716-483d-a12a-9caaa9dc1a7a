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
import { AppStatusUpdate } from "./components/AppStatusUpdate";
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

const SafeRoute: React.FC<{
  children: React.ReactNode;
  componentName: string;
}> = ({ children, componentName }) => (
  <SafeErrorBoundary
    componentName={componentName}
    fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Page Not Available</h2>
          <p className="text-muted-foreground mb-4">
            This page failed to load properly.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    }
  >
    {children}
  </SafeErrorBoundary>
);

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error) => {
          if (error && typeof error === "object" && "status" in error) {
            const status = (error as any).status;
            if (status >= 400 && status < 500) return false;
          }
          return failureCount < 2;
        },
      },
    },
  });

  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-red-500 mb-4">
              <svg
                className="h-12 w-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Application Error
            </h2>
            <p className="text-muted-foreground text-sm">
              FlickPick failed to start. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Reload App
            </button>
          </div>
        </div>
      }
    >
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
                      <AppStatusUpdate />
                      <AppNavigation />
                      <TVInstallPrompt />

                      <main>
                        <React.Suspense
                          fallback={
                            <div className="flex items-center justify-center min-h-screen">
                              <div className="tv-loading">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                                <span className="ml-4">
                                  Loading FlickPick...
                                </span>
                              </div>
                            </div>
                          }
                        >
                          <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route
                              path="/auth"
                              element={
                                <SafeRoute componentName="Auth">
                                  <Auth />
                                </SafeRoute>
                              }
                            />
                            <Route
                              path="/profile"
                              element={
                                <SafeRoute componentName="Profile">
                                  <Profile />
                                </SafeRoute>
                              }
                            />
                            <Route
                              path="/profiles"
                              element={
                                <SafeRoute componentName="Profiles">
                                  <Profiles />
                                </SafeRoute>
                              }
                            />
                            <Route
                              path="/settings"
                              element={
                                <SafeRoute componentName="Settings">
                                  <Settings />
                                </SafeRoute>
                              }
                            />
                            <Route
                              path="/notifications/settings"
                              element={
                                <SafeRoute componentName="NotificationSettings">
                                  <NotificationSettings />
                                </SafeRoute>
                              }
                            />
                            <Route
                              path="/browse"
                              element={
                                <SafeRoute componentName="Browse">
                                  <Browse />
                                </SafeRoute>
                              }
                            />
                            <Route
                              path="/movies"
                              element={
                                <SafeRoute componentName="Movies">
                                  <Movies />
                                </SafeRoute>
                              }
                            />
                            <Route
                              path="/tv"
                              element={
                                <SafeRoute componentName="TVShows">
                                  <TVShows />
                                </SafeRoute>
                              }
                            />
                            <Route
                              path="/trending"
                              element={
                                <SafeRoute componentName="Trending">
                                  <Trending />
                                </SafeRoute>
                              }
                            />
                            <Route
                              path="/community"
                              element={
                                <SafeRoute componentName="Community">
                                  <Community />
                                </SafeRoute>
                              }
                            />
                            <Route
                              path="/detail/:id"
                              element={
                                <SafeRoute componentName="DetailPage">
                                  <DetailPage />
                                </SafeRoute>
                              }
                            />
                            <Route
                              path="/movie/:id"
                              element={
                                <SafeRoute componentName="Movie Detail">
                                  <DetailPage />
                                </SafeRoute>
                              }
                            />
                            <Route
                              path="/tv/:id"
                              element={
                                <SafeRoute componentName="TV Detail">
                                  <DetailPage />
                                </SafeRoute>
                              }
                            />
                            <Route
                              path="/watch/:id"
                              element={
                                <SafeRoute componentName="WatchPage">
                                  <WatchPage />
                                </SafeRoute>
                              }
                            />
                            <Route
                              path="/watch-party/:id"
                              element={
                                <SafeRoute componentName="WatchParty">
                                  <WatchParty />
                                </SafeRoute>
                              }
                            />
                            <Route
                              path="/watchlist"
                              element={
                                <SafeRoute componentName="Watchlist">
                                  <Watchlist />
                                </SafeRoute>
                              }
                            />
                            <Route
                              path="/history"
                              element={
                                <SafeRoute componentName="History">
                                  <History />
                                </SafeRoute>
                              }
                            />
                            <Route
                              path="/admin"
                              element={
                                <SafeRoute componentName="Admin">
                                  <Admin />
                                </SafeRoute>
                              }
                            />
                            <Route
                              path="/help"
                              element={
                                <SafeRoute componentName="Help">
                                  <Help />
                                </SafeRoute>
                              }
                            />
                            <Route
                              path="/contact"
                              element={
                                <SafeRoute componentName="Contact">
                                  <Contact />
                                </SafeRoute>
                              }
                            />
                            <Route
                              path="/privacy"
                              element={
                                <SafeRoute componentName="Privacy">
                                  <Privacy />
                                </SafeRoute>
                              }
                            />
                            <Route
                              path="/terms"
                              element={
                                <SafeRoute componentName="Terms">
                                  <Terms />
                                </SafeRoute>
                              }
                            />
                            <Route
                              path="/onboarding"
                              element={
                                <SafeRoute componentName="Onboarding">
                                  <Onboarding />
                                </SafeRoute>
                              }
                            />
                            <Route
                              path="/donate"
                              element={
                                <SafeRoute componentName="Donate">
                                  <Donate />
                                </SafeRoute>
                              }
                            />
                          </Routes>
                        </React.Suspense>
                      </main>
                    </BrowserRouter>
                  </div>
                </AuthProvider>
              </NetworkErrorHandler>
            </TVGuestProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </SafeErrorBoundary>
    </ErrorBoundary>
  );
}

export default App;