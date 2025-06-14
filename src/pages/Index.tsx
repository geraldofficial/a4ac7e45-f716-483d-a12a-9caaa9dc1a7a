
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { MovieSection } from '@/components/MovieSection';
import { ContinueWatching } from '@/components/ContinueWatching';
import { RecentlyWatched } from '@/components/RecentlyWatched';
import { PullToRefresh } from '@/components/PullToRefresh';
import { Footer } from '@/components/Footer';
import { BottomNavigation } from '@/components/BottomNavigation';
import { EnhancedMovieSection } from '@/components/EnhancedMovieSection';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (loading) return;
    
    if (user && !user.onboarding_completed) {
      navigate('/onboarding');
    }
  }, [user, loading, navigate]);

  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  return (
    <div className="min-h-screen bg-background dark overflow-x-hidden">
      <Navbar />
      <PullToRefresh onRefresh={handleRefresh}>
        <main className="relative pt-0 md:pt-24 pb-24 md:pb-8">
          <HeroSection />
          {user && <ContinueWatching />}
          {user && <RecentlyWatched />}
          <EnhancedMovieSection />
        </main>
      </PullToRefresh>
      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default Index;
