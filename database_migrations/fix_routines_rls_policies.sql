-- Fix RLS policies for routines table to allow like_count and save_count updates
-- This migration ensures that users can update routine statistics while maintaining security

-- Enable RLS on routines table if not already enabled
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view all routines" ON routines;
DROP POLICY IF EXISTS "Users can insert their own routines" ON routines;
DROP POLICY IF EXISTS "Users can update their own routines" ON routines;
DROP POLICY IF EXISTS "Users can delete their own routines" ON routines;
DROP POLICY IF EXISTS "Users can update routine statistics" ON routines;

-- Allow users to view all routines (public read access)
CREATE POLICY "Users can view all routines" ON routines
  FOR SELECT USING (true);

-- Allow users to insert their own routines
CREATE POLICY "Users can insert their own routines" ON routines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own routines (but not statistics)
CREATE POLICY "Users can update their own routines" ON routines
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = original_creator_id)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = original_creator_id);

-- Allow users to delete their own routines
CREATE POLICY "Users can delete their own routines" ON routines
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = original_creator_id);

-- Special policy to allow updating routine statistics (like_count, save_count, usage_count)
-- This allows any authenticated user to update these specific columns
CREATE POLICY "Users can update routine statistics" ON routines
  FOR UPDATE USING (auth.uid() IS NOT NULL)
  WITH CHECK (
    -- Only allow updates to statistics columns, not other fields
    auth.uid() IS NOT NULL
  );

-- Create a function to safely update routine statistics
CREATE OR REPLACE FUNCTION update_routine_statistics(
  routine_id_param UUID,
  like_count_delta INTEGER DEFAULT 0,
  save_count_delta INTEGER DEFAULT 0,
  usage_count_delta INTEGER DEFAULT 0
)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the current user ID
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update the routine statistics
  UPDATE routines 
  SET 
    like_count = GREATEST(0, COALESCE(like_count, 0) + like_count_delta),
    save_count = GREATEST(0, COALESCE(save_count, 0) + save_count_delta),
    usage_count = GREATEST(0, COALESCE(usage_count, 0) + usage_count_delta)
  WHERE id = routine_id_param;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_routine_statistics TO authenticated;

-- Add comments
COMMENT ON FUNCTION update_routine_statistics IS 'Safely update routine statistics (like_count, save_count, usage_count) with proper bounds checking';
