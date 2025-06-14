
export interface ContentRating {
  rating: string;
  allowedAges: number[];
}

export const CONTENT_RATINGS: Record<string, ContentRating> = {
  'G': { rating: 'G', allowedAges: [0, 5, 10, 15, 20] },
  'PG': { rating: 'PG', allowedAges: [5, 10, 15, 20] },
  'PG-13': { rating: 'PG-13', allowedAges: [13, 15, 20] },
  'R': { rating: 'R', allowedAges: [17, 20] },
  'NC-17': { rating: 'NC-17', allowedAges: [18, 20] },
  'TV-Y': { rating: 'TV-Y', allowedAges: [0, 5, 10, 15, 20] },
  'TV-Y7': { rating: 'TV-Y7', allowedAges: [7, 10, 15, 20] },
  'TV-G': { rating: 'TV-G', allowedAges: [0, 5, 10, 15, 20] },
  'TV-PG': { rating: 'TV-PG', allowedAges: [10, 15, 20] },
  'TV-14': { rating: 'TV-14', allowedAges: [14, 15, 20] },
  'TV-MA': { rating: 'TV-MA', allowedAges: [17, 20] },
};

export type AccountType = 'adult' | 'teen' | 'kids';

export const getMaxRatingForAccountType = (accountType: AccountType): number => {
  switch (accountType) {
    case 'kids':
      return 6.0; // Family-friendly content
    case 'teen':
      return 7.5; // PG-13 and below
    case 'adult':
    default:
      return 10.0; // All content
  }
};

export const getAllowedGenresForAccountType = (accountType: AccountType): number[] => {
  // Genre IDs from TMDB
  const genres = {
    // Kid-friendly genres
    animation: 16,
    family: 10751,
    music: 10402,
    
    // Teen-friendly genres (includes kid-friendly)
    adventure: 12,
    comedy: 35,
    fantasy: 14,
    romance: 10749,
    scienceFiction: 878,
    
    // Adult genres (includes all)
    action: 28,
    crime: 80,
    drama: 18,
    horror: 27,
    mystery: 9648,
    thriller: 53,
    war: 10752,
    western: 37,
    documentary: 99,
    history: 36,
  };

  switch (accountType) {
    case 'kids':
      return [
        genres.animation,
        genres.family,
        genres.music,
        genres.adventure,
        genres.comedy,
        genres.fantasy,
      ];
    case 'teen':
      return [
        genres.animation,
        genres.family,
        genres.music,
        genres.adventure,
        genres.comedy,
        genres.fantasy,
        genres.romance,
        genres.scienceFiction,
        genres.mystery,
        genres.documentary,
      ];
    case 'adult':
    default:
      return Object.values(genres);
  }
};

export const isContentAppropriate = (
  content: any,
  accountType: AccountType
): boolean => {
  const maxRating = getMaxRatingForAccountType(accountType);
  const allowedGenres = getAllowedGenresForAccountType(accountType);
  
  // Check rating
  if (content.vote_average && content.vote_average > maxRating && accountType !== 'adult') {
    return false;
  }
  
  // Check genres
  if (content.genre_ids && content.genre_ids.length > 0) {
    const hasAllowedGenre = content.genre_ids.some((genreId: number) => 
      allowedGenres.includes(genreId)
    );
    if (!hasAllowedGenre && accountType !== 'adult') {
      return false;
    }
  }
  
  // Additional checks for kids content
  if (accountType === 'kids') {
    // Block content with adult themes in overview
    const overview = (content.overview || '').toLowerCase();
    const adultKeywords = ['violence', 'blood', 'murder', 'death', 'kill', 'drug', 'sex', 'mature'];
    if (adultKeywords.some(keyword => overview.includes(keyword))) {
      return false;
    }
  }
  
  return true;
};

export const filterContentByAccountType = (
  contentList: any[],
  accountType: AccountType
): any[] => {
  if (accountType === 'adult') {
    return contentList; // No filtering for adults
  }
  
  return contentList.filter(content => isContentAppropriate(content, accountType));
};
