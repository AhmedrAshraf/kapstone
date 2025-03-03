-- Create referral_replies table
CREATE TABLE IF NOT EXISTS referral_replies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id uuid NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES referral_replies(id) ON DELETE CASCADE,
  content text NOT NULL,
  edited_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE referral_replies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Members can view referral replies"
  ON referral_replies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('professional', 'clinic_admin', 'super_admin')
    )
  );

CREATE POLICY "Members can create referral replies"
  ON referral_replies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('professional', 'clinic_admin', 'super_admin')
    )
  );

CREATE POLICY "Members can update own referral replies"
  ON referral_replies FOR UPDATE
  USING (
    (auth.uid() IN (
      SELECT id FROM users WHERE id = referral_replies.author_id
    ) AND 
    EXTRACT(EPOCH FROM (now() - created_at)) / 3600 <= 24)
    OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Members can delete own referral replies"
  ON referral_replies FOR DELETE
  USING (
    (auth.uid() IN (
      SELECT id FROM users WHERE id = referral_replies.author_id
    ) AND 
    EXTRACT(EPOCH FROM (now() - created_at)) / 3600 <= 24)
    OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_referral_replies_referral_id ON referral_replies(referral_id);
CREATE INDEX IF NOT EXISTS idx_referral_replies_author_id ON referral_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_referral_replies_parent_id ON referral_replies(parent_id);
CREATE INDEX IF NOT EXISTS idx_referral_replies_edited_by ON referral_replies(edited_by);
CREATE INDEX IF NOT EXISTS idx_referral_replies_created_at ON referral_replies(created_at);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_referral_replies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_referral_replies_timestamp
  BEFORE UPDATE ON referral_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_referral_replies_updated_at();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON referral_replies TO authenticated;