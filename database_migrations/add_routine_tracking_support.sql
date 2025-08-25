-- Add support for routine tracking: original owner, usage count, and likes
-- This migration adds new columns to support the enhanced routine functionality

-- Add new columns to routines table
ALTER TABLE routines 
ADD COLUMN IF NOT EXISTS original_creator_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT FALSE;

-- Update existing routines to set original_creator_id to current user_id if not already set
UPDATE routines 
SET original_creator_id = user_id 
WHERE original_creator_id IS NULL;

-- Create routine_likes table to track individual user likes
CREATE TABLE IF NOT EXISTS routine_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(routine_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_routine_likes_routine ON routine_likes(routine_id);
CREATE INDEX IF NOT EXISTS idx_routine_likes_user ON routine_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_routines_original_creator ON routines(original_creator_id);
CREATE INDEX IF NOT EXISTS idx_routines_usage_count ON routines(usage_count);
CREATE INDEX IF NOT EXISTS idx_routines_like_count ON routines(like_count);
CREATE INDEX IF NOT EXISTS idx_routines_is_official ON routines(is_official);

-- Function to update routine usage count when a workout is started
CREATE OR REPLACE FUNCTION increment_routine_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment if the workout has a routine_id
  IF NEW.routine_id IS NOT NULL THEN
    UPDATE routines 
    SET usage_count = usage_count + 1 
    WHERE id = NEW.routine_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically increment usage count when workout is saved
DROP TRIGGER IF EXISTS trigger_increment_routine_usage ON workouts;
CREATE TRIGGER trigger_increment_routine_usage
  AFTER INSERT ON workouts
  FOR EACH ROW
  EXECUTE FUNCTION increment_routine_usage();

-- Function to update routine like count when a like is added/removed
CREATE OR REPLACE FUNCTION update_routine_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE routines 
    SET like_count = like_count + 1 
    WHERE id = NEW.routine_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE routines 
    SET like_count = like_count - 1 
    WHERE id = OLD.routine_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update like count
DROP TRIGGER IF EXISTS trigger_update_routine_like_count ON routine_likes;
CREATE TRIGGER trigger_update_routine_like_count
  AFTER INSERT OR DELETE ON routine_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_routine_like_count();

-- Add comments to explain the new columns
COMMENT ON COLUMN routines.original_creator_id IS 'The original creator of the routine, preserved even when copied';
COMMENT ON COLUMN routines.usage_count IS 'Number of times this routine has been used to start a workout';
COMMENT ON COLUMN routines.like_count IS 'Number of users who have liked this routine';
COMMENT ON COLUMN routines.is_official IS 'Whether this is an official routine from fitness professionals';

-- Add RLS policies for routine_likes table
ALTER TABLE routine_likes ENABLE ROW LEVEL SECURITY;

-- Users can view all likes
CREATE POLICY "Users can view routine likes" ON routine_likes
  FOR SELECT USING (true);

-- Users can only insert their own likes
CREATE POLICY "Users can insert their own routine likes" ON routine_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own likes
CREATE POLICY "Users can delete their own routine likes" ON routine_likes
  FOR DELETE USING (auth.uid() = user_id);
