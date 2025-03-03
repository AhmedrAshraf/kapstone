-- Add delete policies for forum posts
DROP POLICY IF EXISTS "Members can delete own posts" ON forum_posts;
CREATE POLICY "Members can delete own posts"
ON forum_posts FOR DELETE
USING (
  (auth.uid() IN (
    SELECT id FROM users WHERE id = forum_posts.author_id
  ) AND 
  EXTRACT(EPOCH FROM (now() - created_at)) / 3600 <= 24)
  OR 
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.auth_id = auth.uid() 
    AND users.role = 'super_admin'
  )
);

-- Add cascade delete for replies
ALTER TABLE forum_replies
DROP CONSTRAINT IF EXISTS forum_replies_post_id_fkey,
ADD CONSTRAINT forum_replies_post_id_fkey
FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE;