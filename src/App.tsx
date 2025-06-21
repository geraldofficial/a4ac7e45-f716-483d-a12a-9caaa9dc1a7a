import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@/utils/simpleErrorSuppression"; // Load error suppression early
import "@/utils/errorSuppressionStatus"; // Load status checker
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModernNavbar } from "@/components/layout/ModernNavbar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SafeErrorBoundary } from "@/components/SafeErrorBoundary";
import { ScrollToTop } from "./components/ScrollToTop";

// Import network diagnostics and error handling for debugging
import "./utils/networkDiagnostics";
import "./utils/globalErrorHandler";
import "./utils/migrationRunner";
import "./utils/errorSuppression";
import "./utils/linkValidator";
import "./utils/settingsValidator";

// Pages - wrapped in error boundaries for safety
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Search from "./pages/Search";
import Watchlist from "./pages/Watchlist";
import Browse from "./pages/Browse";
import Trending from "./pages/Trending";
import TopRated from "./pages/TopRated";
import Movies from "./pages/Movies";
import TVShows from "./pages/TVShows";
import Community from "./pages/Community";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import NotificationSettings from "./pages/NotificationSettings";
import DetailPage from "./pages/DetailPage";
import Profile from "./pages/Profile";
import Profiles from "./pages/Profiles";
import History from "./pages/History";
import Support from "./pages/Support";
import Donate from "./pages/Donate";
import Admin from "./pages/Admin";
import WatchParty from "./pages/WatchParty";
import Settings from "./pages/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error && typeof error === "object" && "status" in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

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

const App: React.FC = () => {
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
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <div className="min-h-screen bg-gray-950">
                <ScrollToTop />
                <ModernNavbar />
                <main>
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <SafeRoute componentName="Index">
                          <Index />
                        </SafeRoute>
                      }
                    />
                    <Route
                      path="/auth"
                      element={
                        <SafeRoute componentName="Auth">
                          <Auth />
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
                      path="/search"
                      element={
                        <SafeRoute componentName="Search">
                          <Search />
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
                        <SafeRoute componentName="TV Shows">
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
                      path="/top-rated"
                      element={
                        <SafeRoute componentName="TopRated">
                          <TopRated />
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
                      path="/admin"
                      element={
                        <SafeRoute componentName="Admin">
                          <Admin />
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
                      path="/history"
                      element={
                        <SafeRoute componentName="History">
                          <History />
                        </SafeRoute>
                      }
                    />
                    <Route
                      path="/support"
                      element={
                        <SafeRoute componentName="Support">
                          <Support />
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
                      path="/notifications/settings"
                      element={
                        <SafeRoute componentName="Notification Settings">
                          <NotificationSettings />
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
                      path="/watch-party/:partyId"
                      element={
                        <SafeRoute componentName="Watch Party">
                          <WatchParty />
                        </SafeRoute>
                      }
                    />
                    <Route
                      path="*"
                      element={
                        <SafeRoute componentName="NotFound">
                          <NotFound />
                        </SafeRoute>
                      }
                    />
                  </Routes>
                </main>
              </div>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
