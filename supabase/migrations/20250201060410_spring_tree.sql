-- Create rate limiting table
CREATE TABLE rate_limits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address text NOT NULL,
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  first_request_at timestamptz DEFAULT now(),
  last_request_at timestamptz DEFAULT now()
);

-- Create unique constraint on ip and endpoint
CREATE UNIQUE INDEX idx_rate_limits_ip_endpoint 
ON rate_limits(ip_address, endpoint);

-- Create index for cleanup
CREATE INDEX idx_rate_limits_last_request 
ON rate_limits(last_request_at);

-- Enable RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits 
  WHERE last_request_at < now() - interval '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Create rate limit check function
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_ip_address text,
  p_endpoint text,
  p_max_requests integer DEFAULT 10,
  p_window_minutes integer DEFAULT 60
)
RETURNS boolean AS $$
DECLARE
  v_count integer;
  v_first_request timestamptz;
BEGIN
  -- Get or create rate limit record
  INSERT INTO rate_limits (ip_address, endpoint)
  VALUES (p_ip_address, p_endpoint)
  ON CONFLICT (ip_address, endpoint) DO UPDATE
  SET request_count = rate_limits.request_count + 1,
      last_request_at = now()
  RETURNING request_count, first_request_at
  INTO v_count, v_first_request;

  -- Check if within window
  IF v_first_request < now() - (p_window_minutes || ' minutes')::interval THEN
    -- Reset counter if window expired
    UPDATE rate_limits
    SET request_count = 1,
        first_request_at = now(),
        last_request_at = now()
    WHERE ip_address = p_ip_address
    AND endpoint = p_endpoint;
    RETURN true;
  END IF;

  -- Check if under limit
  RETURN v_count <= p_max_requests;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON rate_limits TO authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_rate_limits TO authenticated;