
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { NetflixMobileHero } from '@/components/NetflixMobileHero';
import { ContinueWatching } from '@/components/ContinueWatching';
import { RecentlyWatched } from '@/components/RecentlyWatched';
import { Footer } from '@/components/Footer';
import { BottomNavigation } from '@/components/BottomNavigation';
import { EnhancedMovieSection } from '@/components/EnhancedMovieSection';
import { OfflineBanner } from '@/components/OfflineBanner';
import { useAuth } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = React.useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      <Helmet>
        <title>FlickPick - Stream Movies & TV Shows Online Free | Ad-Free for Subscribers</title>
        <meta name="description" content="Stream unlimited movies and TV series free on FlickPick. Premium subscribers enjoy ad-free viewing. Watch the latest releases, trending content, and classic favorites." />
        <meta name="keywords" content="free movies, tv shows, streaming, watch online, ad-free, premium streaming, latest movies, trending shows, FlickPick" />
        
        <meta property="og:title" content="FlickPick - Stream Movies & TV Shows Online Free" />
        <meta property="og:description" content="Stream unlimited movies and TV series free on FlickPick. Premium subscribers enjoy ad-free viewing." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content="https://images.unsplash.com/photo-1489599904276-39c2bb2d64?w=1200&h=630&fit=crop" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FlickPick - Stream Movies & TV Shows Online Free" />
        <meta name="twitter:description" content="Stream unlimited movies and TV series free on FlickPick." />
        
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Helmet>
      
      <ErrorBoundary>
        <div className="min-h-screen bg-background dark overflow-x-hidden">
          <ErrorBoundary>
            <Navbar />
          </ErrorBoundary>
          
          <main className="relative safe-area-top pt-14 md:pt-16">
            <ErrorBoundary fallback={
              <div className="h-[50vh] bg-gradient-to-r from-purple-900 to-blue-900 flex items-center justify-center">
                <p className="text-white text-xl">Hero content unavailable</p>
              </div>
            }>
              {isMobile ? <NetflixMobileHero /> : <HeroSection />}
            </ErrorBoundary>
            
            {!isMobile && user && (
              <ErrorBoundary>
                <ContinueWatching />
              </ErrorBoundary>
            )}
            
            {!isMobile && user && (
              <ErrorBoundary>
                <RecentlyWatched />
              </ErrorBoundary>
            )}
            
            <ErrorBoundary fallback={
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Content sections unavailable</p>
              </div>
            }>
              <EnhancedMovieSection />
            </ErrorBoundary>
          </main>
          
          {!isMobile && (
            <ErrorBoundary>
              <Footer />
            </ErrorBoundary>
          )}
          
          <ErrorBoundary>
            <BottomNavigation />
          </ErrorBoundary>
        </div>
      </ErrorBoundary>
    </>
  );
};

export default Index;
