
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingWithTimeout } from "@/components/LoadingWithTimeout";
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
import { ScrollToTop } from "./components/ScrollToTop";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 2; // Retry up to 2 times
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const AppContent: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <LoadingWithTimeout 
        timeout={15000} 
        onTimeout={() => {
          console.warn('App loading timed out');
        }}
      />
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/search" element={<Search />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/top-rated" element={<TopRated />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<History />} />
          <Route path="/support" element={<Support />} />
          <Route path="/help" element={<Help />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/movie/:id" element={<DetailPage />} />
          <Route path="/tv/:id" element={<DetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNavigation />
      </div>
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
