-- Add save_count column to routines table if it doesn't exist
-- This ensures the save functionality works properly

-- Add save_count column if not exists
ALTER TABLE routines ADD COLUMN IF NOT EXISTS save_count INTEGER DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_routines_save_count ON routines(save_count);

-- Update any existing routines to have a save count of 0 if null
UPDATE routines SET save_count = 0 WHERE save_count IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN routines.save_count IS 'Number of users who have saved this routine to their collection';
