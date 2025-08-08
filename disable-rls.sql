-- Disable RLS on all tables to fix infinite recursion
-- Run this in Supabase SQL Editor

-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories DISABLE ROW LEVEL SECURITY;
ALTER TABLE sub_subcategories DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to clean up
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;

DROP POLICY IF EXISTS "Categories are publicly readable" ON categories;
DROP POLICY IF EXISTS "Only admins can modify categories" ON categories;

DROP POLICY IF EXISTS "Subcategories are publicly readable" ON subcategories;
DROP POLICY IF EXISTS "Only admins can modify subcategories" ON subcategories;

DROP POLICY IF EXISTS "Sub-subcategories are publicly readable" ON sub_subcategories;
DROP POLICY IF EXISTS "Only admins can modify sub-subcategories" ON sub_subcategories;

DROP POLICY IF EXISTS "Users can view their own applications" ON business_applications;
DROP POLICY IF EXISTS "Users can create applications" ON business_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON business_applications;

DROP POLICY IF EXISTS "Businesses are publicly readable" ON businesses;
DROP POLICY IF EXISTS "Business owners can modify their businesses" ON businesses;
DROP POLICY IF EXISTS "Admins can modify all businesses" ON businesses;

DROP POLICY IF EXISTS "Reviews are publicly readable" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can modify all reviews" ON reviews;

DROP POLICY IF EXISTS "Only admins can access admin stats" ON admin_stats;
DROP POLICY IF EXISTS "Only admins can access settings" ON settings;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'categories', 'subcategories', 'sub_subcategories', 'business_applications', 'businesses', 'reviews', 'admin_stats', 'settings');
