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
  customer_type?: 'public' | 'business_specific';
  registering_business_id?: string;
  access_level?: 'exclusive' | 'cross_business' | 'public';
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

export interface DatabaseBusinessService {
  id: string;
  business_id: string;
  name: string;
  description: string;
  original_price: number;
  discount_price: number;
  discount_percentage: number;
  service_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseGiftCard {
  id: string;
  business_id: string;
  service_id?: string;
  name: string;
  description: string;
  card_price: number;
  original_value: number;
  discount_value: number;
  card_type: 'dead_hour' | 'regular' | 'promotional';
  validity_hours: number;
  max_purchases?: number;
  current_purchases: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseGiftCardAvailability {
  id: string;
  gift_card_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export interface DatabaseGiftCardPurchase {
  id: string;
  gift_card_id: string;
  customer_id: string;
  business_id: string;
  purchase_amount: number;
  card_value: number;
  qr_code: string;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  purchased_at: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
}

export interface DatabaseGiftCardRedemption {
  id: string;
  purchase_id: string;
  business_id: string;
  customer_id: string;
  redeemed_by?: string;
  redemption_amount: number;
  notes?: string;
  redeemed_at: string;
  created_at: string;
}

// Add new interfaces for post-purchase registration system
export interface DatabaseCustomerRegistration {
  id: string;
  customer_id: string;
  business_id: string;
  registration_method: 'qr_code' | 'link' | 'app';
  purchase_amount?: number;
  purchase_details?: any;
  points_awarded: number;
  welcome_gift_awarded: boolean;
  registration_data?: any;
  created_at: string;
  updated_at: string;
}

export interface DatabaseBusinessRegistrationLink {
  id: string;
  business_id: string;
  unique_code: string;
  qr_code_url?: string;
  landing_page_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseBusinessRewardConfig {
  id: string;
  business_id: string;
  reward_type: 'points' | 'discount' | 'gift_card' | 'free_service';
  points_per_dollar: number;
  welcome_points: number;
  welcome_discount_percent?: number;
  welcome_gift_card_amount?: number;
  welcome_free_service?: string;
  is_automatic: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCustomerPoints {
  id: string;
  customer_id: string;
  business_id: string;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface DatabasePointsTransaction {
  id: string;
  customer_id: string;
  business_id: string;
  transaction_type: 'earned' | 'redeemed' | 'expired';
  points: number;
  description?: string;
  reference_id?: string;
  created_at: string;
}

export interface DatabaseBusinessStats {
  totalCards: number;
  activeCards: number;
  totalSales: number;
  totalCustomers: number;
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
      .maybeSingle();
    
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
      .maybeSingle();
    
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
      .maybeSingle();

    if (error) {
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

  // Method to sync user roles for approved business applications
  static async syncUserRolesForApprovedBusinesses(): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    try {
      // Get all approved business applications
      const { data: approvedApplications, error: applicationsError } = await supabase
        .from('business_applications')
        .select('*')
        .eq('status', 'approved');
      
      if (applicationsError) throw applicationsError;
      
      if (approvedApplications && approvedApplications.length > 0) {
        // Get all users with these user_ids
        const userIds = approvedApplications.map(app => app.user_id);
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, role')
          .in('id', userIds);
        
        if (usersError) throw usersError;
        
        // Update users who don't have 'business' role
        const usersToUpdate = users?.filter(user => user.role !== 'business') || [];
        
        for (const user of usersToUpdate) {
          await this.updateUser(user.id, { role: 'business' });
          console.log(`Updated user ${user.id} role to 'business'`);
        }
        
        // Check for approved applications that don't have business records
        for (const application of approvedApplications) {
          // Check if business record exists for this application
          const { data: existingBusiness, error: businessCheckError } = await supabase
            .from('businesses')
            .select('id')
            .eq('application_id', application.id)
            .maybeSingle();
          
          if (businessCheckError) {
            console.error('Error checking for existing business:', businessCheckError);
            continue;
          }
          
          // If no business record exists, create one
          if (!existingBusiness) {
            const businessData = {
              application_id: application.id,
              business_name: application.business_name,
              category_id: application.primary_category,
              subcategory_id: application.subcategories?.[0] || null,
              description: application.description,
              logo: application.logo || '',
              banner_image: application.business_photos?.[0] || '',
              square_image: application.business_photos?.[0] || '',
              is_active: true,
              is_verified: true,
              verification_date: new Date().toISOString(),
              verified_by: application.reviewed_by,
              owner_id: application.user_id
            };
            
            await this.createBusiness(businessData);
            console.log(`Created business record for approved application ${application.id}`);
          }
        }
        
        console.log(`Synced ${usersToUpdate.length} user roles and created business records for approved businesses`);
      }
    } catch (error) {
      console.error('Error syncing user roles for approved businesses:', error);
      throw error;
    }
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
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  // Business Services
  static async createBusinessService(serviceData: Omit<DatabaseBusinessService, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    const { data, error } = await supabase
      .from('business_services')
      .insert({
        ...serviceData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  }

  static async getBusinessServices(businessId: string): Promise<DatabaseBusinessService[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    // Check if business_services table exists first
    try {
      const { data, error } = await supabase
        .from('business_services')
        .select('id')
        .limit(1);
      
      if (error) {
        console.log('Business services table error:', error);
        // If it's a permission error, the table exists but we can't access it
        if (error.code === '42501' || error.code === 'PGRST116') {
          console.log('Business services table exists but access is restricted (RLS enabled)');
          return [];
        }
        console.log('Business services table does not exist, returning empty array');
        return [];
      }
    } catch (error) {
      console.log('Business services table does not exist, returning empty array');
      return [];
    }
    
    const { data, error } = await supabase
      .from('business_services')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching business services:', error);
      return [];
    }
    return data || [];
  }

  // Gift Cards
  static async createGiftCard(giftCardData: {
    business_id: string;
    service_id?: string;
    name: string;
    description: string;
    card_price: number;
    original_value: number;
    discount_value: number;
    card_type: 'dead_hour' | 'regular' | 'promotional';
    validity_hours: number;
    max_purchases?: number;
    time_slots: Array<{
      day_of_week: number;
      start_time: string;
      end_time: string;
    }>;
  }): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    // Create gift card
    const { data: giftCard, error: giftCardError } = await supabase
      .from('gift_cards')
      .insert({
        business_id: giftCardData.business_id,
        service_id: giftCardData.service_id,
        name: giftCardData.name,
        description: giftCardData.description,
        card_price: giftCardData.card_price,
        original_value: giftCardData.original_value,
        discount_value: giftCardData.discount_value,
        card_type: giftCardData.card_type,
        validity_hours: giftCardData.validity_hours,
        max_purchases: giftCardData.max_purchases,
        current_purchases: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (giftCardError) throw giftCardError;

    // Create time slots
    if (giftCardData.time_slots.length > 0) {
      const timeSlots = giftCardData.time_slots.map(slot => ({
        gift_card_id: giftCard.id,
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_active: true,
        created_at: new Date().toISOString()
      }));

      const { error: timeSlotsError } = await supabase
        .from('gift_card_availability')
        .insert(timeSlots);
      
      if (timeSlotsError) throw timeSlotsError;
    }
    
    return giftCard.id;
  }

  static async checkGiftCardTablesExist(): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    try {
      // Try to query the gift_cards table with a simple select
      const { data, error } = await supabase
        .from('gift_cards')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Gift cards table error:', error);
        // If it's a permission error, the table exists but we can't access it
        if (error.code === '42501' || error.code === 'PGRST116') {
          console.log('Gift cards table exists but access is restricted (RLS enabled)');
          return true;
        }
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking gift card tables:', error);
      return false;
    }
  }

  static async getBusinessGiftCards(businessId: string): Promise<DatabaseGiftCard[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    // Check if gift card tables exist first
    const tablesExist = await this.checkGiftCardTablesExist();
    if (!tablesExist) {
      console.log('Gift card tables do not exist, returning empty array');
      return [];
    }
    
    const { data, error } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching gift cards:', error);
      return [];
    }
    return data || [];
  }

  // Get business by ID
  static async getBusinessById(businessId: string): Promise<DatabaseBusiness | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching business by ID:', error);
      throw error;
    }
    
    return data;
  }

  static async getBusinessByUserId(userId: string): Promise<DatabaseBusiness | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    console.log('Looking for business with owner_id:', userId);
    
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching business by user ID:', error);
      throw error;
    }
    
    if (!data) {
      console.log('No business found for user:', userId);
      
      // Check if user has an approved business application
      const { data: approvedApplication, error: applicationError } = await supabase
        .from('business_applications')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'approved')
        .maybeSingle();
      
      if (applicationError) {
        console.error('Error checking for approved application:', applicationError);
        return null;
      }
      
      if (approvedApplication) {
        console.log('Found approved business application for user:', userId);
        // Create a business record for this approved application
        const businessData = {
          application_id: approvedApplication.id,
          business_name: approvedApplication.business_name,
          category_id: approvedApplication.primary_category,
          subcategory_id: approvedApplication.subcategories?.[0] || null,
          description: approvedApplication.description,
          logo: approvedApplication.logo || '',
          banner_image: approvedApplication.business_photos?.[0] || '',
          square_image: approvedApplication.business_photos?.[0] || '',
          is_active: true,
          is_verified: true,
          verification_date: new Date().toISOString(),
          verified_by: approvedApplication.reviewed_by,
          owner_id: userId
        };
        
        try {
          const businessId = await this.createBusiness(businessData);
          console.log('Created business record for approved application:', businessId);
          
          // Return the newly created business
          const { data: newBusiness, error: newBusinessError } = await supabase
            .from('businesses')
            .select('*')
            .eq('id', businessId)
            .single();
          
          if (newBusinessError) {
            console.error('Error fetching newly created business:', newBusinessError);
            return null;
          }
          
          return newBusiness;
        } catch (createError) {
          console.error('Error creating business record:', createError);
          return null;
        }
      }
      
      return null;
    }
    
    console.log('Found business:', data);
    return data;
  }

  static async getBusinessStats(businessId: string): Promise<DatabaseBusinessStats> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    
    // Check if gift card tables exist first
    const tablesExist = await this.checkGiftCardTablesExist();
    if (!tablesExist) {
      console.log('Gift card tables do not exist, returning default stats');
      return {
        totalCards: 0,
        activeCards: 0,
        totalSales: 0,
        totalCustomers: 0
      };
    }
    
    try {
      // Get total cards
      const { data: cards, error: cardsError } = await supabase
        .from('gift_cards')
        .select('id, is_active')
        .eq('business_id', businessId);
      
      if (cardsError) {
        console.error('Error fetching cards for stats:', cardsError);
        return {
          totalCards: 0,
          activeCards: 0,
          totalSales: 0,
          totalCustomers: 0
        };
      }

      // Get total sales
      const { data: sales, error: salesError } = await supabase
        .from('gift_card_purchases')
        .select('purchase_amount')
        .eq('business_id', businessId);
      
      if (salesError) {
        console.error('Error fetching sales for stats:', salesError);
        return {
          totalCards: cards?.length || 0,
          activeCards: cards?.filter(card => card.is_active).length || 0,
          totalSales: 0,
          totalCustomers: 0
        };
      }

      // Get unique customers
      const { data: customers, error: customersError } = await supabase
        .from('gift_card_purchases')
        .select('customer_id')
        .eq('business_id', businessId);
      
      if (customersError) {
        console.error('Error fetching customers for stats:', customersError);
        return {
          totalCards: cards?.length || 0,
          activeCards: cards?.filter(card => card.is_active).length || 0,
          totalSales: sales?.reduce((sum, sale) => sum + sale.purchase_amount, 0) || 0,
          totalCustomers: 0
        };
      }

      const totalCards = cards?.length || 0;
      const activeCards = cards?.filter(card => card.is_active).length || 0;
      const totalSales = sales?.reduce((sum, sale) => sum + sale.purchase_amount, 0) || 0;
      const uniqueCustomers = new Set(customers?.map(c => c.customer_id) || []).size;

      return {
        totalCards,
        activeCards,
        totalSales,
        totalCustomers: uniqueCustomers
      };
    } catch (error) {
      console.error('Error calculating business stats:', error);
      return {
        totalCards: 0,
        activeCards: 0,
        totalSales: 0,
        totalCustomers: 0
      };
    }
  }

  // Post-Purchase Registration System Methods

  // Generate QR code and registration link for a business
  static async generateBusinessRegistrationLink(businessId: string): Promise<DatabaseBusinessRegistrationLink> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }

