
import { supabase } from '@/integrations/supabase/client';

export const createAdFreeStreamUrl = async (originalUrl: string, userId?: string): Promise<string> => {
  if (!userId) {
    return originalUrl;
  }

  try {
    // Check if user has active email subscription (ad-free access)
    const { data: subscription } = await supabase
      .from('email_subscriptions')
      .select('is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (!subscription?.is_active) {
      return originalUrl;
    }

    // Create proxied URL for ad-free experience using the actual Supabase URL
    const proxyUrl = `https://ehqlkafauehdpqzrdkia.supabase.co/functions/v1/stream-proxy?url=${encodeURIComponent(originalUrl)}&user_id=${userId}`;
    
    console.log('Created ad-free stream URL for subscribed user');
    return proxyUrl;
  } catch (error) {
    console.error('Error creating ad-free stream URL:', error);
    return originalUrl;
  }
};

export const isAdFreeUser = async (userId: string): Promise<boolean> => {
  try {
    const { data: subscription } = await supabase
      .from('email_subscriptions')
      .select('is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    return !!subscription?.is_active;
  } catch (error) {
    console.error('Error checking ad-free status:', error);
    return false;
  }
};
