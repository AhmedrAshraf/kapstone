/*
  # Fix Content System Check

  1. Changes
    - Add proper content system check function
    - Add connection health check
    - Add content cache validation
    - Add error tracking improvements

  2. Security
    - Maintain existing RLS policies
    - Add additional validation
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS check_content_system();

-- Create improved content system check function
CREATE OR REPLACE FUNCTION check_content_system()
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
  v_content_count integer;
  v_cache_count integer;
  v_error_count integer;
BEGIN
  -- Initialize result object
  v_result := jsonb_build_object(
    'status', 'healthy',
    'timestamp', now(),
    'details', '{}'::jsonb
  );

  BEGIN
    -- Check content tables exist and are accessible
    SELECT COUNT(*) INTO v_content_count FROM page_content;
    SELECT COUNT(*) INTO v_cache_count FROM content_cache;
    
    -- Check for cache errors
    SELECT COUNT(*) INTO v_error_count 
    FROM content_cache 
    WHERE error_count > 0;

    -- Build detailed response
    v_result := jsonb_set(v_result, '{details}', jsonb_build_object(
      'content_count', v_content_count,
      'cache_count', v_cache_count,
      'error_count', v_error_count,
      'cache_health', CASE 
        WHEN v_error_count = 0 THEN 'healthy'
        WHEN v_error_count < 5 THEN 'degraded'
        ELSE 'unhealthy'
      END
    ));

    -- Update overall status if needed
    IF v_error_count >= 5 THEN
      v_result := jsonb_set(v_result, '{status}', '"unhealthy"');
    ELSIF v_error_count > 0 THEN
      v_result := jsonb_set(v_result, '{status}', '"degraded"');
    END IF;

  EXCEPTION
    WHEN others THEN
      RETURN jsonb_build_object(
        'status', 'error',
        'timestamp', now(),
        'details', jsonb_build_object(
          'error', SQLERRM,
          'context', 'Database access check failed'
        )
      );
  END;

  RETURN v_result;

EXCEPTION
  WHEN others THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'timestamp', now(),
      'details', jsonb_build_object(
        'error', SQLERRM,
        'context', 'Function execution failed'
      )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate content cache
CREATE OR REPLACE FUNCTION validate_content_cache()
RETURNS TABLE (
  page_id text,
  section_id text,
  status text,
  error text
) AS $$
BEGIN
  RETURN QUERY
  WITH validation AS (
    SELECT 
      cc.page_id,
      cc.section_id,
      CASE
        WHEN pc.id IS NULL THEN 'missing_content'
        WHEN cc.content_hash != pc.content_hash THEN 'hash_mismatch'
        WHEN cc.error_count > 0 THEN 'has_errors'
        ELSE 'valid'
      END as status,
      CASE
        WHEN pc.id IS NULL THEN 'No matching content found'
        WHEN cc.content_hash != pc.content_hash THEN 'Content hash mismatch'
        WHEN cc.error_count > 0 THEN cc.last_error
        ELSE NULL
      END as error
    FROM content_cache cc
    LEFT JOIN page_content pc ON 
      pc.page_id = cc.page_id AND 
      pc.section_id = cc.section_id
  )
  SELECT * FROM validation
  WHERE status != 'valid';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to repair invalid cache entries
CREATE OR REPLACE FUNCTION repair_content_cache()
RETURNS void AS $$
BEGIN
  -- Update cache entries with mismatched content
  UPDATE content_cache cc
  SET 
    rendered_content = pc.content,
    content_hash = pc.content_hash,
    error_count = 0,
    last_error = NULL,
    last_error_at = NULL,
    last_modified = now()
  FROM page_content pc
  WHERE pc.page_id = cc.page_id
  AND pc.section_id = cc.section_id
  AND (cc.content_hash != pc.content_hash OR cc.error_count > 0);

  -- Remove orphaned cache entries
  DELETE FROM content_cache cc
  WHERE NOT EXISTS (
    SELECT 1 FROM page_content pc
    WHERE pc.page_id = cc.page_id
    AND pc.section_id = cc.section_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_content_system TO authenticated;
GRANT EXECUTE ON FUNCTION validate_content_cache TO authenticated;
GRANT EXECUTE ON FUNCTION repair_content_cache TO authenticated;