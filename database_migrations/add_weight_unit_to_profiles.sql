-- Add weight_unit column to profiles table
-- This column stores the user's preferred weight unit for display purposes

ALTER TABLE public.profiles 
ADD COLUMN weight_unit text NULL DEFAULT 'lbs' 
CHECK (weight_unit IN ('lbs', 'kg'));

-- Add comment to explain the column
COMMENT ON COLUMN public.profiles.weight_unit IS 'User preferred weight unit for displaying weights and volumes (lbs or kg)';

-- Optional: Update existing users to have a default weight unit if needed
-- UPDATE public.profiles SET weight_unit = 'lbs' WHERE weight_unit IS NULL;
