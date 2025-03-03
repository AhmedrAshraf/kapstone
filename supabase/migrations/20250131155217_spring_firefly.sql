-- Drop existing policies
DROP POLICY IF EXISTS "users_read_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "super_admin_full_access" ON public.users;

-- Temporarily disable RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Create a function to check if user is super admin without recursion
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE auth_id = auth.uid()
    AND role = 'super_admin'
  );
$$;

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create new policies using the function
CREATE POLICY "allow_read_own_or_super_admin"
  ON public.users
  FOR SELECT
  USING (
    auth_id = auth.uid() 
    OR is_super_admin()
  );

CREATE POLICY "allow_insert_own"
  ON public.users
  FOR INSERT
  WITH CHECK (
    auth_id = auth.uid()
    OR is_super_admin()
  );

CREATE POLICY "allow_update_own_or_super_admin"
  ON public.users
  FOR UPDATE
  USING (
    auth_id = auth.uid()
    OR is_super_admin()
  );

CREATE POLICY "allow_delete_own_or_super_admin"
  ON public.users
  FOR DELETE
  USING (
    auth_id = auth.uid()
    OR is_super_admin()
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin TO authenticated;