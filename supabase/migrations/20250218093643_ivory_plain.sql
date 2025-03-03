-- Add subscription fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS subscription_id text,
ADD COLUMN IF NOT EXISTS subscription_status text,
ADD COLUMN IF NOT EXISTS subscription_updated_at timestamptz,
ADD COLUMN IF NOT EXISTS subscription_ended_at timestamptz;

-- Create index for subscription lookups
CREATE INDEX IF NOT EXISTS idx_users_subscription 
ON users(subscription_id);

-- Create index for subscription status
CREATE INDEX IF NOT EXISTS idx_users_subscription_status 
ON users(subscription_status);