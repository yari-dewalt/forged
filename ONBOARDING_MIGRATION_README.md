# Onboarding System Simplification

## Summary of Changes

This update simplifies the onboarding system by using a database column (`onboarding_completed`) instead of AsyncStorage and complex field checking.

## Database Migration

Run the following SQL in your Supabase dashboard SQL editor:

```sql
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
```

## Code Changes Made

### 1. Updated `authStore.ts`
- Added `onboarding_completed` field to UserProfile type
- Added `markOnboardingComplete()` method to update the database
- Updated profile fetching to include the new column

### 2. Simplified `onboardingStore.ts` 
- Removed AsyncStorage dependency
- Removed complex field checking logic
- Now simply reads `profile.onboarding_completed` from database
- Made methods synchronous (no more async operations)

### 3. Updated `_layout.tsx`
- Removed `onboardingLoading` dependency
- Simplified routing logic
- Removed complex animation timing based on onboarding loading

### 4. Updated `complete.tsx`
- Now uses `markOnboardingComplete` from authStore instead of onboardingStore
- This updates the database directly

## Benefits

1. **Simpler Logic**: Single source of truth in the database
2. **Better Performance**: No AsyncStorage operations
3. **Consistency**: Works across devices and app reinstalls
4. **Maintainability**: Less complex state management
5. **Reliability**: Database-backed state instead of local storage

## Migration Impact

- Existing users with `username` and `weight_unit` will be automatically marked as `onboarding_completed = true`
- New users will default to `onboarding_completed = false` and go through onboarding
- No app functionality changes for end users