    // Generate unique code
    const uniqueCode = `BR_${businessId.slice(0, 8)}_${Date.now()}`;
    
    // Create registration link - use fallback if NEXT_PUBLIC_APP_URL is not set
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cadeala.vercel.app';
    const registrationUrl = `${baseUrl}/register/business/${uniqueCode}`;
    
    // Generate QR code URL (we'll use a QR code service)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(registrationUrl)}`;

    const { data, error } = await supabase
      .from('business_registration_links')
      .insert({
        business_id: businessId,
        unique_code: uniqueCode,
        qr_code_url: qrCodeUrl,
        landing_page_url: registrationUrl,
        is_active: true
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  // Get business registration link
  static async getBusinessRegistrationLink(businessId: string): Promise<DatabaseBusinessRegistrationLink | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }

    const { data, error } = await supabase
      .from('business_registration_links')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Get business registration link by unique code
  static async getBusinessRegistrationLinkByCode(uniqueCode: string): Promise<DatabaseBusinessRegistrationLink | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }

    console.log('Looking for registration link with code:', uniqueCode);

    const { data, error } = await supabase
      .from('business_registration_links')
      .select('*')
      .eq('unique_code', uniqueCode)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching registration link:', error);
      throw error;
    }

    console.log('Registration link result:', data);
    return data;
  }

  // Register customer through business QR code
  static async registerCustomerThroughBusiness(
    businessId: string,
    customerData: {
      email: string;
      name: string;
      phone?: string;
    },
    purchaseAmount?: number,
    purchaseDetails?: any
  ): Promise<{ customer: DatabaseUser; registration: DatabaseCustomerRegistration; points: number }> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }

    console.log('Starting registration process for:', customerData.email, 'business:', businessId);

    // First, create or get the user
    let user: DatabaseUser;
    try {
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', customerData.email)
        .maybeSingle();

      if (userError) {
        console.error('Error checking existing user:', userError);
        throw userError;
      }

      if (existingUser) {
        console.log('Found existing user:', existingUser.id);
        user = existingUser;
        
        // Check if user is already registered with this business
        const { data: existingRegistration } = await supabase
          .from('customer_registrations')
          .select('*')
          .eq('customer_id', user.id)
          .eq('business_id', businessId)
          .maybeSingle();

        if (existingRegistration) {
          console.log('Customer already registered with this business:', existingRegistration.id);
          // Return existing registration with updated points if needed
          const points = await this.getCustomerPoints(user.id, businessId);
          return {
            customer: user,
            registration: existingRegistration,
            points: points?.points || 0
          };
        }

        // Update user to be business-specific if not already
        if (user.customer_type !== 'business_specific' || !user.registering_business_id) {
          console.log('Updating user to business-specific');
          await this.updateUser(user.id, {
            customer_type: 'business_specific',
            registering_business_id: businessId,
            access_level: 'exclusive'
          });
          user.customer_type = 'business_specific';
          user.registering_business_id = businessId;
          user.access_level = 'exclusive';
        }
      } else {
        console.log('Creating new user');
        // Create new user
        const userData = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email: customerData.email,
          display_name: customerData.name,
          phone_number: customerData.phone || undefined,
          role: 'customer' as const,
          customer_type: 'business_specific' as const,
          registering_business_id: businessId,
          access_level: 'exclusive' as const,
          user_code: `USER_${Date.now()}`,
          is_email_verified: false
        };

        await this.createUser(userData);
        user = userData as DatabaseUser;
        console.log('Created new user:', user.id);
      }
    } catch (error) {
      console.error('Error in user creation/retrieval:', error);
      throw error;
    }

    // Get business reward config
    let rewardConfig;
    try {
      rewardConfig = await this.getBusinessRewardConfig(businessId);
      console.log('Reward config:', rewardConfig);
    } catch (error) {
      console.error('Error getting reward config:', error);
      // Continue with default values
      rewardConfig = null;
    }
    
    // Calculate points
    const pointsPerDollar = rewardConfig?.points_per_dollar || 1.0;
    const welcomePoints = rewardConfig?.welcome_points || 0;
    const basePoints = purchaseAmount ? Math.floor(purchaseAmount * pointsPerDollar) : 0;
    const totalPoints = basePoints + welcomePoints;
    console.log('Calculated points:', totalPoints);

    // Create customer registration record
    let registration;
    try {
      const { data: registrationData, error: registrationError } = await supabase
        .from('customer_registrations')
        .insert({
          customer_id: user.id,
          business_id: businessId,
          registration_method: 'qr_code',
          purchase_amount: purchaseAmount,
          purchase_details: purchaseDetails,
          points_awarded: totalPoints,
          welcome_gift_awarded: welcomePoints > 0,
          registration_data: customerData
        })
        .select('*')
        .single();

      if (registrationError) {
        console.error('Error creating registration:', registrationError);
        throw registrationError;
      }
      registration = registrationData;
      console.log('Created registration:', registration.id);
    } catch (error) {
      console.error('Error in registration creation:', error);
      throw error;
    }

    // Create or update customer points
    try {
      await this.addCustomerPoints(user.id, businessId, totalPoints, `Registration reward for ${purchaseAmount ? `$${purchaseAmount} purchase` : 'new customer'}`);
      console.log('Added customer points successfully');
    } catch (error) {
      console.error('Error adding customer points:', error);
      // Don't throw here, as the registration was successful
    }

    return {
      customer: user,
      registration: registration,
      points: totalPoints
    };
  }

  // Get business reward config
  static async getBusinessRewardConfig(businessId: string): Promise<DatabaseBusinessRewardConfig | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }

    const { data, error } = await supabase
      .from('business_reward_configs')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Add points to customer
  static async addCustomerPoints(customerId: string, businessId: string, points: number, description?: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }

    // Check if customer points record exists
    const { data: existingPoints } = await supabase
      .from('customer_points')
      .select('*')
      .eq('customer_id', customerId)
      .eq('business_id', businessId)
      .maybeSingle();

    if (existingPoints) {
      // Update existing points
      const { error: updateError } = await supabase
        .from('customer_points')
        .update({
          points: existingPoints.points + points
        })
        .eq('customer_id', customerId)
        .eq('business_id', businessId);

      if (updateError) throw updateError;
    } else {
      // Create new points record
      const { error: insertError } = await supabase
        .from('customer_points')
        .insert({
          customer_id: customerId,
          business_id: businessId,
          points: points
        });

      if (insertError) throw insertError;
    }

    // Create points transaction record
    const { error: transactionError } = await supabase
      .from('points_transactions')
      .insert({
        customer_id: customerId,
        business_id: businessId,
        transaction_type: 'earned',
        points: points,
        description: description || 'Points earned'
      });

    if (transactionError) throw transactionError;
  }

  // Get customer points
  static async getCustomerPoints(customerId: string, businessId: string): Promise<DatabaseCustomerPoints | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }

    const { data, error } = await supabase
      .from('customer_points')
      .select('*')
      .eq('customer_id', customerId)
      .eq('business_id', businessId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Get customer registration history
  static async getCustomerRegistrations(customerId: string): Promise<DatabaseCustomerRegistration[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }

    const { data, error } = await supabase
      .from('customer_registrations')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get business customer registrations
  static async getBusinessCustomerRegistrations(businessId: string): Promise<DatabaseCustomerRegistration[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }

    const { data, error } = await supabase
      .from('customer_registrations')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get business customers with details and points
  static async getBusinessCustomers(businessId: string): Promise<Array<{
    customer: DatabaseUser;
    registration: DatabaseCustomerRegistration;
    points: DatabaseCustomerPoints | null;
  }>> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }

    // Get all customer registrations for this business
    const registrations = await this.getBusinessCustomerRegistrations(businessId);
    
    const customersWithDetails = await Promise.all(
      registrations.map(async (registration) => {
        // Get customer details
        const customer = await this.getUser(registration.customer_id);
        
        // Get customer points
        const points = await this.getCustomerPoints(registration.customer_id, businessId);
        
        return {
          customer: customer!,
          registration,
          points
        };
      })
    );

    return customersWithDetails.filter(item => item.customer !== null);
  }
}

export default supabase;
