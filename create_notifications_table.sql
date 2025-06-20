-- Manual SQL script to create user_notifications table
-- Run this in your Supabase SQL editor if the migration hasn't been applied

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

-- Insert some sample notifications for testing
INSERT INTO public.user_notifications (user_id, title, message, type, priority, action_url)
SELECT 
  id,
  'Welcome to FlickPick! 🎬',
  'Start exploring amazing movies and TV shows. Create your first watchlist and join the community!',
  'success',
  'high',
  '/browse'
FROM auth.users
WHERE id NOT IN (SELECT DISTINCT user_id FROM public.user_notifications WHERE title LIKE 'Welcome%')
LIMIT 10; -- Limit to prevent too many insertions

-- Success message
SELECT 'User notifications table created successfully!' as result;
