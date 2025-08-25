-- Add superset support to workout_exercises table
-- This migration adds superset_id and superset_order columns to group exercises into supersets

ALTER TABLE workout_exercises 
ADD COLUMN superset_id UUID,
ADD COLUMN superset_order INTEGER;

-- Create index for better performance when querying supersets
CREATE INDEX idx_workout_exercises_superset ON workout_exercises(superset_id);
CREATE INDEX idx_workout_exercises_workout_superset ON workout_exercises(workout_id, superset_id);

-- Add comments to explain the columns
COMMENT ON COLUMN workout_exercises.superset_id IS 'Groups exercises into supersets. NULL means not part of a superset';
COMMENT ON COLUMN workout_exercises.superset_order IS 'Order of exercises within a superset (0-based index)';
