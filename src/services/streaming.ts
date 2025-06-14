
export interface StreamingSource {
  name: string;
  getUrl: (tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number) => string;
}

// Enhanced parameters for better playback without sandboxing restrictions
const playbackParams = '&autoplay=1&muted=0&controls=1&preload=auto&buffer=30&quality=auto';

export const streamingSources: StreamingSource[] = [
  {
    name: 'VidSrc Me',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://vidsrc.me/embed/${type}?tmdb=${tmdbId}${playbackParams}`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}&season=${season}&episode=${episode}`;
      }
      return baseUrl;
    }
  },
  {
    name: 'VidSrc',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://vidsrc.to/embed/${type}/${tmdbId}`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}/${season}/${episode}${playbackParams}`;
      }
      return `${baseUrl}${playbackParams}`;
    }
  },
  {
    name: 'VidSrc Pro',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://vidsrc.pro/embed/${type}/${tmdbId}`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}/${season}/${episode}${playbackParams}`;
      }
      return `${baseUrl}${playbackParams}`;
    }
  },
  {
    name: 'MoviesAPI',
    getUrl: (tmdbId, type, season, episode) => {
      if (type === 'tv' && season && episode) {
        return `https://moviesapi.club/tv/${tmdbId}-${season}-${episode}${playbackParams}`;
      }
      return `https://moviesapi.club/${type}/${tmdbId}${playbackParams}`;
    }
  },
  {
    name: 'SuperEmbed',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1${playbackParams}`;
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
        return `${baseUrl}/${season}/${episode}${playbackParams}`;
      }
      return `${baseUrl}${playbackParams}`;
    }
  },
  {
    name: 'VidLink',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://vidlink.pro/movie/${tmdbId}`;
      if (type === 'tv' && season && episode) {
        return `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}${playbackParams}`;
      }
      return `${baseUrl}${playbackParams}`;
    }
  },
  {
    name: 'VidCloud',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}${playbackParams}`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}&season=${season}&episode=${episode}`;
      }
      return baseUrl;
    }
  },
  {
    name: 'AutoEmbed',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://player.autoembed.cc/embed/${type}/${tmdbId}`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}/${season}/${episode}${playbackParams}`;
      }
      return `${baseUrl}${playbackParams}`;
    }
  },
  {
    name: 'DbGo',
    getUrl: (tmdbId, type, season, episode) => {
      if (type === 'tv' && season && episode) {
        return `https://www.dbgo.fun/tv/${tmdbId}/${season}/${episode}${playbackParams}`;
      }
      return `https://www.dbgo.fun/movie/${tmdbId}${playbackParams}`;
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
