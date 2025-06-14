
-- Create a table to track email subscriptions
CREATE TABLE public.email_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  email VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  frequency VARCHAR(20) NOT NULL DEFAULT 'daily', -- daily, weekly, monthly
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for email subscriptions
CREATE POLICY "Users can view their own subscriptions" 
  ON public.email_subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" 
  ON public.email_subscriptions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
  ON public.email_subscriptions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions" 
  ON public.email_subscriptions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job to send daily emails at 9 AM UTC
SELECT cron.schedule(
  'send-daily-trending-emails',
  '0 9 * * *', -- Daily at 9 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://ehqlkafauehdpqzrdkia.supabase.co/functions/v1/send-daily-trending-batch',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVocWxrYWZhdWVoZHBxenJka2lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzE2NTAsImV4cCI6MjA2NTMwNzY1MH0.b9QDfH7wjlYfwK1-_QhaaRcN1CWIuC3qoHcyh1NYoRU"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);
