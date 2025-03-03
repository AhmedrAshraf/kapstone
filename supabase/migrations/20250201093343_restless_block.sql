-- Create new users
DO $$
DECLARE
  peter_user_id uuid;
  professional_user_id uuid;
BEGIN
  -- Create Peter's super admin account
  peter_user_id := uuid_generate_v4();
  
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
    peter_user_id,
    '00000000-0000-0000-0000-000000000000',
    'peter@kapstone.com',
    crypt('test123', gen_salt('bf')),
    now(),
    now(),
    now(),
    jsonb_build_object(
      'provider', 'email',
      'providers', array['email']
    ),
    jsonb_build_object(
      'name', 'Peter Corbett'
    ),
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
  );

  -- Create matching row in public.users for Peter
  INSERT INTO public.users (
    auth_id,
    email,
    full_name,
    role
  ) VALUES (
    peter_user_id,
    'peter@kapstone.com',
    'Peter Corbett',
    'super_admin'
  );

  -- Create professional level account
  professional_user_id := uuid_generate_v4();
  
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
    professional_user_id,
    '00000000-0000-0000-0000-000000000000',
    'professional@kapstone.com',
    crypt('test123', gen_salt('bf')),
    now(),
    now(),
    now(),
    jsonb_build_object(
      'provider', 'email',
      'providers', array['email']
    ),
    jsonb_build_object(
      'name', 'Professional User'
    ),
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
  );

  -- Create matching row in public.users for professional user
  INSERT INTO public.users (
    auth_id,
    email,
    full_name,
    role
  ) VALUES (
    professional_user_id,
    'professional@kapstone.com',
    'Professional User',
    'professional'
  );

END $$;