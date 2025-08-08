-- Add sample data for testing
-- Run this in Supabase SQL Editor

-- Insert sample categories
INSERT INTO categories (name, slug, description, seo_title, seo_description, seo_keywords, is_active, is_featured, "order") VALUES
('Restaurants', 'restaurants', 'Discover amazing dining experiences', 'Best Restaurants - Gift Cards & Dining', 'Find the perfect restaurant gift cards for food lovers', ARRAY['restaurants', 'dining', 'food', 'gift cards', 'fine dining'], true, true, 1),
('Retail', 'retail', 'Shop your favorite stores', 'Retail Gift Cards - Shopping & Fashion', 'Gift cards for your favorite retail stores and fashion brands', ARRAY['retail', 'shopping', 'fashion', 'clothing', 'gift cards'], true, true, 2),
('Services', 'services', 'Professional services and experiences', 'Service Gift Cards - Beauty, Spa & More', 'Gift cards for beauty, spa, fitness and professional services', ARRAY['services', 'beauty', 'spa', 'fitness', 'gift cards'], true, false, 3),
('Entertainment', 'entertainment', 'Fun and entertainment experiences', 'Entertainment Gift Cards - Movies, Games & More', 'Gift cards for movies, games, and entertainment experiences', ARRAY['entertainment', 'movies', 'games', 'fun', 'gift cards'], true, true, 4),
('Health & Wellness', 'health-wellness', 'Health and wellness services', 'Health & Wellness Gift Cards - Fitness & Spa', 'Gift cards for health, fitness, and wellness services', ARRAY['health', 'wellness', 'fitness', 'spa', 'gift cards'], true, false, 5)
ON CONFLICT (slug) DO NOTHING;

-- Verify the data was inserted
SELECT id, name, slug, is_active, is_featured, "order" FROM categories ORDER BY "order";
