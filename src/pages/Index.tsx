import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { NetflixMobileHero } from '@/components/NetflixMobileHero';
import { ContinueWatching } from '@/components/ContinueWatching';
import { RecentlyWatched } from '@/components/RecentlyWatched';
import { PullToRefresh } from '@/components/PullToRefresh';
import { Footer } from '@/components/Footer';
import { BottomNavigation } from '@/components/BottomNavigation';
import { EnhancedMovieSection } from '@/components/EnhancedMovieSection';
import { OfflineBanner } from '@/components/OfflineBanner';
import { useAuth } from '@/contexts/AuthContext';
import { useOffline } from '@/hooks/useOffline';
import { useQueryClient } from '@tanstack/react-query';

const Index = () => {
  const { user, loading } = useAuth();
  const { isOffline, wasOffline } = useOffline();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isMobile, setIsMobile] = React.useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (loading) return;
    
    if (user && !user.onboarding_completed) {
      navigate('/onboarding');
    }
  }, [user, loading, navigate]);

  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  // App logo URL for social media sharing
  const logoUrl = `${window.location.origin}/favicon.ico`;

  // Calculate top padding based on offline banner visibility
  const showOfflineBanner = isOffline || wasOffline;
  const topPadding = showOfflineBanner ? 'pt-20 md:pt-20' : 'pt-14 md:pt-16';

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
        <meta property="og:image" content={logoUrl} />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FlickPick - Stream Movies & TV Shows Online Free" />
        <meta name="twitter:description" content="Stream unlimited movies and TV series free on FlickPick." />
        <meta name="twitter:image" content={logoUrl} />
        
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "FlickPick",
            "description": "Stream unlimited movies and TV series free on FlickPick",
            "url": window.location.origin,
            "inLanguage": "en-US",
            "isAccessibleForFree": true,
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${window.location.origin}/search?q={search_term_string}`
              },
              "query-input": "required name=search_term_string"
            },
            "publisher": {
              "@type": "Organization",
              "name": "FlickPick",
              "logo": {
                "@type": "ImageObject",
                "url": logoUrl
              }
            },
            "offers": {
              "@type": "Offer",
              "category": "Entertainment",
              "availability": "https://schema.org/InStock",
              "price": "0",
              "priceCurrency": "USD"
            }
          })}
        </script>
      </Helmet>
      
      <OfflineBanner />
      
      <div className="min-h-screen bg-background">
        <Navbar />
        <PullToRefresh onRefresh={handleRefresh}>
          <div className={`w-full ${topPadding}`}>
            {/* Use Netflix mobile hero on mobile, regular hero on desktop */}
            {isMobile ? <NetflixMobileHero /> : <HeroSection />}
            
            {/* Hide continue watching and recently watched on mobile to match Netflix */}
            {!isMobile && user && <ContinueWatching />}
            {!isMobile && user && <RecentlyWatched />}
            
            <EnhancedMovieSection />
          </div>
        </PullToRefresh>
        
        {/* Always show footer */}
        <Footer />
        <BottomNavigation />
      </div>
    </>
  );
};

export default Index;
