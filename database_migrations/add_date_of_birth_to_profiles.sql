-- Add date_of_birth column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add comment to explain the column
COMMENT ON COLUMN profiles.date_of_birth IS 'Optional user date of birth for personalization features';
