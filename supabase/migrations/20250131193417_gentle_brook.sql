-- Drop existing constraints if they exist
DO $$ 
BEGIN
  -- Drop forum_posts constraints
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'forum_posts_author_id_fkey') THEN
    ALTER TABLE forum_posts DROP CONSTRAINT forum_posts_author_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'forum_posts_edited_by_fkey') THEN
    ALTER TABLE forum_posts DROP CONSTRAINT forum_posts_edited_by_fkey;
  END IF;

  -- Drop announcements constraints
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'announcements_author_id_fkey') THEN
    ALTER TABLE announcements DROP CONSTRAINT announcements_author_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'announcements_edited_by_fkey') THEN
    ALTER TABLE announcements DROP CONSTRAINT announcements_edited_by_fkey;
  END IF;

  -- Drop referrals constraints
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referrals_author_id_fkey') THEN
    ALTER TABLE referrals DROP CONSTRAINT referrals_author_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referrals_edited_by_fkey') THEN
    ALTER TABLE referrals DROP CONSTRAINT referrals_edited_by_fkey;
  END IF;
END $$;

-- Add foreign key relationships
ALTER TABLE forum_posts
ADD CONSTRAINT forum_posts_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE forum_posts
ADD CONSTRAINT forum_posts_edited_by_fkey 
FOREIGN KEY (edited_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE announcements
ADD CONSTRAINT announcements_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE announcements
ADD CONSTRAINT announcements_edited_by_fkey 
FOREIGN KEY (edited_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE referrals
ADD CONSTRAINT referrals_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE referrals
ADD CONSTRAINT referrals_edited_by_fkey 
FOREIGN KEY (edited_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_edited_by ON forum_posts(edited_by);
CREATE INDEX IF NOT EXISTS idx_announcements_author_id ON announcements(author_id);
CREATE INDEX IF NOT EXISTS idx_announcements_edited_by ON announcements(edited_by);
CREATE INDEX IF NOT EXISTS idx_referrals_author_id ON referrals(author_id);
CREATE INDEX IF NOT EXISTS idx_referrals_edited_by ON referrals(edited_by);