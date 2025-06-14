
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Movie } from '@/services/tmdb';

interface SEOHeadProps {
  content: Movie;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ content, type, season, episode }) => {
  const title = content.title || content.name || 'Unknown Title';
  const releaseDate = content.release_date || content.first_air_date || '';
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
  
  // Create SEO-optimized title
  const seoTitle = episode && season 
    ? `${title} Season ${season} Episode ${episode} - Watch Online Free | FlickPick`
    : `${title} ${year ? `(${year})` : ''} - Watch Online Free | FlickPick`;
  
  const description = content.overview 
    ? `Watch ${title} ${year ? `(${year})` : ''} online free. ${content.overview.substring(0, 140)}... Stream now on FlickPick.`
    : `Watch ${title} ${year ? `(${year})` : ''} online free on FlickPick - Your ultimate streaming destination with no ads for subscribers.`;

  const imageUrl = content.poster_path 
    ? `https://image.tmdb.org/t/p/w500${content.poster_path}`
    : 'https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=500&h=750&fit=crop';

  const backdropUrl = content.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${content.backdrop_path}`
    : imageUrl;

  // Enhanced structured data for better SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": type === 'movie' ? "Movie" : "TVSeries",
    "name": title,
    "description": content.overview,
    "image": [imageUrl, backdropUrl],
    "datePublished": releaseDate,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": content.vote_average,
      "bestRating": 10,
      "worstRating": 0,
      "ratingCount": content.vote_count || 100
    },
    "genre": content.genres?.map(g => g.name) || [],
    "duration": content.runtime ? `PT${content.runtime}M` : undefined,
    "numberOfSeasons": content.number_of_seasons,
    "contentRating": "PG-13",
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "potentialAction": {
      "@type": "WatchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": window.location.href,
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
          "http://schema.org/IOSPlatform",
          "http://schema.org/AndroidPlatform"
        ]
      }
    },
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "category": "Streaming",
      "price": "0",
      "priceCurrency": "USD"
    },
    "provider": {
      "@type": "Organization",
      "name": "FlickPick",
      "url": "https://flickpick.com"
    }
  };

  // Remove undefined values
  Object.keys(structuredData).forEach(key => {
    if (structuredData[key] === undefined) {
      delete structuredData[key];
    }
  });

  // Keywords for better discoverability
  const keywords = [
    title,
    `watch ${title} online`,
    `${title} free streaming`,
    type === 'movie' ? 'movie' : 'tv show',
    'free movies',
    'streaming',
    'watch online',
    'no ads',
    year.toString(),
    ...(content.genres?.map(g => g.name.toLowerCase()) || [])
  ].filter(Boolean).join(', ');

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="title" content={seoTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="FlickPick" />
      <meta name="publisher" content="FlickPick" />
      <meta name="copyright" content="FlickPick" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="video.movie" />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={backdropUrl} />
      <meta property="og:image:width" content="1920" />
      <meta property="og:image:height" content="1080" />
      <meta property="og:image:alt" content={`${title} poster`} />
      <meta property="og:url" content={window.location.href} />
      <meta property="og:site_name" content="FlickPick" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={backdropUrl} />
      <meta name="twitter:image:alt" content={`${title} poster`} />
      <meta name="twitter:site" content="@FlickPick" />
      <meta name="twitter:creator" content="@FlickPick" />
      
      {/* Additional Meta Tags for SEO */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      
      {/* Movie/TV specific meta tags */}
      {releaseDate && <meta name="video:release_date" content={releaseDate} />}
      {content.runtime && <meta name="video:duration" content={content.runtime.toString()} />}
      {content.genres && content.genres.length > 0 && (
        <meta name="video:tag" content={content.genres.map(g => g.name).join(', ')} />
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={window.location.href} />
      
      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://image.tmdb.org" />
      <link rel="dns-prefetch" href="https://image.tmdb.org" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};
