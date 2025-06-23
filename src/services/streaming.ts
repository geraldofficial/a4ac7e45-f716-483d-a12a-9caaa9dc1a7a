export interface StreamingSource {
  name: string;
  getUrl: (
    tmdbId: number,
    type: "movie" | "tv",
    season?: number,
    episode?: number,
  ) => string;
  reliability: "high" | "medium" | "low";
  region?: string;
  description?: string;
}

// Enhanced parameters for better playback and reduced sandbox restrictions
const playbackParams =
  "&autoplay=1&muted=0&controls=1&preload=auto&buffer=30&quality=auto&allowfullscreen=1";

export const streamingSources: StreamingSource[] = [
  // High reliability sources - these typically work best
  {
    name: "VidSrc Pro",
    reliability: "high",
    description: "Fast loading with multiple server options",
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://vidsrc.pro/embed/${type}/${tmdbId}`;
      if (type === "tv" && season && episode) {
        return `${baseUrl}/${season}/${episode}${playbackParams}`;
      }
      return `${baseUrl}${playbackParams}`;
    },
  },
  {
    name: "VidSrc To",
    reliability: "high",
    description: "Reliable streaming with good quality",
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://vidsrc.to/embed/${type}/${tmdbId}`;
      if (type === "tv" && season && episode) {
        return `${baseUrl}/${season}/${episode}${playbackParams}`;
      }
      return `${baseUrl}${playbackParams}`;
    },
  },
  {
    name: "SuperEmbed",
    reliability: "high",
    description: "Multi-source aggregator with high uptime",
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1${playbackParams}`;
      if (type === "tv" && season && episode) {
        return `${baseUrl}&s=${season}&e=${episode}`;
      }
      return baseUrl;
    },
  },
  {
    name: "EmbedSu",
    reliability: "high",
    description: "Clean interface with stable streaming",
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://embed.su/embed/${type}/${tmdbId}`;
      if (type === "tv" && season && episode) {
        return `${baseUrl}/${season}/${episode}${playbackParams}`;
      }
      return `${baseUrl}${playbackParams}`;
    },
  },
  {
    name: "VidSrc Me",
    reliability: "high",
    description: "Legacy reliable source",
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://vidsrc.me/embed/${type}?tmdb=${tmdbId}${playbackParams}`;
      if (type === "tv" && season && episode) {
        return `${baseUrl}&season=${season}&episode=${episode}`;
      }
      return baseUrl;
    },
  },

  // Medium reliability sources - good fallbacks
  {
    name: "VidCloud",
    reliability: "medium",
    description: "Alternative source with decent quality",
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}${playbackParams}`;
      if (type === "tv" && season && episode) {
        return `${baseUrl}&season=${season}&episode=${episode}`;
      }
      return baseUrl;
    },
  },
  {
    name: "FilmXY",
    reliability: "medium",
    description: "HD streaming with good performance",
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://www.filmxy.vip/embed/${type}/${tmdbId}`;
      if (type === "tv" && season && episode) {
        return `${baseUrl}/${season}/${episode}${playbackParams}`;
      }
      return `${baseUrl}${playbackParams}`;
    },
  },
  {
    name: "VidStream",
    reliability: "medium",
    description: "Stable streaming with multiple servers",
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://vidstream.to/embed/${type}/${tmdbId}`;
      if (type === "tv" && season && episode) {
        return `${baseUrl}/${season}/${episode}${playbackParams}`;
      }
      return `${baseUrl}${playbackParams}`;
    },
  },
  {
    name: "AutoEmbed",
    reliability: "medium",
    description: "Automatic source selection",
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://player.autoembed.cc/embed/${type}/${tmdbId}`;
      if (type === "tv" && season && episode) {
        return `${baseUrl}/${season}/${episode}${playbackParams}`;
      }
      return `${baseUrl}${playbackParams}`;
    },
  },
  {
    name: "MoviesAPI",
    reliability: "medium",
    description: "API-based streaming service",
    getUrl: (tmdbId, type, season, episode) => {
      if (type === "tv" && season && episode) {
        return `https://moviesapi.club/tv/${tmdbId}-${season}-${episode}${playbackParams}`;
      }
      return `https://moviesapi.club/${type}/${tmdbId}${playbackParams}`;
    },
  },

  // Additional reliable sources
  {
    name: "VidLink Pro",
    reliability: "medium",
    description: "Pro streaming with enhanced features",
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://vidlink.pro/movie/${tmdbId}`;
      if (type === "tv" && season && episode) {
        return `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}${playbackParams}`;
      }
      return `${baseUrl}${playbackParams}`;
    },
  },
  {
    name: "EmbedVid",
    reliability: "medium",
    description: "Embedded video player with good compatibility",
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://embedder.net/e/${type}/${tmdbId}`;
      if (type === "tv" && season && episode) {
        return `${baseUrl}/${season}/${episode}${playbackParams}`;
      }
      return `${baseUrl}${playbackParams}`;
    },
  },
  {
    name: "DbGo",
    reliability: "medium",
    description: "Database-driven streaming platform",
    getUrl: (tmdbId, type, season, episode) => {
      if (type === "tv" && season && episode) {
        return `https://www.dbgo.fun/tv/${tmdbId}/${season}/${episode}${playbackParams}`;
      }
      return `https://www.dbgo.fun/movie/${tmdbId}${playbackParams}`;
    },
  },

  // Emergency fallback sources
  {
    name: "VidSrc CC",
    reliability: "low",
    description: "Backup source for when others fail",
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://vidsrc.cc/v2/embed/${type}/${tmdbId}`;
      if (type === "tv" && season && episode) {
        return `${baseUrl}/${season}/${episode}${playbackParams}`;
      }
      return `${baseUrl}${playbackParams}`;
    },
  },
  {
    name: "Embed Hub",
    reliability: "low",
    description: "Last resort streaming option",
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://embeds.to/embed/${type}/${tmdbId}`;
      if (type === "tv" && season && episode) {
        return `${baseUrl}/${season}/${episode}${playbackParams}`;
      }
      return `${baseUrl}${playbackParams}`;
    },
  },
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
  type: "movie" | "tv",
  sourceIndex: number = 0,
  season?: number,
  episode?: number,
): string => {
  const sortedSources = getSourcesByReliability();
  const source = sortedSources[sourceIndex] || sortedSources[0];

  try {
    return source.getUrl(tmdbId, type, season, episode);
  } catch (error) {
    console.error(`Error generating URL for source ${source.name}:`, error);
    // Return first available source as fallback
    return sortedSources[0].getUrl(tmdbId, type, season, episode);
  }
};

