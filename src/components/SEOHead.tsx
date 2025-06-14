
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
    ? `${title} Season ${season} Episode ${episode} - Watch Online | FlickPick`
    : `${title} ${year ? `(${year})` : ''} - Watch Online | FlickPick`;
  
  const description = content.overview 
    ? `Watch ${title} ${year ? `(${year})` : ''} online. ${content.overview.substring(0, 150)}...`
    : `Watch ${title} ${year ? `(${year})` : ''} online on FlickPick - Your ultimate streaming destination.`;

  const imageUrl = content.poster_path 
    ? `https://image.tmdb.org/t/p/w500${content.poster_path}`
    : 'https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=500&h=750&fit=crop';

  const backdropUrl = content.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${content.backdrop_path}`
    : imageUrl;

  // Structured data for search engines
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
      "worstRating": 0
    },
    "genre": content.genres?.map(g => g.name) || [],
    "duration": content.runtime ? `PT${content.runtime}M` : undefined,
    "numberOfSeasons": content.number_of_seasons,
    "potentialAction": {
      "@type": "WatchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": window.location.href,
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      }
    },
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "category": "Streaming"
    }
  };

  // Remove undefined values
  Object.keys(structuredData).forEach(key => {
    if (structuredData[key] === undefined) {
      delete structuredData[key];
    }
  });

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="title" content={seoTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={`${title}, watch online, stream, movie, ${content.genres?.map(g => g.name).join(', ')}, ${year}`} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="video.movie" />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={backdropUrl} />
      <meta property="og:image:width" content="1920" />
      <meta property="og:image:height" content="1080" />
      <meta property="og:url" content={window.location.href} />
      <meta property="og:site_name" content="FlickPick" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={backdropUrl} />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="FlickPick" />
      <meta name="publisher" content="FlickPick" />
      <meta name="copyright" content="FlickPick" />
      
      {/* Movie-specific meta tags */}
      {releaseDate && <meta name="video:release_date" content={releaseDate} />}
      {content.runtime && <meta name="video:duration" content={content.runtime.toString()} />}
      {content.genres && content.genres.length > 0 && (
        <meta name="video:tag" content={content.genres.map(g => g.name).join(', ')} />
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={window.location.href} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};
