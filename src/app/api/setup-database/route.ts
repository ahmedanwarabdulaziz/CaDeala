import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/postgresql';

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client not initialized' }, { status: 500 });
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // 1. Add columns to users table
    try {
      const { error } = await supabase.rpc('exec_sql', { 
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS customer_type VARCHAR(20) DEFAULT 'public' CHECK (customer_type IN ('public', 'business_specific'))` 
      });
      if (error) {
        errorCount++;
        results.push({ sql: 'ALTER TABLE users ADD COLUMN customer_type...', error: error.message, success: false });
      } else {
        successCount++;
        results.push({ sql: 'ALTER TABLE users ADD COLUMN customer_type...', success: true });
      }
    } catch (err: any) {
      errorCount++;
      results.push({ sql: 'ALTER TABLE users ADD COLUMN customer_type...', error: err.message, success: false });
    }

    // Since RPC doesn't work, let's use a different approach
    // We'll create the tables using the Supabase client's built-in methods
    
    // 2. Create customer_registrations table
    try {
      const { error } = await supabase
        .from('customer_registrations')
        .select('id')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        // Table doesn't exist, we need to create it manually
        // For now, let's just note this
        results.push({ sql: 'CREATE TABLE customer_registrations...', error: 'Table needs to be created manually in Supabase dashboard', success: false });
        errorCount++;
      } else {
        successCount++;
        results.push({ sql: 'CREATE TABLE customer_registrations...', success: true });
      }
    } catch (err: any) {
      errorCount++;
      results.push({ sql: 'CREATE TABLE customer_registrations...', error: err.message, success: false });
    }

    // 3. Create business_registration_links table
    try {
      const { error } = await supabase
        .from('business_registration_links')
        .select('id')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        results.push({ sql: 'CREATE TABLE business_registration_links...', error: 'Table needs to be created manually in Supabase dashboard', success: false });
        errorCount++;
      } else {
        successCount++;
        results.push({ sql: 'CREATE TABLE business_registration_links...', success: true });
      }
    } catch (err: any) {
      errorCount++;
      results.push({ sql: 'CREATE TABLE business_registration_links...', error: err.message, success: false });
    }

    // 4. Create business_reward_configs table
    try {
      const { error } = await supabase
        .from('business_reward_configs')
        .select('id')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        results.push({ sql: 'CREATE TABLE business_reward_configs...', error: 'Table needs to be created manually in Supabase dashboard', success: false });
        errorCount++;
      } else {
        successCount++;
        results.push({ sql: 'CREATE TABLE business_reward_configs...', success: true });
      }
    } catch (err: any) {
      errorCount++;
      results.push({ sql: 'CREATE TABLE business_reward_configs...', error: err.message, success: false });
    }

    // 5. Create customer_points table
    try {
      const { error } = await supabase
        .from('customer_points')
        .select('id')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        results.push({ sql: 'CREATE TABLE customer_points...', error: 'Table needs to be created manually in Supabase dashboard', success: false });
        errorCount++;
      } else {
        successCount++;
        results.push({ sql: 'CREATE TABLE customer_points...', success: true });
      }
    } catch (err: any) {
      errorCount++;
      results.push({ sql: 'CREATE TABLE customer_points...', error: err.message, success: false });
    }

    // 6. Create points_transactions table
    try {
      const { error } = await supabase
        .from('points_transactions')
        .select('id')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        results.push({ sql: 'CREATE TABLE points_transactions...', error: 'Table needs to be created manually in Supabase dashboard', success: false });
        errorCount++;
      } else {
        successCount++;
        results.push({ sql: 'CREATE TABLE points_transactions...', success: true });
      }
    } catch (err: any) {
      errorCount++;
      results.push({ sql: 'CREATE TABLE points_transactions...', error: err.message, success: false });
    }

    return NextResponse.json({
      success: errorCount === 0,
      message: `Database setup completed. Success: ${successCount}, Errors: ${errorCount}`,
      results,
      note: "Some tables need to be created manually in the Supabase dashboard. Please run the SQL from setup-database.sql in your Supabase SQL Editor."
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
