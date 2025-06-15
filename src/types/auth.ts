
export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  image?: string;
  avatar_url?: string;
  avatar?: string;
  username?: string;
  full_name?: string;
  created_at?: string;
  updated_at?: string;
  watchlist?: number[];
  genre_preferences?: number[];
  onboarding_completed?: boolean;
  email_welcomed?: boolean;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username?: string) => Promise<void>;
  addToWatchlist: (movieId: number) => Promise<void>;
  removeFromWatchlist: (movieId: number) => Promise<void>;
  isInWatchlist: (movieId: number) => boolean;
  completeOnboarding: (preferences: number[]) => Promise<void>;
}
