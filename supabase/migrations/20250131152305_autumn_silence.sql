-- Enable RLS on public.users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Grant necessary privileges to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "select_own_profile" ON public.users;
DROP POLICY IF EXISTS "insert_own_profile" ON public.users;
DROP POLICY IF EXISTS "update_own_profile" ON public.users;
DROP POLICY IF EXISTS "delete_own_profile" ON public.users;

-- Create policies for public.users table
CREATE POLICY "select_own_profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY "insert_own_profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "update_own_profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "delete_own_profile"
  ON public.users
  FOR DELETE
  USING (auth.uid() = auth_id);

-- Add policy for super admins to manage all profiles
CREATE POLICY "super_admin_manage_all_profiles"
  ON public.users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );