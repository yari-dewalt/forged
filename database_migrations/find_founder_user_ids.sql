-- Query to help identify founder user IDs
-- Run this query to find the user IDs of the founders by their usernames or emails

-- Option 1: Find users by username (if you know their usernames)
SELECT 
    p.id as user_id,
    p.username,
    p.name,
    au.email,
    au.created_at
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.username IN (
    'founder1_username',  -- Replace with actual founder usernames
    'founder2_username',
    'founder3_username'
)
ORDER BY au.created_at;

-- Option 2: Find users by email (if you know their emails)
SELECT 
    au.id as user_id,
    au.email,
    p.username,
    p.name,
    au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email IN (
    'founder1@example.com',  -- Replace with actual founder emails
    'founder2@example.com',
    'founder3@example.com'
)
ORDER BY au.created_at;

-- Option 3: Find the earliest registered users (likely founders)
SELECT 
    au.id as user_id,
    au.email,
    p.username,
    p.name,
    au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at ASC
LIMIT 10;

-- After you identify the founder user IDs, update the FOUNDER_USER_IDS array in utils/founderUtils.ts
-- with the actual UUIDs from the user_id column above
