
import { supabase } from '@/integrations/supabase/client';

export const userApi = {
  async updateUser(updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserProfile(userId: string) {
    console.log('🔍 Fetching profile for user:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // Changed from .single() to .maybeSingle()
    
    if (error) {
      console.error('❌ Profile fetch error:', error);
      throw error;
    }
    
    console.log('✅ Profile fetch result:', data);
    return data;
  },

  async createUserProfile(userId: string, basicData: any = {}) {
    console.log('🆕 Creating profile for user:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username: basicData.username || null,
        full_name: basicData.full_name || null,
        avatar: basicData.avatar || '👤',
        watchlist: [],
        genre_preferences: [],
        onboarding_completed: false,
        email_welcomed: false,
        ...basicData
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Profile creation error:', error);
      throw error;
    }
    
    console.log('✅ Profile created:', data);
    return data;
  },
};
