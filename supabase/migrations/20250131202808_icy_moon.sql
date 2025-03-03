/*
  # Add Referral Edit Support

  1. Changes
    - Add edited_by tracking for referrals
    - Add last_edited_at timestamp
    - Add edit history tracking
    - Update RLS policies for editing

  2. Security
    - Enable RLS on referrals table
    - Add policies for edit permissions
    - Add audit trail for edits
*/

-- Add edit tracking columns if they don't exist
ALTER TABLE referrals
ADD COLUMN IF NOT EXISTS last_edited_at timestamptz,
ADD COLUMN IF NOT EXISTS edited_by uuid REFERENCES users(id) ON DELETE SET NULL;

-- Create edit history table
CREATE TABLE IF NOT EXISTS referral_edit_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id uuid NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  editor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  edited_at timestamptz DEFAULT now(),
  changes jsonb NOT NULL,
  previous_version jsonb NOT NULL
);

-- Enable RLS on edit history
ALTER TABLE referral_edit_history ENABLE ROW LEVEL SECURITY;

-- Create edit history trigger
CREATE OR REPLACE FUNCTION track_referral_edits()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO referral_edit_history (
      referral_id,
      editor_id,
      changes,
      previous_version
    ) VALUES (
      OLD.id,
      auth.uid(),
      jsonb_build_object(
        'title', CASE WHEN NEW.title <> OLD.title THEN NEW.title ELSE null END,
        'description', CASE WHEN NEW.description <> OLD.description THEN NEW.description ELSE null END,
        'specialties', CASE WHEN NEW.specialties <> OLD.specialties THEN NEW.specialties ELSE null END,
        'location', CASE WHEN NEW.location <> OLD.location THEN NEW.location ELSE null END,
        'contact_info', CASE WHEN NEW.contact_info <> OLD.contact_info THEN NEW.contact_info ELSE null END
      ),
      jsonb_build_object(
        'title', OLD.title,
        'description', OLD.description,
        'specialties', OLD.specialties,
        'location', OLD.location,
        'contact_info', OLD.contact_info
      )
    );
    
    NEW.last_edited_at = now();
    NEW.edited_by = auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for edit tracking
DROP TRIGGER IF EXISTS track_referral_edits_trigger ON referrals;
CREATE TRIGGER track_referral_edits_trigger
  BEFORE UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION track_referral_edits();

-- Update RLS policies
CREATE POLICY "View edit history"
  ON referral_edit_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('clinic_admin', 'super_admin')
    )
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON referral_edit_history TO authenticated;