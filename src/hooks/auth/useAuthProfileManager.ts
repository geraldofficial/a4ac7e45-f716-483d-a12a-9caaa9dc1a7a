
import { userApi } from '@/services/user';
import { UserProfile } from '@/types/auth';

export const useAuthProfileManager = () => {
  const createBasicUserProfile = (authUser: any): UserProfile => {
    console.log('👤 Creating basic user profile for:', authUser.id);
    return {
      id: authUser.id,
      email: authUser.email,
      username: authUser.user_metadata?.username || null,
      full_name: authUser.user_metadata?.full_name || null,
      avatar: authUser.user_metadata?.avatar || '👤',
      watchlist: [],
      genre_preferences: [],
      onboarding_completed: false,
      email_welcomed: false,
    };
  };

  const fetchAndMergeProfile = async (userId: string, basicUser: UserProfile): Promise<UserProfile> => {
    try {
      console.log('🔍 Fetching extended profile for user:', userId);
      let profile = await userApi.getUserProfile(userId);
      
      // If no profile exists, create one
      if (!profile) {
        console.log('📝 No profile found, creating one...');
        try {
          profile = await userApi.createUserProfile(userId, {
            username: basicUser.username,
            full_name: basicUser.full_name,
            avatar: basicUser.avatar,
          });
        } catch (createError) {
          console.warn('⚠️ Failed to create profile, using basic user data:', createError);
          return basicUser;
        }
      }
      
      // Merge profile data with basic user data
      const fullUser: UserProfile = {
        ...basicUser,
        ...profile,
        // Ensure required fields are never null/undefined
        watchlist: profile.watchlist || [],
        genre_preferences: profile.genre_preferences || [],
        onboarding_completed: profile.onboarding_completed || false,
        email_welcomed: profile.email_welcomed || false,
      };
      
      console.log('🎉 Full user profile merged:', fullUser.id);
      return fullUser;
    } catch (error) {
      console.warn('⚠️ Profile fetch/merge failed, using basic profile:', error);
      return basicUser;
    }
  };

  return {
    createBasicUserProfile,
    fetchAndMergeProfile,
  };
};
