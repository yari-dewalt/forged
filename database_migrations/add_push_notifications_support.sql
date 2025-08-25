-- Add push token support to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token TEXT;
CREATE INDEX IF NOT EXISTS idx_profiles_push_token ON profiles(push_token) WHERE push_token IS NOT NULL;

-- Create push_notifications table for batching/tracking sent notifications
CREATE TABLE IF NOT EXISTS push_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  content JSONB NOT NULL,
  
  -- Batching fields
  batch_key TEXT, -- For grouping similar notifications
  batch_count INTEGER DEFAULT 1,
  last_actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- State tracking
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_push_notifications_user_id ON push_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_push_notifications_batch_key ON push_notifications(batch_key) WHERE batch_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_push_notifications_sent_at ON push_notifications(sent_at);
CREATE INDEX IF NOT EXISTS idx_push_notifications_created_at ON push_notifications(created_at DESC);

-- Enable RLS
ALTER TABLE push_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own push notifications"
  ON push_notifications FOR SELECT
  USING (user_id = auth.uid());

-- Create notification batching function
CREATE OR REPLACE FUNCTION create_or_update_push_notification(
  p_user_id UUID,
  p_notification_type VARCHAR(50),
  p_content JSONB,
  p_batch_key TEXT DEFAULT NULL,
  p_actor_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  existing_notification push_notifications;
  notification_id UUID;
BEGIN
  -- If we have a batch key, try to find and update existing notification
  IF p_batch_key IS NOT NULL THEN
    SELECT * INTO existing_notification 
    FROM push_notifications 
    WHERE user_id = p_user_id 
      AND batch_key = p_batch_key 
      AND sent_at IS NULL
      AND created_at > NOW() - INTERVAL '5 minutes' -- Only batch within 5 minutes
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF FOUND THEN
      -- Update existing notification with new count and latest actor
      UPDATE push_notifications 
      SET 
        batch_count = batch_count + 1,
        last_actor_id = COALESCE(p_actor_id, last_actor_id),
        content = p_content,
        updated_at = NOW()
      WHERE id = existing_notification.id
      RETURNING id INTO notification_id;
      
      RETURN notification_id;
    END IF;
  END IF;
  
  -- Create new notification
  INSERT INTO push_notifications (
    user_id,
    notification_type,
    content,
    batch_key,
    last_actor_id
  ) VALUES (
    p_user_id,
    p_notification_type,
    p_content,
    p_batch_key,
    p_actor_id
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
