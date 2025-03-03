-- Safely modify referrals table
DO $$ 
BEGIN
  -- Add edited_by column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'referrals' 
    AND column_name = 'edited_by'
  ) THEN
    ALTER TABLE referrals
    ADD COLUMN edited_by uuid REFERENCES users(id) ON DELETE SET NULL;
  END IF;

  -- Drop last_edited_at column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'referrals' 
    AND column_name = 'last_edited_at'
  ) THEN
    ALTER TABLE referrals
    DROP COLUMN last_edited_at;
  END IF;

EXCEPTION
  WHEN undefined_table THEN
    -- Table doesn't exist, create it
    CREATE TABLE referrals (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      title text NOT NULL,
      description text NOT NULL,
      author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      specialties text[] NOT NULL DEFAULT '{}',
      location text,
      contact_info jsonb NOT NULL DEFAULT '{}',
      is_active boolean DEFAULT true,
      edited_by uuid REFERENCES users(id) ON DELETE SET NULL,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
END $$;

-- Create index for edited_by if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'referrals' 
    AND indexname = 'idx_referrals_edited_by'
  ) THEN
    CREATE INDEX idx_referrals_edited_by ON referrals(edited_by);
  END IF;
END $$;

-- Drop and recreate RLS policies
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON referrals TO authenticated;