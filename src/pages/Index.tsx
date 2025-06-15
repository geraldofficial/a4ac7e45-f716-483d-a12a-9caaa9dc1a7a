
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { MovieSection } from '@/components/MovieSection';
import { ContinueWatching } from '@/components/ContinueWatching';
import { RecentlyWatched } from '@/components/RecentlyWatched';
import { Footer } from '@/components/Footer';
import { PWAUpdatePrompt } from '@/components/PWAUpdatePrompt';
import { SafeErrorBoundary } from '@/components/SafeErrorBoundary';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, loading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🏠 Index: useEffect triggered - user:', user?.id || 'none', 'loading:', loading);
    
    // Only redirect if not loading and user exists but hasn't completed onboarding
    if (!loading && user && !user.onboarding_completed) {
      console.log('🚀 Redirecting to onboarding - user has not completed onboarding');
      navigate('/onboarding');
    }
  }, [user, loading, navigate]);

  console.log('🎬 Index: Rendering - loading:', loading, 'user:', user?.id || 'anonymous', 'error:', error);

  // Show loading spinner while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading FlickPick..." />
      </div>
    );
  }

  // Show error state if there's an auth error
  if (error) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground">Authentication Error</h2>
          <p className="text-muted-foreground text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark">
      <SafeErrorBoundary componentName="Navbar">
        <Navbar />
      </SafeErrorBoundary>
      
      <main className="relative pt-0 md:pt-24 pb-24 md:pb-8">
        <SafeErrorBoundary componentName="Hero Section">
          <HeroSection />
        </SafeErrorBoundary>
        
        {user && (
          <SafeErrorBoundary componentName="Continue Watching">
            <ContinueWatching />
          </SafeErrorBoundary>
        )}
        
        {user && (
          <SafeErrorBoundary componentName="Recently Watched">
            <RecentlyWatched />
          </SafeErrorBoundary>
        )}
        
        <SafeErrorBoundary componentName="Movie Section">
          <MovieSection />
        </SafeErrorBoundary>
      </main>
      
      <SafeErrorBoundary componentName="Footer">
        <Footer />
      </SafeErrorBoundary>
      
      <SafeErrorBoundary componentName="PWA Update Prompt">
        <PWAUpdatePrompt />
      </SafeErrorBoundary>
    </div>
  );
};

export default Index;
