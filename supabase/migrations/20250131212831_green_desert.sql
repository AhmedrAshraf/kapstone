-- Create storage bucket for attachments if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  SELECT 'attachments', 'attachments', true
  WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'attachments'
  );
END $$;

-- Create storage policies
DO $$
BEGIN
  -- Drop existing policies first to avoid conflicts
  DROP POLICY IF EXISTS "Members can upload files" ON storage.objects;
  DROP POLICY IF EXISTS "Members can read files" ON storage.objects;
  DROP POLICY IF EXISTS "Members can delete own files" ON storage.objects;

  -- Create new policies
  CREATE POLICY "Members can upload files"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'attachments' AND
      auth.role() = 'authenticated'
    );

  CREATE POLICY "Members can read files"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'attachments' AND
      auth.role() = 'authenticated'
    );

  CREATE POLICY "Members can delete own files"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'attachments' AND
      auth.role() = 'authenticated' AND
      (auth.uid()::uuid = owner OR
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND raw_user_meta_data->>'role' = 'super_admin'
        )
      )
    );
END $$;

-- Grant necessary permissions
GRANT ALL ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;