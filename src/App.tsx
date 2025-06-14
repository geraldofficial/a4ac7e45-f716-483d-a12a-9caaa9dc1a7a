
import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "./contexts/AuthContext";
import { ScrollToTop } from "./components/ScrollToTop";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ProductionLoadingSpinner } from "./components/ProductionLoadingSpinner";

const Index = lazy(() => import("./pages/Index"));
const DetailPage = lazy(() => import("./pages/DetailPage"));
const Search = lazy(() => import("./pages/Search"));
const Browse = lazy(() => import("./pages/Browse"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/Profile"));
const Support = lazy(() => import("./pages/Support"));
const Trending = lazy(() => import("./pages/Trending"));
const TopRated = lazy(() => import("./pages/TopRated"));
const History = lazy(() => import("./pages/History"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider>
              <ScrollToTop />
              <ErrorBoundary>
                <Suspense fallback={<ProductionLoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/movie/:id" element={<DetailPage />} />
                    <Route path="/tv/:id" element={<DetailPage />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/browse" element={<Browse />} />
                    <Route path="/watchlist" element={<Watchlist />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/trending" element={<Trending />} />
                    <Route path="/top-rated" element={<TopRated />} />
                    <Route path="/history" element={<History />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
