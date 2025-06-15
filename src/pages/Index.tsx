
import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroCarousel } from '@/components/HeroCarousel';
import { EnhancedMovieSection } from '@/components/EnhancedMovieSection';
import { ContinueWatching } from '@/components/ContinueWatching';
import { RecentlyWatched } from '@/components/RecentlyWatched';
import { Footer } from '@/components/Footer';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  const [currentProfile, setCurrentProfile] = useState(null);

  useEffect(() => {
    // Get the selected profile from localStorage with error handling
    const savedProfile = localStorage.getItem('selectedProfile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setCurrentProfile(parsedProfile);
      } catch (error) {
        console.error('Error parsing saved profile:', error);
        localStorage.removeItem('selectedProfile'); // Clean up corrupted data
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      
      <main className="relative pt-14 sm:pt-16 md:pt-20">
        <HeroCarousel profile={currentProfile} />
        
        <div className="container mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8 relative z-10 pb-20 md:pb-8">
          {user && <ContinueWatching profile={currentProfile} />}
          {user && <RecentlyWatched profile={currentProfile} />}
          
          <EnhancedMovieSection />
        </div>
      </main>
      
      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default Index;
