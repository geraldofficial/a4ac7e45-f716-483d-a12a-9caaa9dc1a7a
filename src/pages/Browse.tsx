import React from 'react';
import { ModernNavbar } from '@/components/layout/ModernNavbar';
import { EnhancedMovieSection } from '@/components/EnhancedMovieSection';
import { Footer } from '@/components/Footer';
import { BottomNavigation } from '@/components/BottomNavigation';

const Browse = () => {
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <ModernNavbar />
      <div className="md:pt-20">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2 md:mb-4">Browse</h1>
          <p className="text-muted-foreground text-sm md:text-base mb-6">
            Discover movies and TV shows across all genres
          </p>
        </div>
        <EnhancedMovieSection />
      </div>
      <div className="hidden md:block">
        <Footer />
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Browse;
