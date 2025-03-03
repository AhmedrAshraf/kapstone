-- Drop referral_replies table and related objects
DO $$ 
BEGIN
  -- Drop policies first
  DROP POLICY IF EXISTS "Members can view referral replies" ON referral_replies;
  DROP POLICY IF EXISTS "Members can create referral replies" ON referral_replies;
  DROP POLICY IF EXISTS "Members can update own referral replies" ON referral_replies;
  DROP POLICY IF EXISTS "Members can delete own referral replies" ON referral_replies;

  -- Drop trigger
  DROP TRIGGER IF EXISTS update_referral_replies_timestamp ON referral_replies;

  -- Drop function
  DROP FUNCTION IF EXISTS update_referral_replies_updated_at();

  -- Drop table (this will automatically drop related indexes)
  DROP TABLE IF EXISTS referral_replies CASCADE;

EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;