-- Script to create fake notifications for testing
-- Run this in your Supabase SQL Editor

-- First, let's get some user IDs to work with (replace these with actual user IDs from your profiles table)
-- You can find user IDs by running: SELECT id, username FROM profiles LIMIT 5;

-- Example fake data - replace the UUIDs with actual user IDs from your database
DO $$
DECLARE
  recipient_user_id UUID := '00000000-0000-0000-0000-000000000001'; -- Replace with actual recipient user ID
  actor_user_id UUID := '00000000-0000-0000-0000-000000000002';     -- Replace with actual actor user ID
  test_post_id UUID := '00000000-0000-0000-0000-000000000003';      -- Replace with actual post ID (optional)
  test_routine_id UUID := '00000000-0000-0000-0000-000000000004';   -- Replace with actual routine ID (optional)
  test_comment_id UUID := '00000000-0000-0000-0000-000000000005';   -- Replace with actual comment ID (optional)
BEGIN
  -- Create follow notification
  INSERT INTO notifications (recipient_id, actor_id, type, title, message, read)
  VALUES (
    recipient_user_id,
    actor_user_id,
    'follow',
    'New follower',
    'testuser started following you',
    false
  );

  -- Create post like notification
  INSERT INTO notifications (recipient_id, actor_id, type, post_id, title, message, read)
  VALUES (
    recipient_user_id,
    actor_user_id,
    'post_like',
    test_post_id,
    'Post liked',
    'testuser liked your post',
    false
  );

  -- Create routine like notification
  INSERT INTO notifications (recipient_id, actor_id, type, routine_id, title, message, read)
  VALUES (
    recipient_user_id,
    actor_user_id,
    'routine_like',
    test_routine_id,
    'Routine liked',
    'testuser liked your routine',
    true
  );

  -- Create routine save notification
  INSERT INTO notifications (recipient_id, actor_id, type, routine_id, title, message, read)
  VALUES (
    recipient_user_id,
    actor_user_id,
    'routine_save',
    test_routine_id,
    'Routine saved',
    'testuser saved your routine',
    false
  );

  -- Create comment like notification
  INSERT INTO notifications (recipient_id, actor_id, type, comment_id, title, message, read)
  VALUES (
    recipient_user_id,
    actor_user_id,
    'comment_like',
    test_comment_id,
    'Comment liked',
    'testuser liked your comment',
    false
  );

  -- Create comment reply notification
  INSERT INTO notifications (recipient_id, actor_id, type, comment_id, title, message, read)
  VALUES (
    recipient_user_id,
    actor_user_id,
    'comment_reply',
    test_comment_id,
    'New reply',
    'testuser replied to your comment',
    true
  );

  -- Create post comment notification
  INSERT INTO notifications (recipient_id, actor_id, type, post_id, comment_id, title, message, read)
  VALUES (
    recipient_user_id,
    actor_user_id,
    'post_comment',
    test_post_id,
    test_comment_id,
    'New comment',
    'testuser commented on your post',
    false
  );

  RAISE NOTICE 'Created 7 test notifications successfully!';
END $$;
