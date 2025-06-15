
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { MovieSection } from '@/components/MovieSection';
import { ContinueWatching } from '@/components/ContinueWatching';
import { RecentlyWatched } from '@/components/RecentlyWatched';
import { Footer } from '@/components/Footer';
import { PWAUpdatePrompt } from '@/components/PWAUpdatePrompt';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🏠 Index: useEffect triggered - loading:', loading, 'user:', user?.id || 'none');
    
    // Only redirect if we're sure about the auth state
    if (!loading && user) {
      console.log('🏠 Index: Auth state resolved, user:', user.id);
      
      if (!user.onboarding_completed) {
        console.log('🚀 Redirecting to onboarding - user has not completed onboarding');
        navigate('/onboarding');
        return;
      }
      
      console.log('✅ User is authenticated and onboarded, showing main content');
    }
  }, [user, loading, navigate]);

  console.log('🏠 Index: Render - loading:', loading, 'user:', user?.id || 'none');

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

  // If user is not authenticated, allow them to see the public content
  // (they can still browse movies without being logged in)
  console.log('🎬 Index: Rendering main content for user:', user?.id || 'anonymous');

  try {
    return (
      <div className="min-h-screen bg-background dark overflow-x-hidden">
        <Navbar />
        <main className="relative pt-0 md:pt-24 pb-24 md:pb-8">
          <HeroSection />
          {user && <ContinueWatching />}
          {user && <RecentlyWatched />}
          <MovieSection />
        </main>
        <Footer />
        <PWAUpdatePrompt />
      </div>
    );
  } catch (error) {
    console.error('💥 Error rendering Index page:', error);
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Something went wrong. Please refresh the page.</p>
        </div>
      </div>
    );
  }
};

export default Index;
