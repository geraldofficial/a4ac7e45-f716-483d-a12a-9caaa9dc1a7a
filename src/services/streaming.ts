
export interface StreamingSource {
  name: string;
  getUrl: (tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number) => string;
}

export const streamingSources: StreamingSource[] = [
  {
    name: 'VidSrc',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://vidsrc.to/embed/${type}/${tmdbId}`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}/${season}/${episode}`;
      }
      return baseUrl;
    }
  },
  {
    name: 'VidSrc Pro',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://vidsrc.pro/embed/${type}/${tmdbId}`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}/${season}/${episode}`;
      }
      return baseUrl;
    }
  },
  {
    name: 'VidSrc Me',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://vidsrc.me/embed/${type}?tmdb=${tmdbId}`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}&season=${season}&episode=${episode}`;
      }
      return baseUrl;
    }
  },
  {
    name: 'MoviesAPI',
    getUrl: (tmdbId, type, season, episode) => {
      if (type === 'tv' && season && episode) {
        return `https://moviesapi.club/tv/${tmdbId}-${season}-${episode}`;
      }
      return `https://moviesapi.club/${type}/${tmdbId}`;
    }
  },
  {
    name: 'SuperEmbed',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}&s=${season}&e=${episode}`;
      }
      return baseUrl;
    }
  },
  {
    name: 'EmbedSu',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://embed.su/embed/${type}/${tmdbId}`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}/${season}/${episode}`;
      }
      return baseUrl;
    }
  }
];

export const getStreamingUrl = (
  tmdbId: number, 
  type: 'movie' | 'tv', 
  sourceIndex: number = 0,
  season?: number,
  episode?: number
): string => {
  const source = streamingSources[sourceIndex] || streamingSources[0];
  return source.getUrl(tmdbId, type, season, episode);
};
