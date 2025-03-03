-- Add membership_type to clinic_applications
ALTER TABLE clinic_applications
ADD COLUMN IF NOT EXISTS membership_type text CHECK (membership_type IN ('clinic', 'solo', 'affiliate'));

-- Add membership_type to stripe_subscriptions metadata
CREATE OR REPLACE FUNCTION handle_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user's subscription status
  UPDATE users
  SET 
    subscription_status = NEW.status,
    subscription_updated_at = now(),
    subscription_ended_at = CASE 
      WHEN NEW.status = 'canceled' THEN now()
      ELSE NULL
    END,
    role = CASE
      WHEN NEW.status IN ('active', 'trialing') THEN
        CASE
          WHEN (NEW.metadata->>'membershipType')::text = 'affiliate' THEN 'professional'
          ELSE 'clinic_admin'
        END
      ELSE 'professional'
    END
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add index for membership type
CREATE INDEX IF NOT EXISTS idx_clinic_applications_membership_type 
ON clinic_applications(membership_type);