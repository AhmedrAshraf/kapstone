/*
  # Fix Forum Post Relationships

  1. Changes
    - Add explicit foreign key names for edited_by relationships
    - Update indexes for edited_by fields
  
  2. Security
    - Maintains existing RLS policies
    - Ensures proper cascade behavior
*/

-- Add explicit foreign key names for edited_by relationships
DO $$ 
BEGIN
  -- Drop existing edited_by constraints if they exist
  ALTER TABLE forum_posts 
    DROP CONSTRAINT IF EXISTS forum_posts_edited_by_fkey CASCADE;
    
  ALTER TABLE announcements 
    DROP CONSTRAINT IF EXISTS announcements_edited_by_fkey CASCADE;
    
  ALTER TABLE referrals 
    DROP CONSTRAINT IF EXISTS referrals_edited_by_fkey CASCADE;

  -- Recreate edited_by constraints with correct names
  ALTER TABLE forum_posts
    ADD CONSTRAINT forum_posts_edited_by_fkey 
    FOREIGN KEY (edited_by) 
    REFERENCES users(id) 
    ON DELETE SET NULL;

  ALTER TABLE announcements
    ADD CONSTRAINT announcements_edited_by_fkey 
    FOREIGN KEY (edited_by) 
    REFERENCES users(id) 
    ON DELETE SET NULL;

  ALTER TABLE referrals
    ADD CONSTRAINT referrals_edited_by_fkey 
    FOREIGN KEY (edited_by) 
    REFERENCES users(id) 
    ON DELETE SET NULL;

EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Create indexes for edited_by fields
CREATE INDEX IF NOT EXISTS idx_forum_posts_edited_by ON forum_posts(edited_by);
CREATE INDEX IF NOT EXISTS idx_announcements_edited_by ON announcements(edited_by);
CREATE INDEX IF NOT EXISTS idx_referrals_edited_by ON referrals(edited_by);