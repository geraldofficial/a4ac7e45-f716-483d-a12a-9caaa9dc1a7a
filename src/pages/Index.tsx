
import React from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { MovieSection } from '@/components/MovieSection';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background dark">
      <Navbar />
      <HeroSection />
      <MovieSection />
      <Footer />
    </div>
  );
};

export default Index;
