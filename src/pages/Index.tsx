
import React from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { MovieSection } from '@/components/MovieSection';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="relative">
        <HeroSection />
        <MovieSection />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
