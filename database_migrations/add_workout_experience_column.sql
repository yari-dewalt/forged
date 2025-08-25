-- Add workout_experience column to profiles table
-- This column stores the user's self-reported workout experience level

ALTER TABLE public.profiles 
ADD COLUMN workout_experience text DEFAULT 'beginner'::text;

-- Add constraint to ensure only valid experience levels are stored
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_workout_experience_check 
CHECK (workout_experience = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text]));

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.workout_experience IS 'User''s self-reported workout experience level: beginner, intermediate, or advanced';
