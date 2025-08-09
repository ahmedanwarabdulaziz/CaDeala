# Database Setup Instructions

## 🎯 Quick Fix for QR Code System

The QR code system is failing because the required database tables don't exist. Here's how to fix it:

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project

### Step 2: Open SQL Editor
1. In the left sidebar, click on **"SQL Editor"**
2. Click **"New query"** to create a new SQL query

### Step 3: Run the SQL Script
1. Copy the entire content from the `setup-database.sql` file
2. Paste it into the SQL Editor
3. Click **"Run"** to execute the SQL

### Step 4: Verify Success
You should see success messages for all the SQL statements. The script will create:

- ✅ `customer_registrations` table
- ✅ `business_registration_links` table  
- ✅ `business_reward_configs` table
- ✅ `customer_points` table
- ✅ `points_transactions` table
- ✅ All necessary indexes and triggers

### Step 5: Test the QR Code System
1. Refresh your business dashboard
2. The QR code should now load properly
3. Test the customer registration flow

## 🚨 What This Fixes

After running the SQL, your QR code system will work because:
- The `business_registration_links` table will exist
- All related tables for the points system will be created
- The error `Could not find the table 'public.business_registration_links'` will be resolved

## 📁 Files Created

The SQL script will create these new tables:
- `customer_registrations` - Track customer registrations through QR codes
- `business_registration_links` - Store QR codes and registration links
- `business_reward_configs` - Configure rewards and points
- `customer_points` - Track customer points and rewards
- `points_transactions` - Track points transactions

## 🔄 After Setup

Once the tables are created:
1. Your QR code generator will work
2. Customers can register through QR codes
3. Points system will be functional
4. Business dashboard will show QR codes properly

## ❓ Need Help?

If you encounter any issues:
1. Make sure you're in the correct Supabase project
2. Check that all SQL statements executed successfully
3. Refresh your application after running the SQL
4. Check the browser console for any remaining errors
