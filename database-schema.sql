-- PostgreSQL Database Schema for Gift Card App
-- This schema replaces Firestore collections with PostgreSQL tables

-- Users table (replaces Firestore users collection)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, -- Firebase UID
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    photo_url TEXT,
    phone_number TEXT,
    role TEXT NOT NULL CHECK (role IN ('customer', 'business', 'admin')),
    user_code TEXT NOT NULL UNIQUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    business_profile JSONB, -- For business upgrade requests
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table (replaces Firestore categories collection)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[],
    banner_image TEXT,
    rounded_image TEXT,
    square_image TEXT,
    card_image TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT REFERENCES users(id)
);

-- Subcategories table (replaces Firestore subcategories collection)
CREATE TABLE IF NOT EXISTS subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[],
    banner_image TEXT,
    rounded_image TEXT,
    square_image TEXT,
    card_image TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT REFERENCES users(id)
);

-- Sub-subcategories table (replaces Firestore subSubcategories collection)
CREATE TABLE IF NOT EXISTS sub_subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subcategory_id UUID REFERENCES subcategories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT[],
    banner_image TEXT,
    rounded_image TEXT,
    square_image TEXT,
    card_image TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT REFERENCES users(id)
);

-- Business applications table (replaces Firestore businessApplications collection)
CREATE TABLE IF NOT EXISTS business_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    industry TEXT NOT NULL,
    description TEXT,
    year_established INTEGER,
    website TEXT,
    business_phone TEXT,
    business_email TEXT,
    contact_name TEXT NOT NULL,
    contact_title TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    alternative_contact TEXT,
    location_name TEXT,
    street_address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'United States',
    business_hours JSONB, -- {open: string, close: string}
    has_multiple_locations BOOLEAN DEFAULT FALSE,
    primary_category TEXT,
    subcategories TEXT[],
    additional_categories TEXT[],
    employee_count TEXT,
    revenue_range TEXT,
    target_customers TEXT[],
    specializations TEXT[],
    license_number TEXT,
    tax_id TEXT,
    documents JSONB, -- {registration_certificate?: string, business_license?: string, tax_certificate?: string}
    social_media JSONB, -- {facebook: string, instagram: string, twitter: string, linkedin: string}
    business_photos TEXT[],
    logo TEXT,
    terms_accepted BOOLEAN DEFAULT FALSE,
    privacy_accepted BOOLEAN DEFAULT FALSE,
    data_consent_accepted BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_by TEXT REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Businesses table (replaces Firestore businesses collection)
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES business_applications(id),
    business_name TEXT NOT NULL,
    category_id UUID REFERENCES categories(id),
    subcategory_id UUID REFERENCES subcategories(id),
    sub_subcategory_id UUID REFERENCES sub_subcategories(id),
    description TEXT,
    logo TEXT,
    banner_image TEXT,
    square_image TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP WITH TIME ZONE,
    verified_by TEXT REFERENCES users(id),
    owner_id TEXT REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table (replaces Firestore reviews collection)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin stats table (replaces Firestore adminStats collection)
CREATE TABLE IF NOT EXISTS admin_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_users INTEGER DEFAULT 0,
    total_businesses INTEGER DEFAULT 0,
    total_applications INTEGER DEFAULT 0,
    pending_applications INTEGER DEFAULT 0,
    approved_applications INTEGER DEFAULT 0,
    rejected_applications INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table (replaces Firestore settings collection)
CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories("order");
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_sub_subcategories_subcategory_id ON sub_subcategories(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_business_applications_user_id ON business_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_business_applications_status ON business_applications(status);
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_category_id ON businesses(category_id);
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table (using Firebase UID)
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Admins can view all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = current_setting('request.jwt.claims', true)::json->>'sub' AND role = 'admin'
        )
    );

-- RLS Policies for categories table (public read, admin write)
CREATE POLICY "Categories are publicly readable" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = current_setting('request.jwt.claims', true)::json->>'sub' AND role = 'admin'
        )
    );

-- RLS Policies for subcategories table (public read, admin write)
CREATE POLICY "Subcategories are publicly readable" ON subcategories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify subcategories" ON subcategories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = current_setting('request.jwt.claims', true)::json->>'sub' AND role = 'admin'
        )
    );

-- RLS Policies for sub_subcategories table (public read, admin write)
CREATE POLICY "Sub-subcategories are publicly readable" ON sub_subcategories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify sub-subcategories" ON sub_subcategories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = current_setting('request.jwt.claims', true)::json->>'sub' AND role = 'admin'
        )
    );

-- RLS Policies for business_applications table
CREATE POLICY "Users can view their own applications" ON business_applications
    FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can create applications" ON business_applications
    FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Admins can view all applications" ON business_applications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = current_setting('request.jwt.claims', true)::json->>'sub' AND role = 'admin'
        )
    );

-- RLS Policies for businesses table (public read, owner/admin write)
CREATE POLICY "Businesses are publicly readable" ON businesses
    FOR SELECT USING (true);

CREATE POLICY "Business owners can modify their businesses" ON businesses
    FOR ALL USING (owner_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Admins can modify all businesses" ON businesses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = current_setting('request.jwt.claims', true)::json->>'sub' AND role = 'admin'
        )
    );

-- RLS Policies for reviews table (public read, authenticated create)
CREATE POLICY "Reviews are publicly readable" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON reviews
    FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own reviews" ON reviews
    FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Admins can modify all reviews" ON reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = current_setting('request.jwt.claims', true)::json->>'sub' AND role = 'admin'
        )
    );

-- RLS Policies for admin_stats table (admin only)
CREATE POLICY "Only admins can access admin stats" ON admin_stats
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = current_setting('request.jwt.claims', true)::json->>'sub' AND role = 'admin'
        )
    );

-- RLS Policies for settings table (admin only)
CREATE POLICY "Only admins can access settings" ON settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = current_setting('request.jwt.claims', true)::json->>'sub' AND role = 'admin'
        )
    );

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON subcategories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sub_subcategories_updated_at BEFORE UPDATE ON sub_subcategories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_stats_updated_at BEFORE UPDATE ON admin_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
