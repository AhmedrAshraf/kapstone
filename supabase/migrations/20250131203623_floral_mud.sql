-- Drop edit history related objects
DO $$ 
BEGIN
  -- Drop trigger first
  DROP TRIGGER IF EXISTS track_referral_edits_trigger ON referrals;
  
  -- Drop function
  DROP FUNCTION IF EXISTS track_referral_edits();
  
  -- Drop edit history table
  DROP TABLE IF EXISTS referral_edit_history;

  -- Remove edit tracking columns from referrals
  ALTER TABLE referrals 
    DROP COLUMN IF EXISTS edited_by,
    DROP COLUMN IF EXISTS last_edited_at;

EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Update RLS policies to remove any edit history references
DROP POLICY IF EXISTS "Members can update own referrals" ON referrals;
CREATE POLICY "Members can update own referrals"
  ON referrals FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE id = referrals.author_id
    )
    OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );