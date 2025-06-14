
export interface StreamingSource {
  name: string;
  getUrl: (tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number) => string;
  reliability: 'high' | 'medium' | 'low';
  region?: string;
}

// Enhanced parameters for better playback
const playbackParams = '&autoplay=1&muted=0&controls=1&preload=auto&buffer=30&quality=auto';

export const streamingSources: StreamingSource[] = [
  // High reliability sources
  {
    name: 'VidSrc Me',
    reliability: 'high',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://vidsrc.me/embed/${type}?tmdb=${tmdbId}${playbackParams}`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}&season=${season}&episode=${episode}`;
      }
      return baseUrl;
    }
  },
  {
    name: 'VidSrc Pro',
    reliability: 'high',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://vidsrc.pro/embed/${type}/${tmdbId}`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}/${season}/${episode}${playbackParams}`;
      }
      return `${baseUrl}${playbackParams}`;
    }
  },
  {
    name: 'VidSrc',
    reliability: 'high',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://vidsrc.to/embed/${type}/${tmdbId}`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}/${season}/${episode}${playbackParams}`;
      }
      return `${baseUrl}${playbackParams}`;
    }
  },
  {
    name: 'SuperEmbed',
    reliability: 'high',
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
    reliability: 'high',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://embed.su/embed/${type}/${tmdbId}`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}/${season}/${episode}${playbackParams}`;
      }
      return `${baseUrl}${playbackParams}`;
    }
  },
  // Medium reliability sources
  {
    name: 'VidLink Pro',
    reliability: 'medium',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://vidlink.pro/movie/${tmdbId}`;
      if (type === 'tv' && season && episode) {
        return `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}${playbackParams}`;
      }
      return `${baseUrl}${playbackParams}`;
    }
  },
  {
    name: 'MoviesAPI',
    reliability: 'medium',
    getUrl: (tmdbId, type, season, episode) => {
      if (type === 'tv' && season && episode) {
        return `https://moviesapi.club/tv/${tmdbId}-${season}-${episode}${playbackParams}`;
      }
      return `https://moviesapi.club/${type}/${tmdbId}${playbackParams}`;
    }
  },
  {
    name: 'AutoEmbed',
    reliability: 'medium',
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
    reliability: 'medium',
    getUrl: (tmdbId, type, season, episode) => {
      if (type === 'tv' && season && episode) {
        return `https://www.dbgo.fun/tv/${tmdbId}/${season}/${episode}${playbackParams}`;
      }
      return `https://www.dbgo.fun/movie/${tmdbId}${playbackParams}`;
    }
  },
  {
    name: 'VidCloud',
    reliability: 'medium',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}${playbackParams}`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}&season=${season}&episode=${episode}`;
      }
      return baseUrl;
    }
  },
  // Additional reliable sources
  {
    name: 'FilmXY',
    reliability: 'high',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://www.filmxy.vip/embed/${type}/${tmdbId}`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}/${season}/${episode}${playbackParams}`;
      }
      return `${baseUrl}${playbackParams}`;
    }
  },
  {
    name: 'VidStream',
    reliability: 'high',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://vidstream.to/embed/${type}/${tmdbId}`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}/${season}/${episode}${playbackParams}`;
      }
      return `${baseUrl}${playbackParams}`;
    }
  },
  {
    name: 'EmbedVid',
    reliability: 'medium',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://embedder.net/e/${type}/${tmdbId}`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}/${season}/${episode}${playbackParams}`;
      }
      return `${baseUrl}${playbackParams}`;
    }
  }
];

// Get sources sorted by reliability
export const getSourcesByReliability = (): StreamingSource[] => {
  return streamingSources.sort((a, b) => {
    const reliabilityOrder = { high: 3, medium: 2, low: 1 };
    return reliabilityOrder[b.reliability] - reliabilityOrder[a.reliability];
  });
};

export const getStreamingUrl = (
  tmdbId: number, 
  type: 'movie' | 'tv', 
  sourceIndex: number = 0,
  season?: number,
  episode?: number
): string => {
  const sortedSources = getSourcesByReliability();
  const source = sortedSources[sourceIndex] || sortedSources[0];
  return source.getUrl(tmdbId, type, season, episode);
};

export const getHighReliabilitySources = (): StreamingSource[] => {
  return streamingSources.filter(source => source.reliability === 'high');
};
