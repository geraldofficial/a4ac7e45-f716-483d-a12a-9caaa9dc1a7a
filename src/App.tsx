
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SafeErrorBoundary } from "@/components/SafeErrorBoundary";
import { SafeLoadingFallback } from "@/components/SafeLoadingFallback";
import { ScrollToTop } from "./components/ScrollToTop";

// Pages - wrapped in error boundaries for safety
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Search from "./pages/Search";
import Watchlist from "./pages/Watchlist";
import Browse from "./pages/Browse";
import Trending from "./pages/Trending";
import TopRated from "./pages/TopRated";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import DetailPage from "./pages/DetailPage";
import Profile from "./pages/Profile";
import History from "./pages/History";
import Support from "./pages/Support";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error && typeof error === 'object' && 'status' in error) {
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

const SafeRoute: React.FC<{ children: React.ReactNode; componentName: string }> = ({ children, componentName }) => (
  <SafeErrorBoundary 
    componentName={componentName}
    fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Page Not Available</h2>
          <p className="text-muted-foreground mb-4">This page failed to load properly.</p>
          <button 
            onClick={() => window.location.href = '/'}
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

const AppContent: React.FC = () => {
  const { loading, error } = useAuth();

  console.log('🎬 AppContent render - loading:', loading, 'error:', error);

  if (loading) {
    return <SafeLoadingFallback message="Initializing FlickPick..." error={error} />;
  }

  if (error) {
    return <SafeLoadingFallback error={error} />;
  }

  return (
    <SafeErrorBoundary componentName="Main App Content">
      <div className="min-h-screen">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<SafeRoute componentName="Index"><Index /></SafeRoute>} />
          <Route path="/auth" element={<SafeRoute componentName="Auth"><Auth /></SafeRoute>} />
          <Route path="/onboarding" element={<SafeRoute componentName="Onboarding"><Onboarding /></SafeRoute>} />
          <Route path="/search" element={<SafeRoute componentName="Search"><Search /></SafeRoute>} />
          <Route path="/watchlist" element={<SafeRoute componentName="Watchlist"><Watchlist /></SafeRoute>} />
          <Route path="/browse" element={<SafeRoute componentName="Browse"><Browse /></SafeRoute>} />
          <Route path="/trending" element={<SafeRoute componentName="Trending"><Trending /></SafeRoute>} />
          <Route path="/top-rated" element={<SafeRoute componentName="TopRated"><TopRated /></SafeRoute>} />
          <Route path="/profile" element={<SafeRoute componentName="Profile"><Profile /></SafeRoute>} />
          <Route path="/history" element={<SafeRoute componentName="History"><History /></SafeRoute>} />
          <Route path="/support" element={<SafeRoute componentName="Support"><Support /></SafeRoute>} />
          <Route path="/help" element={<SafeRoute componentName="Help"><Help /></SafeRoute>} />
          <Route path="/contact" element={<SafeRoute componentName="Contact"><Contact /></SafeRoute>} />
          <Route path="/privacy" element={<SafeRoute componentName="Privacy"><Privacy /></SafeRoute>} />
          <Route path="/terms" element={<SafeRoute componentName="Terms"><Terms /></SafeRoute>} />
          <Route path="/movie/:id" element={<SafeRoute componentName="Movie Detail"><DetailPage /></SafeRoute>} />
          <Route path="/tv/:id" element={<SafeRoute componentName="TV Detail"><DetailPage /></SafeRoute>} />
          <Route path="*" element={<SafeRoute componentName="NotFound"><NotFound /></SafeRoute>} />
        </Routes>
        <SafeErrorBoundary componentName="Bottom Navigation">
          <BottomNavigation />
        </SafeErrorBoundary>
      </div>
    </SafeErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary fallback={<SafeLoadingFallback error="Application failed to start. Please refresh the page." />}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ErrorBoundary fallback={<SafeLoadingFallback error="Authentication system failed. Please refresh the page." />}>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
