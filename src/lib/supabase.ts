import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Analytics and file storage features will be disabled.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Analytics service for advanced reporting
export class AnalyticsService {
  /**
   * Track user activity for analytics
   */
  static async trackEvent(eventName: string, properties: Record<string, any> = {}) {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          event_name: eventName,
          properties,
          timestamp: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error tracking analytics event:', error);
      }
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }

  /**
   * Get business performance metrics
   */
  static async getBusinessMetrics(businessId: string, dateRange: { start: string; end: string }) {
    try {
      const { data, error } = await supabase
        .from('business_metrics')
        .select('*')
        .eq('business_id', businessId)
        .gte('date', dateRange.start)
        .lte('date', dateRange.end)
        .order('date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching business metrics:', error);
      return [];
    }
  }

  /**
   * Get platform-wide analytics for admin dashboard
   */
  static async getPlatformAnalytics(dateRange: { start: string; end: string }) {
    try {
      const { data, error } = await supabase
        .rpc('get_platform_analytics', {
          start_date: dateRange.start,
          end_date: dateRange.end
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching platform analytics:', error);
      return null;
    }
  }

  /**
   * Get user engagement metrics
   */
  static async getUserEngagement(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_engagement')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user engagement:', error);
      return [];
    }
  }
}

// File storage service using Supabase Storage
export class SupabaseFileService {
  /**
   * Upload a file to Supabase Storage
   */
  static async uploadFile(
    file: File, 
    bucket: string, 
    path: string,
    options?: {
      cacheControl?: string;
      upsert?: boolean;
    }
  ): Promise<string> {
    try {
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}_${file.name}`;
      const filePath = `${path}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: options?.cacheControl || '3600',
          upsert: options?.upsert || false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading file to Supabase:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Upload multiple files
   */
  static async uploadMultipleFiles(
    files: File[], 
    bucket: string, 
    path: string
  ): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => 
        this.uploadFile(file, bucket, path)
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw new Error('Failed to upload files');
    }
  }

  /**
   * Delete a file from Supabase Storage
   */
  static async deleteFile(bucket: string, path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting file from Supabase:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Get file URL
   */
  static getFileUrl(bucket: string, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
}

export default supabase; 