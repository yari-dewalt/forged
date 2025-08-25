-- Add privacy columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS hide_from_suggestions boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS hide_suggestions_for_user boolean DEFAULT false;

-- Add comment to explain the columns
COMMENT ON COLUMN profiles.is_private IS 'Whether the user profile is private (only approved followers can see posts)';
COMMENT ON COLUMN profiles.hide_from_suggestions IS 'Whether to hide this user from suggested users lists';
COMMENT ON COLUMN profiles.hide_suggestions_for_user IS 'Whether to hide suggested users from this user feed';
