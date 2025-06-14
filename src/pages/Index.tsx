
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { MovieSection } from '@/components/MovieSection';
import { ContinueWatching } from '@/components/ContinueWatching';
import { RecentlyWatched } from '@/components/RecentlyWatched';
import { PullToRefresh } from '@/components/PullToRefresh';
import { Footer } from '@/components/Footer';
import { BottomNavigation } from '@/components/BottomNavigation';
import { EnhancedMovieSection } from '@/components/EnhancedMovieSection';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (loading) return;
    
    if (user && !user.onboarding_completed) {
      navigate('/onboarding');
    }
  }, [user, loading, navigate]);

  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  return (
    <>
      <Helmet>
        <title>FlickPick - Stream Movies & TV Shows Online Free | Ad-Free for Subscribers</title>
        <meta name="description" content="Stream unlimited movies and TV series free on FlickPick. Premium subscribers enjoy ad-free viewing. Watch the latest releases, trending content, and classic favorites." />
        <meta name="keywords" content="free movies, tv shows, streaming, watch online, ad-free, premium streaming, latest movies, trending shows, FlickPick" />
        
        {/* Enhanced Open Graph */}
        <meta property="og:title" content="FlickPick - Stream Movies & TV Shows Online Free" />
        <meta property="og:description" content="Stream unlimited movies and TV series free on FlickPick. Premium subscribers enjoy ad-free viewing." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content="https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=1200&h=630&fit=crop" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FlickPick - Stream Movies & TV Shows Online Free" />
        <meta name="twitter:description" content="Stream unlimited movies and TV series free on FlickPick." />
        
        {/* Mobile optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        
        {/* Enhanced Structured Data */}
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
                "url": `${window.location.origin}/favicon.ico`
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
      
      <div className="min-h-screen bg-background dark overflow-x-hidden">
        <Navbar />
        <PullToRefresh onRefresh={handleRefresh}>
          <main className="relative pt-0 md:pt-24 pb-24 md:pb-8">
            <HeroSection />
            {user && <ContinueWatching />}
            {user && <RecentlyWatched />}
            <EnhancedMovieSection />
          </main>
        </PullToRefresh>
        <Footer />
        <BottomNavigation />
      </div>
    </>
  );
};

export default Index;
