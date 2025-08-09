-- Safe Gift Card Schema - Run this in your Supabase SQL Editor
-- This version handles existing tables and triggers without conflicts

-- Drop existing triggers first (if they exist)
DROP TRIGGER IF EXISTS update_business_services_updated_at ON business_services;
DROP TRIGGER IF EXISTS update_gift_cards_updated_at ON gift_cards;
DROP TRIGGER IF EXISTS update_customer_points_updated_at ON customer_points;

-- Business Services Table
CREATE TABLE IF NOT EXISTS business_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    original_price DECIMAL(10,2) NOT NULL,
    discount_price DECIMAL(10,2) NOT NULL,
    discount_percentage INTEGER NOT NULL,
    service_type VARCHAR(100), -- 'massage', 'upholstery', 'detailing', etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift Cards Table
CREATE TABLE IF NOT EXISTS gift_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    service_id UUID REFERENCES business_services(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    card_price DECIMAL(10,2) NOT NULL, -- Price customer pays for the card
    original_value DECIMAL(10,2) NOT NULL, -- Original service price
    discount_value DECIMAL(10,2) NOT NULL, -- Discounted service price
    card_type VARCHAR(50) NOT NULL, -- 'dead_hour', 'regular', 'promotional'
    validity_hours INTEGER DEFAULT 24, -- How long card is valid after purchase
    max_purchases INTEGER DEFAULT NULL, -- NULL = unlimited
    current_purchases INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift Card Availability (Time-based)
CREATE TABLE IF NOT EXISTS gift_card_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift Card Purchases (FIXED: customer_id is TEXT to match users.id)
CREATE TABLE IF NOT EXISTS gift_card_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
    customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    purchase_amount DECIMAL(10,2) NOT NULL,
    card_value DECIMAL(10,2) NOT NULL, -- Value of the service
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'used', 'expired', 'cancelled'
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift Card Redemptions (FIXED: customer_id and redeemed_by are TEXT)
CREATE TABLE IF NOT EXISTS gift_card_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID NOT NULL REFERENCES gift_card_purchases(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    redeemed_by TEXT REFERENCES users(id), -- Business staff who redeemed
    redemption_amount DECIMAL(10,2) NOT NULL,
    notes TEXT,
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Points System (FIXED: customer_id is TEXT)
CREATE TABLE IF NOT EXISTS customer_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    total_cards_purchased INTEGER DEFAULT 0,
    total_cards_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, business_id)
);

-- Points Transactions (FIXED: customer_id is TEXT)
CREATE TABLE IF NOT EXISTS points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    purchase_id UUID REFERENCES gift_card_purchases(id),
    redemption_id UUID REFERENCES gift_card_redemptions(id),
    points_earned INTEGER DEFAULT 0,
    points_spent INTEGER DEFAULT 0,
    transaction_type VARCHAR(50) NOT NULL, -- 'purchase', 'redemption', 'bonus'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Analytics
CREATE TABLE IF NOT EXISTS business_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_cards_sold INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_redemptions INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    active_cards INTEGER DEFAULT 0,
    expired_cards INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(business_id, date)
);

-- Indexes for Performance (IF NOT EXISTS to avoid conflicts)
CREATE INDEX IF NOT EXISTS idx_gift_cards_business_id ON gift_cards(business_id);
CREATE INDEX IF NOT EXISTS idx_gift_cards_active ON gift_cards(is_active);
CREATE INDEX IF NOT EXISTS idx_purchases_customer_id ON gift_card_purchases(customer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_business_id ON gift_card_purchases(business_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON gift_card_purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_qr_code ON gift_card_purchases(qr_code);
CREATE INDEX IF NOT EXISTS idx_availability_gift_card_id ON gift_card_availability(gift_card_id);
CREATE INDEX IF NOT EXISTS idx_availability_active ON gift_card_availability(is_active);
CREATE INDEX IF NOT EXISTS idx_customer_points_customer_business ON customer_points(customer_id, business_id);

-- Triggers for updated_at (recreate safely)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers only if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_business_services_updated_at') THEN
        CREATE TRIGGER update_business_services_updated_at BEFORE UPDATE ON business_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_gift_cards_updated_at') THEN
        CREATE TRIGGER update_gift_cards_updated_at BEFORE UPDATE ON gift_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_customer_points_updated_at') THEN
        CREATE TRIGGER update_customer_points_updated_at BEFORE UPDATE ON customer_points FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Success message
SELECT 'Gift card tables created/updated successfully! Foreign key constraints are now compatible with users.id (TEXT type).' as message;
