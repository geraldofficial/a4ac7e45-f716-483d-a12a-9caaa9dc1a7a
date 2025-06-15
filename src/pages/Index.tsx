
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
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, loading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🏠 Index: useEffect triggered - loading:', loading, 'user:', user?.id || 'none', 'error:', error);
    
    // Only redirect if we're sure about the auth state and no errors
    if (!loading && !error && user) {
      console.log('🏠 Index: Auth state resolved, user:', user.id);
      
      if (!user.onboarding_completed) {
        console.log('🚀 Redirecting to onboarding - user has not completed onboarding');
        navigate('/onboarding');
        return;
      }
      
      console.log('✅ User is authenticated and onboarded, showing main content');
    }
  }, [user, loading, error, navigate]);

  console.log('🏠 Index: Render - loading:', loading, 'user:', user?.id || 'none', 'error:', error);

  // Show error state if there's an auth error
  if (error) {
    console.log('❌ Index: Auth error detected:', error);
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-xl font-semibold text-foreground">Authentication Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while auth is initializing
  if (loading) {
    console.log('⏳ Index: Still loading auth state');
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading FlickPick...</p>
        </div>
      </div>
    );
  }

  console.log('🎬 Index: Rendering main content for user:', user?.id || 'anonymous');

  try {
    return (
      <div className="min-h-screen bg-background dark overflow-x-hidden">
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
  } catch (error) {
    console.error('💥 Error rendering Index page:', error);
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Something went wrong. Please refresh the page.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
};

export default Index;
