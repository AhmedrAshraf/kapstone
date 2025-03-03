-- 20250131140626_tiny_sun.sql
-- This migration creates/updates the public.users table and test user

DO $$
DECLARE
  test_user_id uuid;
BEGIN
  -- First ensure required extensions
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  CREATE EXTENSION IF NOT EXISTS pgcrypto;

  -- 1. Create public.users table if not exists
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relname = 'users'
    AND c.relkind = 'r'  -- 'r' = ordinary table
  ) THEN
    CREATE TABLE public.users (
      id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
      auth_id uuid UNIQUE NOT NULL,
      email text NOT NULL,
      full_name text,
      role text,
      created_at timestamp with time zone DEFAULT now(),
      updated_at timestamp with time zone DEFAULT now()
    );
  END IF;

  -- 2. Delete existing test user if it exists
  DELETE FROM public.users WHERE email = 'test@kapstone.com';
  DELETE FROM auth.users WHERE email = 'test@kapstone.com';

  -- 3. Generate new UUID for test user
  test_user_id := uuid_generate_v4();

  -- 4. Create user in auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    test_user_id,
    '00000000-0000-0000-0000-000000000000',
    'test@kapstone.com',
    crypt('test123', gen_salt('bf')),
    now(),
    now(),
    now(),
    jsonb_build_object(
      'provider', 'email',
      'providers', array['email']
    ),
    jsonb_build_object(
      'name', 'Test User'
    ),
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
  );

  -- 5. Create matching row in public.users
  INSERT INTO public.users (
    auth_id,
    email,
    full_name,
    role
  ) VALUES (
    test_user_id,
    'test@kapstone.com',
    'Test User',
    'super_admin'
  );

  -- 6. Grant usage to schemas if needed
  GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
  GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, anon, authenticated, service_role;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, anon, authenticated, service_role;
  GRANT ALL ON ALL FUNCTIONS IN SCHEMA auth TO postgres, anon, authenticated, service_role;
END
$$;


-- 7. Enable and configure RLS on auth.users table
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Using = statement for row-level policies
CREATE POLICY IF NOT EXISTS "Public users can read own data" 
  ON auth.users
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update own data" 
  ON auth.users
  FOR UPDATE 
  USING (auth.uid() = id);

-- 8. (Optional) Enable RLS on public.users if you want row-level security there too:
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY IF NOT EXISTS "Public read own data" 
--   ON public.users
--   FOR SELECT 
--   USING (auth.uid() = auth_id);
-- CREATE POLICY IF NOT EXISTS "Public update own data" 
--   ON public.users
--   FOR UPDATE 
--   USING (auth.uid() = auth_id);
