
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  content: any;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ content, type, season, episode }) => {
  const title = content.title || content.name || 'FlickPick';
  const description = content.overview || 'Stream movies and TV shows online';
  const imageUrl = content.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${content.backdrop_path}`
    : 'https://images.unsplash.com/photo-1489599904276-39c2bb2d7b64?w=1200&h=630&fit=crop';

  let pageTitle = title;
  if (type === 'tv' && season && episode) {
    pageTitle = `${title} - Season ${season} Episode ${episode}`;
  }
  pageTitle += ' | FlickPick';

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:type" content="video.other" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
};
