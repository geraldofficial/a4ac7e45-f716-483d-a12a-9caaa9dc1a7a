
import React, { useEffect } from 'react';
import { tmdbApi } from '@/services/tmdb';

export const generateSitemap = async () => {
  try {
    // Get popular movies and TV shows for sitemap
    const [popularMovies, popularTVShows] = await Promise.all([
      tmdbApi.getPopularMovies(1),
      tmdbApi.getPopularTVShows(1)
    ]);

    const baseUrl = window.location.origin;
    const currentDate = new Date().toISOString().split('T')[0];
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/browse</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/search</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/trending</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/top-rated</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;

    // Add popular movies to sitemap
    popularMovies?.slice(0, 50).forEach(movie => {
      sitemap += `
  <url>
    <loc>${baseUrl}/movie/${movie.id}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    // Add popular TV shows to sitemap
    popularTVShows?.slice(0, 50).forEach(show => {
      sitemap += `
  <url>
    <loc>${baseUrl}/tv/${show.id}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    // Create downloadable sitemap
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    link.click();
    URL.revokeObjectURL(url);
    
    return sitemap;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return null;
  }
};

export const SEOSitemap: React.FC = () => {
  useEffect(() => {
    // Auto-generate sitemap for SEO (you can call this manually or on schedule)
    // generateSitemap();
  }, []);

  return null; // This component doesn't render anything
};
