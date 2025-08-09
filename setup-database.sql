-- Post-Purchase Registration System Database Schema
-- Run this SQL in your Supabase SQL Editor

-- 1. Add customer type and business association to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS customer_type VARCHAR(20) DEFAULT 'public' CHECK (customer_type IN ('public', 'business_specific'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS registering_business_id UUID REFERENCES businesses(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS access_level VARCHAR(20) DEFAULT 'exclusive' CHECK (access_level IN ('exclusive', 'cross_business', 'public'));

-- 1.1. Add unique constraint for email field (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_email_unique'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
    END IF;
END $$;

-- 2. Create customer_registrations table
CREATE TABLE IF NOT EXISTS customer_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  registration_method VARCHAR(20) NOT NULL CHECK (registration_method IN ('qr_code', 'link', 'app')),
  purchase_amount DECIMAL(10,2),
  purchase_details JSONB,
  points_awarded INTEGER DEFAULT 0,
  welcome_gift_awarded BOOLEAN DEFAULT false,
  registration_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(customer_id, business_id)
);

-- 3. Create business_registration_links table
CREATE TABLE IF NOT EXISTS business_registration_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  unique_code VARCHAR(50) UNIQUE NOT NULL,
  qr_code_url TEXT,
  landing_page_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create business_reward_configs table
CREATE TABLE IF NOT EXISTS business_reward_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  reward_type VARCHAR(20) NOT NULL CHECK (reward_type IN ('points', 'discount', 'gift_card', 'free_service')),
  points_per_dollar DECIMAL(5,2) DEFAULT 1.0,
  welcome_points INTEGER DEFAULT 0,
  welcome_discount_percent DECIMAL(5,2),
  welcome_gift_card_amount DECIMAL(10,2),
  welcome_free_service TEXT,
  is_automatic BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create customer_points table
CREATE TABLE IF NOT EXISTS customer_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_redeemed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(customer_id, business_id)
);

-- 6. Create points_transactions table
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired')),
  points INTEGER NOT NULL,
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_registrations_customer_id ON customer_registrations(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_registrations_business_id ON customer_registrations(business_id);
CREATE INDEX IF NOT EXISTS idx_customer_registrations_created_at ON customer_registrations(created_at);

CREATE INDEX IF NOT EXISTS idx_business_registration_links_business_id ON business_registration_links(business_id);
CREATE INDEX IF NOT EXISTS idx_business_registration_links_unique_code ON business_registration_links(unique_code);

CREATE INDEX IF NOT EXISTS idx_business_reward_configs_business_id ON business_reward_configs(business_id);

CREATE INDEX IF NOT EXISTS idx_customer_points_customer_id ON customer_points(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_points_business_id ON customer_points(business_id);
CREATE INDEX IF NOT EXISTS idx_customer_points_customer_business ON customer_points(customer_id, business_id);

CREATE INDEX IF NOT EXISTS idx_points_transactions_customer_id ON points_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_business_id ON points_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at);

-- 8. Create triggers for updated_at timestamps (only if they don't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist, then recreate them
DROP TRIGGER IF EXISTS update_customer_registrations_updated_at ON customer_registrations;
CREATE TRIGGER update_customer_registrations_updated_at BEFORE UPDATE ON customer_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_registration_links_updated_at ON business_registration_links;
CREATE TRIGGER update_business_registration_links_updated_at BEFORE UPDATE ON business_registration_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_reward_configs_updated_at ON business_reward_configs;
CREATE TRIGGER update_business_reward_configs_updated_at BEFORE UPDATE ON business_reward_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_points_updated_at ON customer_points;
CREATE TRIGGER update_customer_points_updated_at BEFORE UPDATE ON customer_points FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Insert default reward config for existing businesses
INSERT INTO business_reward_configs (business_id, reward_type, points_per_dollar, welcome_points, is_automatic, is_active)
SELECT 
    b.id,
    'points',
    1.0,
    0,
    true,
    true
FROM businesses b
WHERE NOT EXISTS (
    SELECT 1 FROM business_reward_configs brc WHERE brc.business_id = b.id
);
