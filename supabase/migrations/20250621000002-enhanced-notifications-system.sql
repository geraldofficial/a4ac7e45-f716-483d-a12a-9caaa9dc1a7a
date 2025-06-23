-- Enhanced Notifications System Migration
-- This migration creates all the tables needed for a comprehensive notification system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Notification Types and Priorities as ENUM types
CREATE TYPE notification_type AS ENUM (
  'info', 'success', 'warning', 'error', 'announcement', 
  'friend_request', 'watch_party_invite', 'content_recommendation', 
  'system_update', 'reminder', 'achievement', 'promo'
);

CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'cancelled');

-- Enhanced User Notifications Table
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type DEFAULT 'info',
  priority notification_priority DEFAULT 'medium',
  is_read BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  starred_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  image_url TEXT,
  actions JSONB, -- Array of action buttons
  metadata JSONB, -- Additional data
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Preferences Table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  watch_party_invites BOOLEAN DEFAULT TRUE,
  friend_requests BOOLEAN DEFAULT TRUE,
  new_content BOOLEAN DEFAULT TRUE,
  system_updates BOOLEAN DEFAULT TRUE,
  marketing BOOLEAN DEFAULT FALSE,
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Templates Table
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type DEFAULT 'info',
  priority notification_priority DEFAULT 'medium',
  variables JSONB, -- Array of variable names like ["user_name", "content_title"]
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled Notifications Table
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type DEFAULT 'info',
  priority notification_priority DEFAULT 'medium',
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status notification_status DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  action_url TEXT,
  image_url TEXT,
  actions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push Subscriptions Table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL, -- Contains p256dh and auth keys
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Notification Analytics Table
CREATE TABLE IF NOT EXISTS notification_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id UUID REFERENCES user_notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'sent', 'read', 'clicked', 'dismissed', 'starred'
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_type ON user_notifications(type);
CREATE INDEX IF NOT EXISTS idx_user_notifications_priority ON user_notifications(priority);
CREATE INDEX IF NOT EXISTS idx_user_notifications_expires_at ON user_notifications(expires_at);

CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_user_id ON scheduled_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled_for ON scheduled_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_status ON scheduled_notifications(status);

CREATE INDEX IF NOT EXISTS idx_notification_analytics_user_id ON notification_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_analytics_created_at ON notification_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_analytics_event_type ON notification_analytics(event_type);

-- RLS (Row Level Security) Policies

-- User Notifications Policies
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON user_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON user_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON user_notifications
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON user_notifications
  FOR INSERT WITH CHECK (true);

-- Notification Preferences Policies
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notification Templates Policies (Admin only for now)
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active templates" ON notification_templates
  FOR SELECT USING (is_active = true);

-- Scheduled Notifications Policies
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scheduled notifications" ON scheduled_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage scheduled notifications" ON scheduled_notifications
  FOR ALL USING (true);

-- Push Subscriptions Policies
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own push subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Notification Analytics Policies
ALTER TABLE notification_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analytics" ON notification_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert analytics" ON notification_analytics
  FOR INSERT WITH CHECK (true);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at timestamps
CREATE TRIGGER update_user_notifications_updated_at BEFORE UPDATE ON user_notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_notifications_updated_at BEFORE UPDATE ON scheduled_notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_push_subscriptions_updated_at BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_notifications 
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to process scheduled notifications
CREATE OR REPLACE FUNCTION process_scheduled_notifications()
RETURNS INTEGER AS $$
DECLARE
  processed_count INTEGER := 0;
  notification_record RECORD;
BEGIN
  FOR notification_record IN
    SELECT * FROM scheduled_notifications 
    WHERE status = 'pending' AND scheduled_for <= NOW()
    ORDER BY scheduled_for
    LIMIT 100
  LOOP
    -- Insert into user_notifications
    INSERT INTO user_notifications (
      user_id, title, message, type, priority, action_url, image_url, actions
    ) VALUES (
      notification_record.user_id,
      notification_record.title,
      notification_record.message,
      notification_record.type,
      notification_record.priority,
      notification_record.action_url,
      notification_record.image_url,
      notification_record.actions
    );
    
    -- Update scheduled notification status
    UPDATE scheduled_notifications 
    SET status = 'sent', sent_at = NOW()
    WHERE id = notification_record.id;
    
    processed_count := processed_count + 1;
  END LOOP;
  
  RETURN processed_count;
END;
$$ LANGUAGE plpgsql;

-- Insert some default notification templates
INSERT INTO notification_templates (name, title, message, type, priority, variables) VALUES
  ('welcome', 'Welcome to FlickPick! 🎬', 'Hi {{user_name}}, welcome to FlickPick! Start exploring amazing movies and TV shows.', 'success', 'medium', '["user_name"]'),
  ('friend_request', 'New Friend Request', '{{requester_name}} wants to be your friend!', 'friend_request', 'medium', '["requester_name"]'),
  ('watch_party_invite', 'Watch Party Invitation', '{{host_name}} invited you to watch {{movie_title}}!', 'watch_party_invite', 'high', '["host_name", "movie_title"]'),
  ('content_recommendation', 'New Recommendation', 'Based on your interests, you might like {{content_title}}!', 'content_recommendation', 'low', '["content_title"]'),
  ('system_maintenance', 'System Maintenance', 'Scheduled maintenance will occur from {{start_time}} to {{end_time}}.', 'system_update', 'high', '["start_time", "end_time"]')
ON CONFLICT (name) DO NOTHING;

-- Create a function to get notification stats
CREATE OR REPLACE FUNCTION get_notification_stats(target_user_id UUID)
RETURNS TABLE (
  total BIGINT,
  unread BIGINT,
  starred BIGINT,
  urgent BIGINT,
  by_type JSONB,
  by_priority JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      COUNT(*) as total_count,
      COUNT(*) FILTER (WHERE is_read = false) as unread_count,
      COUNT(*) FILTER (WHERE is_starred = true) as starred_count,
      COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_count,
      jsonb_object_agg(type, type_count) as type_stats,
      jsonb_object_agg(priority, priority_count) as priority_stats
    FROM (
      SELECT 
        type,
        priority,
        is_read,
        is_starred,
        COUNT(*) OVER (PARTITION BY type) as type_count,
        COUNT(*) OVER (PARTITION BY priority) as priority_count
      FROM user_notifications 
      WHERE user_id = target_user_id
    ) grouped
  )
  SELECT 
    total_count,
    unread_count,
    starred_count,
    urgent_count,
    type_stats,
    priority_stats
  FROM stats;
END;
$$ LANGUAGE plpgsql;

COMMENT ON MIGRATION IS 'Enhanced notifications system with preferences, templates, scheduling, push notifications, and analytics';
