
import React from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { MovieSection } from '@/components/MovieSection';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background dark overflow-x-hidden">
      <Navbar />
      <main className="relative">
        <HeroSection />
        <MovieSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
