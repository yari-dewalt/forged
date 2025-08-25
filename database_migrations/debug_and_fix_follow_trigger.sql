-- First, let's check if the trigger and function exist
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing, 
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'follow_counts_trigger';

-- Check if the function exists
SELECT 
    routine_name, 
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'update_follow_counts';

-- If the above queries return empty results, the trigger/function don't exist
-- Run the following to create them:

-- Create or replace the trigger function to update follow counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT (new follow relationship)
  IF TG_OP = 'INSERT' THEN
    -- Update the follower's following_count
    UPDATE profiles 
    SET following_count = (
      SELECT COUNT(*) 
      FROM follows 
      WHERE follower_id = NEW.follower_id
    )
    WHERE id = NEW.follower_id;
    
    -- Update the followed user's followers_count
    UPDATE profiles 
    SET followers_count = (
      SELECT COUNT(*) 
      FROM follows 
      WHERE following_id = NEW.following_id
    )
    WHERE id = NEW.following_id;
    
    RETURN NEW;
  END IF;
  
  -- Handle DELETE (removed follow relationship)
  IF TG_OP = 'DELETE' THEN
    -- Update the follower's following_count
    UPDATE profiles 
    SET following_count = (
      SELECT COUNT(*) 
      FROM follows 
      WHERE follower_id = OLD.follower_id
    )
    WHERE id = OLD.follower_id;
    
    -- Update the followed user's followers_count
    UPDATE profiles 
    SET followers_count = (
      SELECT COUNT(*) 
      FROM follows 
      WHERE following_id = OLD.following_id
    )
    WHERE id = OLD.following_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop the existing trigger if it exists and recreate it
DROP TRIGGER IF EXISTS follow_counts_trigger ON follows;

CREATE TRIGGER follow_counts_trigger
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follow_counts();

-- Fix any existing incorrect counts by recalculating them
UPDATE profiles SET 
  followers_count = (
    SELECT COUNT(*) 
    FROM follows 
    WHERE following_id = profiles.id
  ),
  following_count = (
    SELECT COUNT(*) 
    FROM follows 
    WHERE follower_id = profiles.id
  );

-- Test the trigger by checking current counts
SELECT 
    p.id,
    p.username,
    p.followers_count as current_followers_count,
    p.following_count as current_following_count,
    (SELECT COUNT(*) FROM follows WHERE following_id = p.id) as actual_followers,
    (SELECT COUNT(*) FROM follows WHERE follower_id = p.id) as actual_following
FROM profiles p
WHERE p.followers_count > 0 OR p.following_count > 0
ORDER BY p.username;
