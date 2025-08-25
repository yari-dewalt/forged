-- Update username constraints to include length validation
-- This migration adds length constraints to the username field

-- First, drop the existing constraint if it exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS username_length_check;

-- Add the new constraint that checks both minimum and maximum length
ALTER TABLE profiles ADD CONSTRAINT username_length_check 
CHECK (char_length(username) >= 3 AND char_length(username) <= 20);

-- Also add a constraint for the character format (if it doesn't exist)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS username_format_check;
ALTER TABLE profiles ADD CONSTRAINT username_format_check 
CHECK (username ~ '^[a-zA-Z0-9_]+$');

-- Ensure username is not null and unique (these should already exist but just to be safe)
ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_username_key' 
        AND conrelid = 'profiles'::regclass
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
    END IF;
END $$;
