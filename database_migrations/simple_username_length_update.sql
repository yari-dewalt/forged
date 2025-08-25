-- Simple update to existing username length constraint
-- Run this if you already have a constraint and just want to update it

-- If you have an existing constraint like: char_length(username) >= 3
-- You can update it to include the maximum length like this:

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_username_length;
ALTER TABLE profiles ADD CONSTRAINT check_username_length 
CHECK (char_length(username) >= 3 AND char_length(username) <= 20);
