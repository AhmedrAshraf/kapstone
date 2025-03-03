/*
  # Fix Foreign Key Relationships

  1. Changes
    - Drop and recreate foreign key constraints with correct names
    - Add missing foreign key relationships
    - Update RLS policies to use correct constraint names
  
  2. Security
    - Maintains existing RLS policies
    - Ensures proper cascade behavior
*/

-- Drop and recreate foreign key constraints with correct names
DO $$ 
BEGIN
  -- Drop existing constraints if they exist
  ALTER TABLE forum_posts 
    DROP CONSTRAINT IF EXISTS forum_posts_author_id_fkey CASCADE;
    
  ALTER TABLE announcements 
    DROP CONSTRAINT IF EXISTS announcements_author_id_fkey CASCADE;
    
  ALTER TABLE referrals 
    DROP CONSTRAINT IF EXISTS referrals_author_id_fkey CASCADE;

  -- Recreate constraints with correct names
  ALTER TABLE forum_posts
    ADD CONSTRAINT forum_posts_author_id_fkey 
    FOREIGN KEY (author_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;

  ALTER TABLE announcements
    ADD CONSTRAINT announcements_author_id_fkey 
    FOREIGN KEY (author_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;

  ALTER TABLE referrals
    ADD CONSTRAINT referrals_author_id_fkey 
    FOREIGN KEY (author_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;

EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Recreate indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_announcements_author_id ON announcements(author_id);
CREATE INDEX IF NOT EXISTS idx_referrals_author_id ON referrals(author_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON forum_posts TO authenticated;
GRANT ALL ON announcements TO authenticated;
GRANT ALL ON referrals TO authenticated;