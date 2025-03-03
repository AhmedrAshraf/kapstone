-- Temporarily disable RLS to test access
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;

-- Insert a test announcement
INSERT INTO announcements (
  title,
  content,
  author_id,
  priority,
  is_published
) VALUES (
  'Test Announcement',
  'This is a test announcement to verify visibility',
  (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1),
  'normal',
  true
);

-- Re-enable RLS with simplest possible policy
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can view announcements" ON announcements;
  DROP POLICY IF EXISTS "Members can view announcements" ON announcements;
  DROP POLICY IF EXISTS "Super admins can manage announcements" ON announcements;
  DROP POLICY IF EXISTS "Members can view published announcements" ON announcements;
  DROP POLICY IF EXISTS "Allow all authenticated users to view announcements" ON announcements;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create single, simple policy
CREATE POLICY "allow_all_select" 
  ON announcements 
  FOR SELECT 
  USING (true);

-- Ensure proper grants
GRANT ALL ON announcements TO authenticated;