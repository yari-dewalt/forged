-- Check if superset columns exist in workout_exercises table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'workout_exercises' 
AND column_name IN ('superset_id', 'superset_order');
