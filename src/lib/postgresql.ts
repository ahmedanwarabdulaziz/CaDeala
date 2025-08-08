import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. PostgreSQL features will be disabled.');
  console.warn('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'NOT SET');
}

// Only create client if both environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    })
  : null;

// Database Schema Types
export interface DatabaseUser {
  id: string; // Firebase UID
  email: string;
  display_name?: string;
  photo_url?: string;
  phone_number?: string;
  role: 'customer' | 'business' | 'admin';
  user_code: string;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
  business_profile?: {
    business_id: string;
    business_name: string;
    upgrade_requested: boolean;
    upgrade_request_date?: string;
  };
}

export interface DatabaseCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
  banner_image: string;
  rounded_image: string;
  square_image: string;
  card_image: string;
  is_active: boolean;
  is_featured: boolean;
  order: number;
  created_at: string;
  updated_at: string;
  created_by?: string; // admin uid (optional)
}

export interface DatabaseSubcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
  banner_image: string;
  rounded_image: string;
  square_image: string;
  card_image: string;
  is_active: boolean;
  is_featured: boolean;
  order: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface DatabaseBusiness {
  id: string;
  application_id: string;
  business_name: string;
  category_id: string;
  subcategory_id?: string;
  sub_subcategory_id?: string;
  description: string;
  logo: string;
  banner_image: string;
  square_image: string;
  is_active: boolean;
  is_verified: boolean;
  verification_date?: string;
  verified_by?: string;
  created_at: string;
  updated_at: string;
  owner_id: string; // Firebase UID
}

export interface DatabaseBusinessApplication {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  business_name: string;
  business_type: string;
  industry: string;
  description: string;
  year_established: number;
  website: string;
  business_phone: string;
  business_email: string;
  contact_name: string;
  contact_title: string;
  contact_phone: string;
  contact_email: string;
  alternative_contact: string;
  location_name: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  business_hours: {
    open: string;
    close: string;
  };
  has_multiple_locations: boolean;
  primary_category: string;
  subcategories: string[];
  additional_categories: string[];
  employee_count: string;
  revenue_range: string;
  target_customers: string[];
  specializations: string[];
  license_number: string;
  tax_id: string;
  documents: {
    registration_certificate?: string;
    business_license?: string;
    tax_certificate?: string;
  };
  social_media: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
  business_photos: string[];
  logo?: string;
  terms_accepted: boolean;
  privacy_accepted: boolean;
  data_consent_accepted: boolean;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  applied_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export class PostgreSQLService {
  // Users
  static async createUser(userData: Omit<DatabaseUser, 'created_at' | 'updated_at'>): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    const { error } = await supabase
      .from('users')
      .insert({
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
  }

  static async syncCurrentUser(firebaseUser: any): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', firebaseUser.uid)
      .single();
    if (existingUser) {
      return; // User already exists
    }
    const userData = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      display_name: firebaseUser.displayName || null,
      photo_url: firebaseUser.photoURL || null,
      phone_number: firebaseUser.phoneNumber || null,
      role: 'customer' as const, // Default role
      user_code: `USER_${Date.now()}`, // Generate unique code
      is_email_verified: firebaseUser.emailVerified || false
    };
    await this.createUser(userData);
  }

  static async getUser(userId: string): Promise<DatabaseUser | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateUser(userId: string, updates: Partial<DatabaseUser>): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) throw error;
  }

  // Categories
  static async getCategories(): Promise<DatabaseCategory[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async getCategory(id: string): Promise<DatabaseCategory | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async createCategory(categoryData: Omit<DatabaseCategory, 'id' | 'created_at' | 'updated_at'> & { created_by?: string }): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    const { data, error } = await supabase
      .from('categories')
      .insert({
        ...categoryData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  }

  static async getSubcategories(categoryId: string): Promise<DatabaseSubcategory[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('category_id', categoryId)
      .order('order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async createSubcategory(subcategoryData: Omit<DatabaseSubcategory, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    const { data, error } = await supabase
      .from('subcategories')
      .insert({
        ...subcategoryData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  }

  static async updateSubcategory(id: string, updates: Partial<DatabaseSubcategory>): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    const { error } = await supabase
      .from('subcategories')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
  }

  static async deleteSubcategory(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    const { error } = await supabase
      .from('subcategories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  static async reorderSubcategories(subcategories: DatabaseSubcategory[]): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    for (const subcategory of subcategories) {
      await supabase
        .from('subcategories')
        .update({ order: subcategory.order })
        .eq('id', subcategory.id);
    }
  }

  static async updateCategory(id: string, updates: Partial<DatabaseCategory>): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    const { error } = await supabase
      .from('categories')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
  }

  static async deleteCategory(id: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  static async getAdminStats(): Promise<{
    totalUsers: number;
    totalBusinesses: number;
    pendingApplications: number;
    totalCategories: number;
  }> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    const [usersResult, businessesResult, applicationsResult, categoriesResult] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact' }),
      supabase.from('businesses').select('id', { count: 'exact' }),
      supabase.from('business_applications').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('categories').select('id', { count: 'exact' })
    ]);
    
    return {
      totalUsers: usersResult.count || 0,
      totalBusinesses: businessesResult.count || 0,
      pendingApplications: applicationsResult.count || 0,
      totalCategories: categoriesResult.count || 0
    };
  }

  // Business Applications
  static async createBusinessApplication(applicationData: Omit<DatabaseBusinessApplication, 'id' | 'applied_at' | 'reviewed_at'>): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    const { data, error } = await supabase
      .from('business_applications')
      .insert({
        ...applicationData,
        applied_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  }

  static async getBusinessApplications(status?: 'pending' | 'approved' | 'rejected'): Promise<DatabaseBusinessApplication[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    let query = supabase
      .from('business_applications')
      .select('*')
      .order('applied_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getUserApplication(userId: string): Promise<DatabaseBusinessApplication | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }

    const { data, error } = await supabase
      .from('business_applications')
      .select('*')
      .eq('user_id', userId)
      .order('applied_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching user application:', error);
      throw new Error('Failed to fetch user application');
    }

    return data;
  }

  static async updateBusinessApplication(id: string, updates: Partial<DatabaseBusinessApplication>): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    const { error } = await supabase
      .from('business_applications')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
  }

  // Businesses
  static async createBusiness(businessData: Omit<DatabaseBusiness, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    const { data, error } = await supabase
      .from('businesses')
      .insert({
        ...businessData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  }

  static async getBusinesses(): Promise<DatabaseBusiness[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getBusinessByOwner(ownerId: string): Promise<DatabaseBusiness | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', ownerId)
      .single();
    
    if (error) throw error;
    return data;
  }
}

export default supabase;
