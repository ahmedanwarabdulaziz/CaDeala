# Hybrid Firebase + Supabase Setup Guide

This guide explains how to set up the hybrid approach where Firebase handles authentication and basic data, while Supabase provides advanced analytics and file storage.

## Overview

### Firebase (Keep for):
- ✅ Authentication (Email/Password, Google, Apple)
- ✅ User management and role-based access
- ✅ Basic data storage (users, businesses, categories)
- ✅ Security rules and permissions

### Supabase (Add for):
- ✅ Advanced analytics and reporting
- ✅ File storage (better performance than Firebase Storage)
- ✅ Complex SQL queries for business insights
- ✅ Real-time analytics dashboards

## Step 1: Supabase Project Setup

### 1.1 Create Supabase Project
1. Go to [Supabase Console](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `gift-app-analytics`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 1.2 Get Project Credentials
1. Go to Settings > API
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Anon Public Key** (starts with `eyJ...`)

### 1.3 Environment Variables
Add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Keep existing Firebase config
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Step 2: Supabase Database Setup

### 2.1 Create Analytics Tables

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Analytics Events Table
CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID,
  business_id UUID
);

-- Business Metrics Table
CREATE TABLE business_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  date DATE NOT NULL,
  revenue DECIMAL(10,2) DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  customers_count INTEGER DEFAULT 0,
  average_order_value DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Engagement Table
CREATE TABLE user_engagement (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_duration INTEGER DEFAULT 0,
  pages_visited INTEGER DEFAULT 0,
  actions_performed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform Analytics Function
CREATE OR REPLACE FUNCTION get_platform_analytics(
  start_date DATE,
  end_date DATE
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'total_businesses', (SELECT COUNT(*) FROM business_metrics WHERE business_id IS NOT NULL),
    'total_revenue', (SELECT COALESCE(SUM(revenue), 0) FROM business_metrics WHERE date BETWEEN start_date AND end_date),
    'active_users', (SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE timestamp BETWEEN start_date AND end_date),
    'new_users_this_month', (SELECT COUNT(*) FROM auth.users WHERE created_at >= date_trunc('month', NOW())),
    'new_businesses_this_month', (SELECT COUNT(DISTINCT business_id) FROM business_metrics WHERE date >= date_trunc('month', NOW())),
    'revenue_growth', (
      SELECT COALESCE(
        ((SUM(CASE WHEN date >= date_trunc('month', NOW()) THEN revenue ELSE 0 END) - 
          SUM(CASE WHEN date >= date_trunc('month', NOW() - INTERVAL '1 month') AND date < date_trunc('month', NOW()) THEN revenue ELSE 0 END)) / 
         NULLIF(SUM(CASE WHEN date >= date_trunc('month', NOW() - INTERVAL '1 month') AND date < date_trunc('month', NOW()) THEN revenue ELSE 0 END), 0)) * 100, 0
      ) FROM business_metrics
    ),
    'user_engagement', (
      SELECT COALESCE(AVG(session_duration), 0) FROM user_engagement 
      WHERE created_at BETWEEN start_date AND end_date
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

### 2.2 Create Storage Buckets

In Supabase Dashboard > Storage, create these buckets:

1. **gift-app-files** (Public)
   - For general file uploads
   - Public access for reading

2. **business-documents** (Private)
   - For business registration documents
   - Private access only

3. **business-photos** (Public)
   - For business photos
   - Public access for reading

4. **business-logos** (Public)
   - For business logos
   - Public access for reading

5. **category-images** (Public)
   - For category images
   - Public access for reading

### 2.3 Storage Policies

Add these Row Level Security (RLS) policies:

```sql
-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for business documents (only business owners can upload)
CREATE POLICY "Business owners can upload documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'business-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy for reading business documents (only business owners and admins)
CREATE POLICY "Business owners and admins can read documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'business-documents' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR 
     EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'))
  );

-- Policy for public buckets (anyone can read)
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (
    bucket_id IN ('gift-app-files', 'business-photos', 'business-logos', 'category-images')
  );

-- Policy for authenticated users to upload to public buckets
CREATE POLICY "Authenticated users can upload to public buckets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('gift-app-files', 'business-photos', 'business-logos', 'category-images') AND
    auth.role() = 'authenticated'
  );
```

## Step 3: Update Your Application

### 3.1 Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### 3.2 Update File Upload Components

Replace Firebase file upload calls with the enhanced service:

```typescript
// Old Firebase way
import { FileUploadService } from '@/lib/file-upload';

// New hybrid way
import { EnhancedFileUploadService } from '@/lib/enhanced-file-upload';

// Usage
const uploadedDocs = await EnhancedFileUploadService.uploadBusinessDocuments(
  documents,
  userId,
  'supabase' // or 'firebase' for fallback
);
```

### 3.3 Add Analytics Tracking

Track user events for analytics:

```typescript
import { AnalyticsService } from '@/lib/supabase';

// Track user actions
await AnalyticsService.trackEvent('gift_card_purchased', {
  businessId: 'business-123',
  amount: 100,
  category: 'restaurant'
});
```

## Step 4: Testing the Setup

### 4.1 Test Supabase Connection
Visit `/test-supabase` to verify the connection.

### 4.2 Test File Upload
1. Go to business registration
2. Upload documents
3. Verify files appear in Supabase Storage

### 4.3 Test Analytics
1. Visit `/admin/analytics`
2. Check if data appears
3. Test date range filtering

## Step 5: Migration Strategy

### Phase 1: Add Supabase (Current)
- ✅ Install Supabase client
- ✅ Set up analytics tables
- ✅ Create storage buckets
- ✅ Add analytics tracking
- ✅ Create enhanced file upload service

### Phase 2: Gradual Migration
- 🔄 Move file uploads to Supabase
- 🔄 Add more analytics tracking
- 🔄 Create business dashboards

### Phase 3: Advanced Features
- 🔄 Real-time analytics
- 🔄 Advanced reporting
- 🔄 Custom SQL queries

## Benefits of This Hybrid Approach

### 1. **Best of Both Worlds**
- Firebase's mature auth system
- Supabase's superior analytics and storage

### 2. **Cost Optimization**
- Firebase free tier for auth
- Supabase generous free tier for analytics

### 3. **Performance**
- Faster file uploads with Supabase
- Better analytics queries with PostgreSQL

### 4. **Scalability**
- Easy to scale analytics independently
- Can migrate more features gradually

## Troubleshooting

### Common Issues

1. **Supabase connection fails**
   - Check environment variables
   - Verify project URL and API key

2. **File upload fails**
   - Check storage bucket permissions
   - Verify RLS policies

3. **Analytics not showing**
   - Check if tables exist
   - Verify function permissions

### Debug Commands

```bash
# Test Supabase connection
curl -X GET "https://your-project.supabase.co/rest/v1/" \
  -H "apikey: your-anon-key"

# Check storage buckets
curl -X GET "https://your-project.supabase.co/storage/v1/bucket/list" \
  -H "apikey: your-anon-key"
```

## Next Steps

1. **Set up Supabase project** following this guide
2. **Update environment variables** with your credentials
3. **Test the connection** using the test pages
4. **Start using analytics** in your admin dashboard
5. **Gradually migrate file uploads** to Supabase

This hybrid approach gives you the stability of Firebase for authentication while leveraging Supabase's superior analytics and file storage capabilities. 