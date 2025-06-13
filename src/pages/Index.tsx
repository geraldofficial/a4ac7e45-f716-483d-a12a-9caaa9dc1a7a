
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { MovieSection } from '@/components/MovieSection';
import { Footer } from '@/components/Footer';
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

  return (
    <div className="min-h-screen bg-background dark overflow-x-hidden">
      <Navbar />
      <main className="relative pt-0 md:pt-20 lg:pt-24 pb-24 md:pb-8">
        <HeroSection />
        <MovieSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
