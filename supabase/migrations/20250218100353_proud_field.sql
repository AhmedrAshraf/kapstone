-- Create stripe_customers table
CREATE TABLE IF NOT EXISTS stripe_customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_id text NOT NULL UNIQUE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stripe_subscriptions table
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id text NOT NULL UNIQUE,
  customer_id text NOT NULL,
  status text NOT NULL,
  price_id text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  cancel_at_period_end boolean DEFAULT false,
  cancel_at timestamptz,
  canceled_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  trial_start timestamptz,
  trial_end timestamptz
);

-- Create stripe_products table
CREATE TABLE IF NOT EXISTS stripe_products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id text NOT NULL UNIQUE,
  active boolean DEFAULT true,
  name text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stripe_prices table
CREATE TABLE IF NOT EXISTS stripe_prices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  price_id text NOT NULL UNIQUE,
  product_id text NOT NULL,
  active boolean DEFAULT true,
  currency text NOT NULL,
  type text NOT NULL,
  unit_amount integer,
  interval text,
  interval_count integer,
  trial_period_days integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_prices ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own customer data"
  ON stripe_customers FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM users WHERE id = user_id
  ));

CREATE POLICY "Users can view own subscriptions"
  ON stripe_subscriptions FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM users WHERE id = user_id
  ));

CREATE POLICY "Public can view active products"
  ON stripe_products FOR SELECT
  USING (active = true);

CREATE POLICY "Public can view active prices"
  ON stripe_prices FOR SELECT
  USING (active = true);

-- Create function to handle subscription status changes
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
          WHEN NEW.metadata->>'membershipType' = 'affiliate' THEN 'professional'
          ELSE 'clinic_admin'
        END
      ELSE 'professional'
    END
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for subscription changes
CREATE TRIGGER on_subscription_change
  AFTER INSERT OR UPDATE ON stripe_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION handle_subscription_change();

-- Create indexes
CREATE INDEX idx_stripe_customers_user ON stripe_customers(user_id);
CREATE INDEX idx_stripe_customers_customer ON stripe_customers(customer_id);
CREATE INDEX idx_stripe_subscriptions_user ON stripe_subscriptions(user_id);
CREATE INDEX idx_stripe_subscriptions_subscription ON stripe_subscriptions(subscription_id);
CREATE INDEX idx_stripe_subscriptions_customer ON stripe_subscriptions(customer_id);
CREATE INDEX idx_stripe_subscriptions_status ON stripe_subscriptions(status);
CREATE INDEX idx_stripe_products_active ON stripe_products(active);
CREATE INDEX idx_stripe_prices_active ON stripe_prices(active);
CREATE INDEX idx_stripe_prices_product ON stripe_prices(product_id);

-- Grant permissions
GRANT ALL ON stripe_customers TO authenticated;
GRANT ALL ON stripe_subscriptions TO authenticated;
GRANT ALL ON stripe_products TO authenticated;
GRANT ALL ON stripe_prices TO authenticated;