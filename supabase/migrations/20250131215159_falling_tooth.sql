-- Drop existing objects first
DO $$ 
BEGIN
  DROP TYPE IF EXISTS clinic_application_status CASCADE;
  DROP TYPE IF EXISTS clinic_status CASCADE;
  
  DROP TABLE IF EXISTS clinic_applications CASCADE;
  DROP TABLE IF EXISTS clinic_populations CASCADE;
  DROP TABLE IF EXISTS clinic_therapy_types CASCADE;
  DROP TABLE IF EXISTS clinic_specialties CASCADE;
  DROP TABLE IF EXISTS clinics CASCADE;
  DROP TABLE IF EXISTS populations CASCADE;
  DROP TABLE IF EXISTS therapy_types CASCADE;
  DROP TABLE IF EXISTS specialties CASCADE;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create enum types
CREATE TYPE clinic_application_status AS ENUM (
  'draft',
  'submitted',
  'pending_review',
  'approved',
  'rejected'
);

CREATE TYPE clinic_status AS ENUM (
  'pending',
  'active',
  'inactive',
  'suspended'
);

-- Create reference tables first
CREATE TABLE specialties (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  category text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE therapy_types (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE populations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create main clinics table
CREATE TABLE clinics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  owners text NOT NULL,
  statement text NOT NULL,
  location jsonb NOT NULL DEFAULT '{}',
  website text,
  email text NOT NULL,
  phone text NOT NULL,
  clinic_status clinic_status DEFAULT 'pending',
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create junction tables
CREATE TABLE clinic_specialties (
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  specialty_id uuid REFERENCES specialties(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (clinic_id, specialty_id)
);

CREATE TABLE clinic_therapy_types (
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  therapy_type_id uuid REFERENCES therapy_types(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (clinic_id, therapy_type_id)
);

CREATE TABLE clinic_populations (
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  population_id uuid REFERENCES populations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (clinic_id, population_id)
);

-- Create applications table
CREATE TABLE clinic_applications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE,
  author_id uuid REFERENCES users(id) ON DELETE CASCADE,
  application_status clinic_application_status DEFAULT 'draft',
  payment_status text,
  payment_id text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE populations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_therapy_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_populations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_applications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view active clinics"
  ON clinics FOR SELECT
  USING (clinic_status = 'active');

CREATE POLICY "Users can manage their own clinics"
  ON clinics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM clinic_applications
      WHERE clinic_applications.clinic_id = clinics.id
      AND clinic_applications.author_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all clinics"
  ON clinics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Reference table policies
CREATE POLICY "Public can view reference data"
  ON specialties FOR SELECT
  USING (true);

CREATE POLICY "Public can view therapy types"
  ON therapy_types FOR SELECT
  USING (true);

CREATE POLICY "Public can view populations"
  ON populations FOR SELECT
  USING (true);

-- Junction table policies
CREATE POLICY "Users can view clinic relationships"
  ON clinic_specialties FOR SELECT
  USING (true);

CREATE POLICY "Users can view therapy type relationships"
  ON clinic_therapy_types FOR SELECT
  USING (true);

CREATE POLICY "Users can view population relationships"
  ON clinic_populations FOR SELECT
  USING (true);

-- Applications policies
CREATE POLICY "Users can view own applications"
  ON clinic_applications FOR SELECT
  USING (author_id = auth.uid());

CREATE POLICY "Users can create applications"
  ON clinic_applications FOR INSERT
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update own draft applications"
  ON clinic_applications FOR UPDATE
  USING (
    author_id = auth.uid()
    AND application_status = 'draft'
  );

CREATE POLICY "Admins can manage all applications"
  ON clinic_applications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Create indexes
CREATE INDEX idx_clinics_status ON clinics(clinic_status);
CREATE INDEX idx_clinics_location ON clinics USING GIN (location);
CREATE INDEX idx_clinic_applications_status ON clinic_applications(application_status);
CREATE INDEX idx_clinic_applications_author ON clinic_applications(author_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_clinics_updated_at
  BEFORE UPDATE ON clinics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinic_applications_updated_at
  BEFORE UPDATE ON clinic_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial reference data
INSERT INTO specialties (name, category) VALUES
  ('Depression', 'Mental Health'),
  ('Anxiety', 'Mental Health'),
  ('PTSD', 'Trauma'),
  ('OCD', 'Mental Health'),
  ('Addiction', 'Substance Use'),
  ('Pain Management', 'Medical'),
  ('End of Life', 'Medical')
ON CONFLICT (name) DO NOTHING;

INSERT INTO therapy_types (name) VALUES
  ('Internal Family Systems (IFS)'),
  ('EMDR'),
  ('Cognitive Behavioral (CBT)'),
  ('Somatic'),
  ('Mindfulness Based (MBCT)'),
  ('Trauma Focused')
ON CONFLICT (name) DO NOTHING;

INSERT INTO populations (name) VALUES
  ('Adults'),
  ('Couples'),
  ('Veterans'),
  ('First Responders'),
  ('LGBTQ+'),
  ('Elderly')
ON CONFLICT (name) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON clinics TO authenticated;
GRANT ALL ON specialties TO authenticated;
GRANT ALL ON therapy_types TO authenticated;
GRANT ALL ON populations TO authenticated;
GRANT ALL ON clinic_specialties TO authenticated;
GRANT ALL ON clinic_therapy_types TO authenticated;
GRANT ALL ON clinic_populations TO authenticated;
GRANT ALL ON clinic_applications TO authenticated;