export const getHighReliabilitySources = (): StreamingSource[] => {
  return streamingSources.filter((source) => source.reliability === "high");
};

export const getMediumReliabilitySources = (): StreamingSource[] => {
  return streamingSources.filter((source) => source.reliability === "medium");
};

export const getAllSourcesByType = (
  reliability: "high" | "medium" | "low",
): StreamingSource[] => {
  return streamingSources.filter(
    (source) => source.reliability === reliability,
  );
};

// Test a source URL to check if it's accessible
export const testSourceUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-cache",
    });
    return response.ok;
  } catch (error) {
    console.warn("Source test failed:", error);
    return false;
  }
};

// Get best available source for specific content
export const getBestSourceForContent = async (
  tmdbId: number,
  type: "movie" | "tv",
  season?: number,
  episode?: number,
): Promise<{ source: StreamingSource; index: number; url: string } | null> => {
  const sortedSources = getSourcesByReliability();

  for (let i = 0; i < Math.min(3, sortedSources.length); i++) {
    const source = sortedSources[i];
    try {
      const url = source.getUrl(tmdbId, type, season, episode);
      // For now, just return the first high-reliability source
      // In production, you might want to test the URL
      if (source.reliability === "high") {
        return { source, index: i, url };
      }
    } catch (error) {
      console.warn(`Failed to generate URL for ${source.name}:`, error);
      continue;
    }
  }

  // Fallback to first available source
  const fallbackSource = sortedSources[0];
  return {
    source: fallbackSource,
    index: 0,
    url: fallbackSource.getUrl(tmdbId, type, season, episode),
  };
};

// Generate iframe sandbox attributes for better security and compatibility
export const getSandboxAttributes = (): string => {
  return [
    "allow-scripts",
    "allow-same-origin",
    "allow-presentation",
    "allow-forms",
    "allow-popups",
    "allow-popups-to-escape-sandbox",
    "allow-downloads",
    "allow-modals",
  ].join(" ");
};

// Generate allow attributes for iframe
export const getAllowAttributes = (): string => {
  return [
    "accelerometer",
    "autoplay",
    "clipboard-write",
    "encrypted-media",
    "gyroscope",
    "picture-in-picture",
    "web-share",
    "fullscreen",
    "microphone",
    "camera",
  ].join("; ");
};
