-- Complete RLS setup for routine_likes table
-- This ensures proper security while allowing the like functionality to work

-- Enable RLS on routine_likes if not already enabled
ALTER TABLE routine_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view routine likes" ON routine_likes;
DROP POLICY IF EXISTS "Users can insert their own routine likes" ON routine_likes;
DROP POLICY IF EXISTS "Users can delete their own routine likes" ON routine_likes;

-- Allow users to view all routine likes (needed for displaying like counts)
CREATE POLICY "Users can view routine likes" ON routine_likes
  FOR SELECT USING (true);

-- Users can only insert their own likes
CREATE POLICY "Users can insert their own routine likes" ON routine_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own likes
CREATE POLICY "Users can delete their own routine likes" ON routine_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Ensure the routines table allows viewing and updating like counts
-- Enable RLS on routines table if not already enabled
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;

-- Allow users to view all routines
CREATE POLICY IF NOT EXISTS "Users can view all routines" ON routines
  FOR SELECT USING (true);

-- Allow users to insert their own routines
CREATE POLICY IF NOT EXISTS "Users can insert their own routines" ON routines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own routines
CREATE POLICY IF NOT EXISTS "Users can update their own routines" ON routines
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = original_creator_id);

-- Allow users to delete their own routines
CREATE POLICY IF NOT EXISTS "Users can delete their own routines" ON routines
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = original_creator_id);
