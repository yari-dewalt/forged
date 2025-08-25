-- Simple test notifications script
-- Instructions:
-- 1. First get your user ID by running: SELECT id, username FROM profiles WHERE username = 'your_username';
-- 2. Replace 'YOUR_USER_ID_HERE' with your actual user ID
-- 3. Run this script in Supabase SQL Editor

-- Replace this with your actual user ID
INSERT INTO notifications (recipient_id, actor_id, type, title, message, read, created_at) VALUES
-- Follow notification (unread)
('YOUR_USER_ID_HERE', 'YOUR_USER_ID_HERE', 'follow', 'New follower', 'johndoe started following you', false, NOW() - INTERVAL '2 hours'),

-- Post like notification (unread)  
('YOUR_USER_ID_HERE', 'YOUR_USER_ID_HERE', 'post_like', 'Post liked', 'alice_fitness liked your post', false, NOW() - INTERVAL '1 hour'),

-- Routine like notification (read)
('YOUR_USER_ID_HERE', 'YOUR_USER_ID_HERE', 'routine_like', 'Routine liked', 'mike_trainer liked your Push Day routine', true, NOW() - INTERVAL '3 hours'),

-- Routine save notification (unread)
('YOUR_USER_ID_HERE', 'YOUR_USER_ID_HERE', 'routine_save', 'Routine saved', 'sarah_lifts saved your Upper Body Blast routine', false, NOW() - INTERVAL '30 minutes'),

-- Comment like notification (unread)
('YOUR_USER_ID_HERE', 'YOUR_USER_ID_HERE', 'comment_like', 'Comment liked', 'gym_buddy liked your comment', false, NOW() - INTERVAL '45 minutes'),

-- Comment reply notification (read)
('YOUR_USER_ID_HERE', 'YOUR_USER_ID_HERE', 'comment_reply', 'New reply', 'fitness_pro replied to your comment: "Great form on those squats!"', true, NOW() - INTERVAL '4 hours'),

-- Post comment notification (unread)
('YOUR_USER_ID_HERE', 'YOUR_USER_ID_HERE', 'post_comment', 'New comment', 'workout_king commented on your post: "Awesome progress bro!"', false, NOW() - INTERVAL '15 minutes');

-- Verify the notifications were created
SELECT COUNT(*) as notification_count FROM notifications WHERE recipient_id = 'YOUR_USER_ID_HERE';
