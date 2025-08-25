-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'post_like',
    'follow',
    'routine_like', 
    'routine_save',
    'comment_like',
    'comment_reply',
    'post_comment'
  )),
  
  -- Reference IDs for different notification types
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  -- Notification content
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- State management
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT unique_notification UNIQUE (recipient_id, actor_id, type, post_id, routine_id, comment_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id ON notifications(actor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read ON notifications(recipient_id, read);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (recipient_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (recipient_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_notifications_updated_at_trigger ON notifications;
CREATE TRIGGER update_notifications_updated_at_trigger
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Function to create notifications (to be called by other triggers)
CREATE OR REPLACE FUNCTION create_notification(
  p_recipient_id UUID,
  p_actor_id UUID,
  p_type VARCHAR(50),
  p_post_id UUID DEFAULT NULL,
  p_routine_id UUID DEFAULT NULL,
  p_comment_id UUID DEFAULT NULL,
  p_title VARCHAR(255) DEFAULT NULL,
  p_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
  actor_username TEXT;
  generated_title VARCHAR(255);
  generated_message TEXT;
BEGIN
  -- Don't create notification if actor is same as recipient
  IF p_recipient_id = p_actor_id THEN
    RETURN NULL;
  END IF;
  
  -- Get actor username
  SELECT username INTO actor_username 
  FROM profiles 
  WHERE id = p_actor_id;
  
  -- Generate title and message based on type if not provided
  IF p_title IS NULL OR p_message IS NULL THEN
    CASE p_type
      WHEN 'post_like' THEN
        generated_title := actor_username || ' liked your post';
        generated_message := actor_username || ' liked your post';
      WHEN 'follow' THEN
        generated_title := actor_username || ' started following you';
        generated_message := actor_username || ' started following you';
      WHEN 'routine_like' THEN
        generated_title := actor_username || ' liked your routine';
        generated_message := actor_username || ' liked your routine';
      WHEN 'routine_save' THEN
        generated_title := actor_username || ' saved your routine';
        generated_message := actor_username || ' saved your routine';
      WHEN 'comment_like' THEN
        generated_title := actor_username || ' liked your comment';
        generated_message := actor_username || ' liked your comment';
      WHEN 'comment_reply' THEN
        generated_title := actor_username || ' replied to your comment';
        generated_message := actor_username || ' replied to your comment';
      WHEN 'post_comment' THEN
        generated_title := actor_username || ' commented on your post';
        generated_message := actor_username || ' commented on your post';
      ELSE
        generated_title := 'New notification';
        generated_message := 'You have a new notification';
    END CASE;
  END IF;
  
  -- Use provided title/message or generated ones
  generated_title := COALESCE(p_title, generated_title);
  generated_message := COALESCE(p_message, generated_message);
  
  -- Insert or update notification (upsert)
  INSERT INTO notifications (
    recipient_id,
    actor_id,
    type,
    post_id,
    routine_id,
    comment_id,
    title,
    message,
    read,
    created_at
  )
  VALUES (
    p_recipient_id,
    p_actor_id,
    p_type,
    p_post_id,
    p_routine_id,
    p_comment_id,
    generated_title,
    generated_message,
    FALSE,
    NOW()
  )
  ON CONFLICT (recipient_id, actor_id, type, post_id, routine_id, comment_id)
  DO UPDATE SET
    title = EXCLUDED.title,
    message = EXCLUDED.message,
    read = FALSE,
    created_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification TO anon;
