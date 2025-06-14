
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const DetailPage = lazy(() => import("./pages/DetailPage"));
const History = lazy(() => import("./pages/History"));
const Browse = lazy(() => import("./pages/Browse"));
const Trending = lazy(() => import("./pages/Trending"));
const TopRated = lazy(() => import("./pages/TopRated"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <BrowserRouter>
              <ErrorBoundary>
                <AuthProvider>
                  <div className="min-h-screen bg-background text-foreground">
                    <ErrorBoundary>
                      <Suspense fallback={
                        <div className="min-h-screen flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                      }>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/auth" element={<Auth />} />
                          <Route path="/movie/:id" element={<DetailPage />} />
                          <Route path="/tv/:id" element={<DetailPage />} />
                          <Route path="/history" element={<History />} />
                          <Route path="/browse" element={<Browse />} />
                          <Route path="/trending" element={<Trending />} />
                          <Route path="/top-rated" element={<TopRated />} />
                        </Routes>
                      </Suspense>
                    </ErrorBoundary>
                    <Toaster />
                  </div>
                </AuthProvider>
              </ErrorBoundary>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
