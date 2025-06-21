-- Create user notifications table
CREATE TABLE public.user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error', 'announcement', 'update', 'promotion')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  action_label TEXT,
  image_url TEXT,
  sender_name TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notification templates table for admins
CREATE TABLE public.notification_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error', 'announcement', 'update', 'promotion')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT,
  action_url TEXT,
  action_label TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create notification broadcasts table for mass notifications
CREATE TABLE public.notification_broadcasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error', 'announcement', 'update', 'promotion')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'active', 'premium', 'new_users', 'inactive')),
  category TEXT,
  action_url TEXT,
  action_label TEXT,
  image_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  sender_name TEXT,
  total_recipients INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_broadcasts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_notifications
CREATE POLICY "Users can view their own notifications" ON public.user_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.user_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications" ON public.user_notifications
  FOR INSERT WITH CHECK (true); -- Admins will insert via functions

CREATE POLICY "Users can delete their own notifications" ON public.user_notifications
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for notification_templates (admin only)
CREATE POLICY "Only admins can manage templates" ON public.notification_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for notification_broadcasts (admin only)
CREATE POLICY "Only admins can manage broadcasts" ON public.notification_broadcasts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create function to send notification to specific user
CREATE OR REPLACE FUNCTION public.send_notification_to_user(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_priority TEXT DEFAULT 'medium',
  p_category TEXT DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_action_label TEXT DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_sender_name TEXT DEFAULT 'FlickPick Team'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.user_notifications (
    user_id,
    title,
    message,
    type,
    priority,
    category,
    action_url,
    action_label,
    image_url,
    expires_at,
    sender_name
  )
  VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_priority,
    p_category,
    p_action_url,
    p_action_label,
    p_image_url,
    p_expires_at,
    p_sender_name
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Create function to broadcast notification to multiple users
CREATE OR REPLACE FUNCTION public.broadcast_notification(
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_priority TEXT DEFAULT 'medium',
  p_target_audience TEXT DEFAULT 'all',
  p_category TEXT DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_action_label TEXT DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_sender_id UUID DEFAULT auth.uid(),
  p_sender_name TEXT DEFAULT 'FlickPick Team'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  broadcast_id UUID;
  user_record RECORD;
  recipient_count INTEGER := 0;
BEGIN
  -- Create broadcast record
  INSERT INTO public.notification_broadcasts (
    title,
    message,
    type,
    priority,
    target_audience,
    category,
    action_url,
    action_label,
    image_url,
    expires_at,
    sender_id,
    sender_name,
    sent_at
  )
  VALUES (
    p_title,
    p_message,
    p_type,
    p_priority,
    p_target_audience,
    p_category,
    p_action_url,
    p_action_label,
    p_image_url,
    p_expires_at,
    p_sender_id,
    p_sender_name,
    now()
  )
  RETURNING id INTO broadcast_id;
  
  -- Send to specific user groups based on target_audience
  FOR user_record IN
    SELECT id FROM auth.users
    WHERE 
      CASE p_target_audience
        WHEN 'all' THEN true
        WHEN 'active' THEN last_sign_in_at > now() - interval '30 days'
        WHEN 'new_users' THEN created_at > now() - interval '7 days'
        WHEN 'inactive' THEN last_sign_in_at < now() - interval '30 days' OR last_sign_in_at IS NULL
        ELSE true
      END
  LOOP
    PERFORM public.send_notification_to_user(
      user_record.id,
      p_title,
      p_message,
      p_type,
      p_priority,
      p_category,
      p_action_url,
      p_action_label,
      p_image_url,
      p_expires_at,
      p_sender_name
    );
    
    recipient_count := recipient_count + 1;
  END LOOP;
  
  -- Update recipient count
  UPDATE public.notification_broadcasts 
  SET total_recipients = recipient_count
  WHERE id = broadcast_id;
  
  RETURN broadcast_id;
END;
$$;

-- Create function to clean up expired notifications
CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.user_notifications 
  WHERE expires_at IS NOT NULL AND expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX idx_user_notifications_created_at ON public.user_notifications(created_at DESC);
CREATE INDEX idx_user_notifications_is_read ON public.user_notifications(is_read) WHERE is_read = false;
CREATE INDEX idx_user_notifications_priority ON public.user_notifications(priority) WHERE priority IN ('high', 'urgent');
CREATE INDEX idx_user_notifications_expires_at ON public.user_notifications(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX idx_notification_broadcasts_sent_at ON public.notification_broadcasts(sent_at DESC);
CREATE INDEX idx_notification_broadcasts_target_audience ON public.notification_broadcasts(target_audience);

CREATE INDEX idx_notification_templates_is_active ON public.notification_templates(is_active) WHERE is_active = true;
CREATE INDEX idx_notification_templates_category ON public.notification_templates(category);

-- Enable realtime for user_notifications
ALTER TABLE public.user_notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_notifications_updated_at
  BEFORE UPDATE ON public.user_notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_broadcasts_updated_at
  BEFORE UPDATE ON public.notification_broadcasts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample notification templates
INSERT INTO public.notification_templates (name, title, message, type, priority, category) VALUES
('welcome', 'Welcome to FlickPick!', 'Thank you for joining FlickPick. Discover amazing movies and TV shows today!', 'success', 'medium', 'welcome'),
('new_feature', 'New Feature Available', 'We''ve added an exciting new feature to enhance your viewing experience!', 'announcement', 'high', 'feature'),
('maintenance', 'Scheduled Maintenance', 'FlickPick will be under maintenance. We apologize for any inconvenience.', 'warning', 'high', 'maintenance'),
('security_alert', 'Security Alert', 'We detected unusual activity on your account. Please review your security settings.', 'warning', 'urgent', 'security');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_notifications TO authenticated;
GRANT ALL ON public.notification_templates TO authenticated;
GRANT ALL ON public.notification_broadcasts TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_notification_to_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.broadcast_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_notifications TO authenticated;
