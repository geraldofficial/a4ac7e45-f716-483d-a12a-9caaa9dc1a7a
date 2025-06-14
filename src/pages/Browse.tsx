
import React from 'react';
import { Navbar } from '@/components/Navbar';
import { EnhancedMovieSection } from '@/components/EnhancedMovieSection';
import { Footer } from '@/components/Footer';

const Browse = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-foreground mb-8">Browse Content</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Discover thousands of movies and TV shows across all genres
          </p>
        </div>
        <EnhancedMovieSection />
      </div>
      <Footer />
    </div>
  );
};

export default Browse;
