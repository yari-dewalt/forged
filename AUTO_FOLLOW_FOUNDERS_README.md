# Auto-Follow Founders Feature

This feature automatically makes new users follow the three founders when they complete the onboarding process.

## Setup Instructions

### 1. Identify Founder User IDs

First, you need to find the actual Supabase user IDs of the three founders:

```sql
-- Run this query in your Supabase SQL editor
-- Replace the usernames/emails with the actual founder credentials

-- Option A: Find by username
SELECT 
    p.id as user_id,
    p.username,
    p.name,
    au.email,
    au.created_at
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.username IN (
    'founder1_username',  -- Replace with actual usernames
    'founder2_username',
    'founder3_username'
)
ORDER BY au.created_at;

-- Option B: Find by email
SELECT 
    au.id as user_id,
    au.email,
    p.username,
    p.name,
    au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email IN (
    'founder1@example.com',  -- Replace with actual emails
    'founder2@example.com', 
    'founder3@example.com'
)
ORDER BY au.created_at;
```

### 2. Update Founder IDs

Replace the placeholder IDs in `/utils/founderUtils.ts`:

```typescript
export const FOUNDER_USER_IDS = [
  'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // Founder 1 actual UUID
  'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy', // Founder 2 actual UUID
  'zzzzzzzz-zzzz-zzzz-zzzz-zzzzzzzzzzzz', // Founder 3 actual UUID
];
```

### 3. Test the Feature

1. Create a new test account
2. Go through the onboarding flow
3. Complete the username setup
4. Check that the new user is automatically following the three founders

## Implementation Details

### Current Approach: App-Level Auto-Follow

The feature is implemented at the application level in the onboarding flow:

- **File**: `app/(onboarding)/username.tsx`
- **Trigger**: After successful profile creation during username setup
- **Function**: `autoFollowFounders()` in `utils/founderUtils.ts`

### How It Works

1. User completes email verification and reaches username setup
2. User enters username and clicks continue
3. Profile is created/updated in database
4. `autoFollowFounders()` function is called
5. Follow relationships are created for all three founders
6. User continues with onboarding
7. Database triggers automatically update follow counts

### Alternative: Database-Level Auto-Follow

There's also a database trigger approach available (currently disabled):

- **File**: `database_migrations/auto_follow_founders_trigger.sql`
- **Trigger**: Automatically runs when new profiles are inserted
- **Advantage**: Cannot be bypassed, works even with API calls
- **Disadvantage**: Harder to debug and modify

To switch to database-level approach:
1. Update founder UUIDs in the trigger SQL
2. Run the migration to create the trigger
3. Remove the `autoFollowFounders()` call from username.tsx

## Error Handling

The auto-follow feature is designed to be non-blocking:
- If auto-following fails, onboarding continues normally
- Errors are logged but don't interrupt the user experience
- Users can still manually follow founders later if auto-follow fails

## Verification

To verify the feature is working:

```sql
-- Check recent follows for a new user
SELECT 
    f.created_at,
    follower.username as follower_username,
    following.username as following_username
FROM follows f
JOIN profiles follower ON f.follower_id = follower.id
JOIN profiles following ON f.following_id = following.id
WHERE f.follower_id = 'new-user-id'
ORDER BY f.created_at DESC;

-- Check follow counts for founders
SELECT 
    p.username,
    p.followers_count,
    p.following_count
FROM profiles p
WHERE p.id IN (
    'founder-1-id',
    'founder-2-id', 
    'founder-3-id'
);
```

## Notes

- The feature respects the existing follow system and notifications
- Follow notifications are created for founders when new users auto-follow them
- The implementation uses the same `follows` table and triggers as manual follows
- Duplicate follows are prevented by database constraints
