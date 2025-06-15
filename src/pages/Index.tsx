
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

  // Show loading only if auth is still initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading FlickPick..." />
      </div>
    );
  }

  // Always render the main app, even if there's an error or no user
  return (
    <div className="min-h-screen bg-background">
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
