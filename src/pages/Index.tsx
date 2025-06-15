
import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroCarousel } from '@/components/HeroCarousel';
import { ContentRecommendations } from '@/components/ContentRecommendations';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  const [currentProfile, setCurrentProfile] = useState(null);

  useEffect(() => {
    // Get the selected profile from localStorage
    const savedProfile = localStorage.getItem('selectedProfile');
    if (savedProfile) {
      try {
        setCurrentProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error('Error parsing saved profile:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      
      <main className="relative">
        <HeroCarousel />
        
        <div className="container mx-auto px-4 py-12 space-y-12 relative z-10">
          <ContentRecommendations 
            userId={user?.id} 
            profileId={currentProfile?.id}
            profile={currentProfile}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
