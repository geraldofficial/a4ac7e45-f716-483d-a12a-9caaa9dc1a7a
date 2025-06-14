
import React from 'react';
import { Navbar } from '@/components/Navbar';
import { EnhancedMovieSection } from '@/components/EnhancedMovieSection';
import { Footer } from '@/components/Footer';
import { Helmet } from 'react-helmet-async';

const Browse = () => {
  return (
    <>
      <Helmet>
        <title>Browse Movies & TV Shows - FlickPick | Unlimited Streaming</title>
        <meta name="description" content="Browse thousands of movies and TV shows across all genres. Discover new content, trending titles, and hidden gems on FlickPick - your ultimate streaming destination." />
        <meta name="keywords" content="browse movies, tv shows, streaming, genres, discover content, movie catalog, tv series, entertainment" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Browse Movies & TV Shows - FlickPick" />
        <meta property="og:description" content="Browse thousands of movies and TV shows across all genres. Discover new content on FlickPick." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Browse Movies & TV Shows - FlickPick" />
        <meta name="twitter:description" content="Browse thousands of movies and TV shows across all genres." />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Browse Movies & TV Shows",
            "description": "Browse thousands of movies and TV shows across all genres",
            "url": window.location.href,
            "mainEntity": {
              "@type": "ItemList",
              "name": "Movie and TV Show Collection",
              "description": "Curated collection of movies and TV shows"
            }
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 md:pt-20">
          <div className="container mx-auto px-4 py-6 md:py-8">
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6">
                Browse Content
              </h1>
              <p className="text-muted-foreground text-base md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto md:mx-0">
                Discover thousands of movies and TV shows across all genres. 
                Find your next favorite content with our curated collection.
              </p>
            </div>
          </div>
          <EnhancedMovieSection />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Browse;
