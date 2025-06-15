
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  avatar: string;
  is_child: boolean;
  age_restriction: number;
  created_at: string;
  updated_at: string;
}

export interface ViewingPreferences {
  id: string;
  profile_id: string;
  preferred_genres: number[];
  preferred_languages: string[];
  subtitle_language: string;
  auto_play: boolean;
  content_filter: string;
  created_at: string;
  updated_at: string;
}

export interface ContentRating {
  id: string;
  profile_id: string;
  tmdb_id: number;
  content_type: string;
  rating: number;
  review?: string;
  created_at: string;
  updated_at: string;
}

export interface WatchProgress {
  id: string;
  profile_id: string;
  tmdb_id: number;
  content_type: string;
  season?: number;
  episode?: number;
  progress_seconds: number;
  duration_seconds?: number;
  completed: boolean;
  last_watched_at: string;
  created_at: string;
}

export const profilesApi = {
  // User Profiles
  async getUserProfiles(userId: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createProfile(profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(profileId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', profileId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProfile(profileId: string): Promise<void> {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', profileId);

    if (error) throw error;
  },

  // Viewing Preferences
  async getViewingPreferences(profileId: string): Promise<ViewingPreferences | null> {
    const { data, error } = await supabase
      .from('viewing_preferences')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateViewingPreferences(
    profileId: string, 
    preferences: Partial<ViewingPreferences>
  ): Promise<ViewingPreferences> {
    const { data, error } = await supabase
      .from('viewing_preferences')
      .upsert({
        profile_id: profileId,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Content Ratings
  async getContentRating(profileId: string, tmdbId: number, contentType: string): Promise<ContentRating | null> {
    const { data, error } = await supabase
      .from('content_ratings')
      .select('*')
      .eq('profile_id', profileId)
      .eq('tmdb_id', tmdbId)
      .eq('content_type', contentType)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async rateContent(
    profileId: string,
    tmdbId: number,
    contentType: string,
    rating: number,
    review?: string
  ): Promise<ContentRating> {
    const { data, error } = await supabase
      .from('content_ratings')
      .upsert({
        profile_id: profileId,
        tmdb_id: tmdbId,
        content_type: contentType,
        rating,
        review,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getProfileRatings(profileId: string, limit = 20): Promise<ContentRating[]> {
    const { data, error } = await supabase
      .from('content_ratings')
      .select('*')
      .eq('profile_id', profileId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Watch Progress
  async getWatchProgress(
    profileId: string,
    tmdbId: number,
    contentType: string,
    season?: number,
    episode?: number
  ): Promise<WatchProgress | null> {
    let query = supabase
      .from('watch_progress')
      .select('*')
      .eq('profile_id', profileId)
      .eq('tmdb_id', tmdbId)
      .eq('content_type', contentType);

    if (season !== undefined) query = query.eq('season', season);
    if (episode !== undefined) query = query.eq('episode', episode);

    const { data, error } = await query.maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateWatchProgress(progressData: Omit<WatchProgress, 'id' | 'created_at'>): Promise<WatchProgress> {
    const { data, error } = await supabase
      .from('watch_progress')
      .upsert({
        ...progressData,
        last_watched_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getContinueWatching(profileId: string, limit = 10): Promise<WatchProgress[]> {
    const { data, error } = await supabase
      .from('watch_progress')
      .select('*')
      .eq('profile_id', profileId)
      .eq('completed', false)
      .gt('progress_seconds', 300) // More than 5 minutes
      .order('last_watched_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getWatchHistory(profileId: string, limit = 50): Promise<WatchProgress[]> {
    const { data, error } = await supabase
      .from('watch_progress')
      .select('*')
      .eq('profile_id', profileId)
      .order('last_watched_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Analytics
  async getWatchingStats(profileId: string) {
    const { data: allProgress, error } = await supabase
      .from('watch_progress')
      .select('*')
      .eq('profile_id', profileId);

    if (error) throw error;

    const stats = {
      totalWatchTime: allProgress?.reduce((sum, item) => sum + (item.progress_seconds || 0), 0) || 0,
      completedItems: allProgress?.filter(item => item.completed).length || 0,
      moviesWatched: allProgress?.filter(item => item.content_type === 'movie').length || 0,
      tvShowsWatched: allProgress?.filter(item => item.content_type === 'tv').length || 0,
      totalItems: allProgress?.length || 0
    };

    return stats;
  }
};
