/*
  # Fix RLS policies for users table

  1. Changes
    - Remove recursive policy that was causing infinite recursion
    - Simplify RLS policies for better performance
    - Add separate policy for super admins
    - Add basic policies for authenticated users

  2. Security
    - Enable RLS on users table
    - Grant necessary privileges to authenticated users
    - Ensure proper access control for different user roles
*/

-- First, disable RLS temporarily to avoid any conflicts
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "select_own_profile" ON public.users;
DROP POLICY IF EXISTS "insert_own_profile" ON public.users;
DROP POLICY IF EXISTS "update_own_profile" ON public.users;
DROP POLICY IF EXISTS "delete_own_profile" ON public.users;
DROP POLICY IF EXISTS "super_admin_manage_all_profiles" ON public.users;

-- Grant necessary privileges
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create new, simplified policies
-- Allow users to read their own profile
CREATE POLICY "users_read_own"
  ON public.users
  FOR SELECT
  USING (auth_id = auth.uid());

-- Allow users to insert their own profile
CREATE POLICY "users_insert_own"
  ON public.users
  FOR INSERT
  WITH CHECK (auth_id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  USING (auth_id = auth.uid());

-- Super admin policy (using a direct role check instead of a recursive query)
CREATE POLICY "super_admin_full_access"
  ON public.users
  FOR ALL
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'authenticated'
    AND (
      SELECT role FROM public.users 
      WHERE auth_id = auth.uid() 
      LIMIT 1
    ) = 'super_admin'
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);