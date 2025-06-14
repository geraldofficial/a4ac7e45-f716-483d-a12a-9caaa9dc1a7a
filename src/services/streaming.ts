
export interface StreamingSource {
  name: string;
  baseUrl: string;
  movieUrl: (tmdbId: number) => string;
  tvUrl: (tmdbId: number, season: number, episode: number) => string;
}

export const streamingSources: StreamingSource[] = [
  {
    name: 'VidSrc',
    baseUrl: 'https://vidsrc.to',
    movieUrl: (tmdbId: number) => `https://vidsrc.to/embed/movie/${tmdbId}`,
    tvUrl: (tmdbId: number, season: number, episode: number) => 
      `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`
  },
  {
    name: 'SuperEmbed',
    baseUrl: 'https://multiembed.mov',
    movieUrl: (tmdbId: number) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
    tvUrl: (tmdbId: number, season: number, episode: number) => 
      `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`
  },
  {
    name: 'EmbedSu',
    baseUrl: 'https://embed.su',
    movieUrl: (tmdbId: number) => `https://embed.su/embed/movie/${tmdbId}`,
    tvUrl: (tmdbId: number, season: number, episode: number) => 
      `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`
  }
];

export const getStreamingUrl = (
  tmdbId: number, 
  type: 'movie' | 'tv', 
  sourceIndex: number = 0, 
  season?: number, 
  episode?: number
): string => {
  const source = streamingSources[sourceIndex];
  
  if (type === 'movie') {
    return source.movieUrl(tmdbId);
  } else {
    if (!season || !episode) {
      throw new Error('Season and episode are required for TV shows');
    }
    return source.tvUrl(tmdbId, season, episode);
  }
};
