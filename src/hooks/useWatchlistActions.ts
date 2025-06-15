
import { UserProfile } from '@/types/auth';

export const useWatchlistActions = (
  user: UserProfile | null,
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
) => {
  const addToWatchlist = async (movieId: number) => {
    if (!user) return;
    
    const currentWatchlist = user.watchlist || [];
    if (!currentWatchlist.includes(movieId)) {
      const newWatchlist = [...currentWatchlist, movieId];
      await updateProfile({ watchlist: newWatchlist });
    }
  };

  const removeFromWatchlist = async (movieId: number) => {
    if (!user) return;
    
    const currentWatchlist = user.watchlist || [];
    const newWatchlist = currentWatchlist.filter(id => id !== movieId);
    await updateProfile({ watchlist: newWatchlist });
  };

  const isInWatchlist = (movieId: number): boolean => {
    if (!user || !user.watchlist) return false;
    return user.watchlist.includes(movieId);
  };

  const completeOnboarding = async (preferences: number[]) => {
    await updateProfile({ 
      genre_preferences: preferences, 
      onboarding_completed: true 
    });
  };

  return {
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    completeOnboarding,
  };
};
