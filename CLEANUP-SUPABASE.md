# Supabase Cleanup Guide

Since the automated cleanup script is having connection issues, here's how to manually clean up your Supabase instance:

## Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: `igvvpriarxsqgscgcvsb`

## Step 2: Check Current Tables

1. Navigate to **SQL Editor** in the left sidebar
2. Run this query to see all tables in the public schema:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name != 'schema_migrations';
```

## Step 3: Delete Old Tables (if any exist)

If the query above returns any tables, run these commands to delete them:

```sql
-- Drop all tables in public schema (replace table_name with actual table names)
DROP TABLE IF EXISTS "table_name" CASCADE;
```

**Example for common table names:**
```sql
-- Only run these if the tables exist
DROP TABLE IF EXISTS "analytics_events" CASCADE;
DROP TABLE IF EXISTS "business_metrics" CASCADE;
DROP TABLE IF EXISTS "user_engagement" CASCADE;
DROP TABLE IF EXISTS "test_table" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "profiles" CASCADE;
```

## Step 4: Verify Clean State

Run this query again to confirm all tables are deleted:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name != 'schema_migrations';
```

This should return no results, indicating a clean Supabase instance.

## Step 5: Set Up Storage Buckets

1. Go to **Storage** in the left sidebar
2. Create the following buckets:

### Public Buckets (for images and files)
- `gift-app-files` (Public)
- `business-photos` (Public) 
- `business-logos` (Public)
- `category-images` (Public)

### Private Buckets (for sensitive documents)
- `business-documents` (Private)

## Step 6: Set Up Storage Policies

After creating the buckets, go to **SQL Editor** and run these policies:

```sql
-- Enable RLS on storage
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Business owners can upload documents
CREATE POLICY "Business owners can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'business-documents' AND 
  auth.role() = 'authenticated'
);

-- Business owners and admins can read documents
CREATE POLICY "Business owners and admins can read documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'business-documents' AND 
  auth.role() = 'authenticated'
);

-- Public read access for public buckets
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (
  bucket_id IN ('gift-app-files', 'business-photos', 'business-logos', 'category-images')
);

-- Authenticated users can upload to public buckets
CREATE POLICY "Authenticated users can upload to public buckets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id IN ('gift-app-files', 'business-photos', 'business-logos', 'category-images') AND 
  auth.role() = 'authenticated'
);
```

## Step 7: Create Analytics Tables

Run the SQL from `SETUP-HYBRID.md` to create the proper analytics tables:

```sql
-- Analytics Events Table
CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),
  business_id VARCHAR(255),
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Metrics Table
CREATE TABLE business_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id VARCHAR(255) NOT NULL,
  metric_name VARCHAR(255) NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Engagement Table
CREATE TABLE user_engagement (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  session_duration INTEGER,
  pages_visited INTEGER DEFAULT 0,
  actions_performed INTEGER DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform Analytics Function
CREATE OR REPLACE FUNCTION get_platform_analytics(
  start_date DATE,
  end_date DATE
) RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_events', COUNT(*),
    'unique_users', COUNT(DISTINCT user_id),
    'active_businesses', COUNT(DISTINCT business_id),
    'date_range', json_build_object('start', start_date, 'end', end_date)
  ) INTO result
  FROM analytics_events
  WHERE created_at::DATE BETWEEN start_date AND end_date;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

## Step 8: Test the Setup

After completing the setup, you can test the connection by visiting:
`http://localhost:3000/test-supabase`

This will verify that your Supabase instance is properly configured and ready for the hybrid Firebase + Supabase approach.

## Notes

- The `schema_migrations` table is a system table and should not be deleted
- If you see any other system tables, leave them alone
- The cleanup is only necessary if you had previous tables from testing
- A fresh Supabase instance should already be clean 