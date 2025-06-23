-- Create user notifications table
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'announcement', 'update', 'promotion')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  metadata JSONB,
  action_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_notifications
CREATE POLICY "Users can view their own notifications" ON public.user_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.user_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON public.user_notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Admin can insert notifications for any user
CREATE POLICY "Admin can insert notifications" ON public.user_notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (metadata->>'role' = 'admin' OR metadata->>'is_admin' = 'true')
    )
    OR auth.uid() = user_id  -- Users can create notifications for themselves
  );

-- Enable realtime for notifications
ALTER TABLE public.user_notifications REPLICA IDENTITY FULL;

-- Add to realtime publication
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;
    EXCEPTION
        WHEN duplicate_object THEN
            NULL; -- Table already in publication
    END;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_unread ON public.user_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_starred ON public.user_notifications(user_id, is_starred) WHERE is_starred = true;
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON public.user_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_priority ON public.user_notifications(priority) WHERE priority IN ('high', 'urgent');

-- Function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Clean up expired notifications
  DELETE FROM public.user_notifications 
  WHERE expires_at IS NOT NULL 
  AND expires_at < now();
  
  -- Clean up old read notifications (older than 30 days)
  DELETE FROM public.user_notifications 
  WHERE is_read = true 
  AND read_at < (now() - interval '30 days');
END;
$$;

-- Function to create system notifications for all users
CREATE OR REPLACE FUNCTION create_system_notification(
  notification_title TEXT,
  notification_message TEXT,
  notification_type TEXT DEFAULT 'info',
  notification_priority TEXT DEFAULT 'medium',
  target_users TEXT DEFAULT 'all'
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert notification for all users or specific target
  INSERT INTO public.user_notifications (user_id, title, message, type, priority)
  SELECT 
    u.id,
    notification_title,
    notification_message,
    notification_type,
    notification_priority
  FROM auth.users u
  WHERE 
    CASE 
      WHEN target_users = 'all' THEN true
      WHEN target_users = 'active' THEN u.last_sign_in_at > (now() - interval '7 days')
      ELSE true
    END;
END;
$$;

-- Sample welcome notification function
CREATE OR REPLACE FUNCTION create_welcome_notification(user_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_notifications (user_id, title, message, type, priority, action_url)
  VALUES (
    user_id,
    'Welcome to FlickPick! 🎬',
    'Start exploring amazing movies and TV shows. Create your first watchlist and join the community!',
    'success',
    'high',
    '/browse'
  );
END;
$$;

-- Trigger to create welcome notification for new users
CREATE OR REPLACE FUNCTION trigger_welcome_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create welcome notification when a profile is created
  PERFORM create_welcome_notification(NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_welcome_notification();
