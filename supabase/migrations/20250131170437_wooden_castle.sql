/*
  # Announcements Feature

  1. New Tables
    - `announcements` table for system-wide announcements
      - `id` (uuid, primary key)
      - `author_id` (uuid, references users)
      - `title` (text)
      - `content` (text)
      - `priority` (text)
      - `is_published` (boolean)
      - `publish_date` (timestamptz)
      - `expiry_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for super admins to manage announcements
    - Add policies for members to view published announcements
*/

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  priority text NOT NULL DEFAULT 'normal',
  is_published boolean DEFAULT false,
  publish_date timestamptz,
  expiry_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Members can view published announcements"
  ON announcements FOR SELECT
  USING (
    is_published = true AND
    (publish_date IS NULL OR publish_date <= now()) AND
    (expiry_date IS NULL OR expiry_date > now()) AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('professional', 'clinic_admin', 'super_admin')
    )
  );

CREATE POLICY "Super admins can manage announcements"
  ON announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Create indexes
CREATE INDEX idx_announcements_author ON announcements(author_id);
CREATE INDEX idx_announcements_published ON announcements(is_published);
CREATE INDEX idx_announcements_dates ON announcements(publish_date, expiry_date);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_announcements_timestamp
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_announcements_updated_at();