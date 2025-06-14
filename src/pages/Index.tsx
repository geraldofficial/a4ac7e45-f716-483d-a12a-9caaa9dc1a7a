
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
    if (loading) return;
    
    if (user && !user.onboarding_completed) {
      navigate('/onboarding');
    }
  }, [user, loading, navigate]);

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading FlickPick...</p>
        </div>
      </div>
    );
  }

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
};

export default Index;
