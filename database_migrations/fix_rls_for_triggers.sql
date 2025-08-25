-- Fix RLS policies to allow trigger functions to update follower/following counts
-- The issue is that trigger functions run in a different security context

-- First, let's check current RLS policies on profiles table
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- The trigger function needs to be able to update the profiles table
-- We need to either:
-- 1. Add a policy that allows the trigger function to update counts, OR
-- 2. Make the trigger function run with elevated privileges

-- Option 1: Add a policy that allows updating follower/following counts
-- This policy allows updates to follower/following counts from any context
CREATE POLICY "Allow system updates to follow counts" ON profiles
    FOR UPDATE 
    USING (true)  -- Allow any context to read for updates
    WITH CHECK (true);  -- Allow any context to update

-- Option 2 (Alternative): Create the trigger function as SECURITY DEFINER
-- This makes the function run with the privileges of the user who created it
-- First drop the existing function and trigger
DROP TRIGGER IF EXISTS follow_counts_trigger ON follows;
DROP FUNCTION IF EXISTS update_follow_counts();

-- Recreate the function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER 
SECURITY DEFINER  -- This is the key addition
SET search_path = public
AS $$
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

-- Recreate the trigger
CREATE TRIGGER follow_counts_trigger
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follow_counts();

-- Fix any existing incorrect counts
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

-- Test the setup
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
