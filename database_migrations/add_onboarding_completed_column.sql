-- Add onboarding_completed column to profiles table
ALTER TABLE profiles 
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;

-- Update existing users to have onboarding_completed = true if they have required data
UPDATE profiles 
SET onboarding_completed = TRUE 
WHERE username IS NOT NULL 
  AND username != '' 
  AND weight_unit IS NOT NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed 
ON profiles(onboarding_completed);
