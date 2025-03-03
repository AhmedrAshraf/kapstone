-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  specialties text[] NOT NULL DEFAULT '{}',
  location text,
  contact_info jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Members can view active referrals"
  ON referrals FOR SELECT
  USING (
    is_active = true AND
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

CREATE POLICY "Authors can update own referrals"
  ON referrals FOR UPDATE
  USING (author_id = auth.uid());

-- Create indexes
CREATE INDEX idx_referrals_author ON referrals(author_id);
CREATE INDEX idx_referrals_active ON referrals(is_active);
CREATE INDEX idx_referrals_specialties ON referrals USING GIN(specialties);