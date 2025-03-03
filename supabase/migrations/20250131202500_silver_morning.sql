/*
  # Fix Referral Relationships and Policies

  1. Changes
    - Drop and recreate referrals table with proper constraints
    - Add proper RLS policies for referrals
    - Add indexes for better performance

  2. Security
    - Enable RLS on referrals table
    - Add policies for viewing, creating, updating, and deleting referrals
    - Ensure proper user role checks
*/

-- First drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Members can view referrals" ON referrals;
  DROP POLICY IF EXISTS "Members can create referrals" ON referrals;
  DROP POLICY IF EXISTS "Members can update own referrals" ON referrals;
  DROP POLICY IF EXISTS "Members can delete own referrals" ON referrals;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Drop and recreate the referrals table
DROP TABLE IF EXISTS referrals CASCADE;

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

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Members can view referrals"
  ON referrals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('professional', 'clinic_admin', 'super_admin')
    )
  );

CREATE POLICY "Members can create referrals"
  ON referrals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('professional', 'clinic_admin', 'super_admin')
    )
  );

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

CREATE POLICY "Members can delete own referrals"
  ON referrals FOR DELETE
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_referrals_author_id ON referrals(author_id);
CREATE INDEX IF NOT EXISTS idx_referrals_edited_by ON referrals(edited_by);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_referrals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_referrals_timestamp
  BEFORE UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_referrals_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON referrals TO authenticated;