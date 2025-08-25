-- Alternative approach: Database trigger to auto-follow founders
-- This is optional - you can use either the app-level approach (already implemented) 
-- or this database-level approach

-- First, create a function to auto-follow founders
CREATE OR REPLACE FUNCTION auto_follow_founders()
RETURNS TRIGGER AS $$
DECLARE
    founder_ids UUID[] := ARRAY[
        'founder-1-user-id'::UUID,  -- Replace with actual founder UUID
        'founder-2-user-id'::UUID,  -- Replace with actual founder UUID  
        'founder-3-user-id'::UUID   -- Replace with actual founder UUID
    ];
    founder_id UUID;
BEGIN
    -- Only auto-follow if this is a new profile insert with a username
    -- (indicates completed onboarding, not just auth user creation)
    IF TG_OP = 'INSERT' AND NEW.username IS NOT NULL THEN
        -- Loop through founder IDs and create follow relationships
        FOREACH founder_id IN ARRAY founder_ids
        LOOP
            -- Only create follow if the founder exists and is not the new user
            IF founder_id != NEW.id AND EXISTS (
                SELECT 1 FROM profiles WHERE id = founder_id
            ) THEN
                INSERT INTO follows (follower_id, following_id, created_at)
                VALUES (NEW.id, founder_id, NOW())
                ON CONFLICT (follower_id, following_id) DO NOTHING;
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger (uncomment to enable database-level auto-following)
-- Note: If you enable this, you should remove the app-level auto-follow code
-- to avoid duplicate follows

-- CREATE TRIGGER trigger_auto_follow_founders
--     AFTER INSERT OR UPDATE ON profiles
--     FOR EACH ROW
--     EXECUTE FUNCTION auto_follow_founders();

-- To enable this trigger approach:
-- 1. Replace the founder-*-user-id placeholders with actual founder UUIDs
-- 2. Uncomment the CREATE TRIGGER statement above
-- 3. Remove the autoFollowFounders() call from app/(onboarding)/username.tsx
-- 4. Test with a new user signup

-- To check if the trigger is working:
-- SELECT trigger_name, event_manipulation, action_timing 
-- FROM information_schema.triggers 
-- WHERE trigger_name = 'trigger_auto_follow_founders';
