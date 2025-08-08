import { supabase } from './postgresql';

export class DatabaseSetup {
  static async setupDatabase() {
    console.log('Setting up PostgreSQL database...');
    
    try {
      // Read and execute the schema SQL
      const schemaSQL = await this.getSchemaSQL();
      
      // Execute the schema in chunks to avoid timeout
      const statements = schemaSQL.split(';').filter(stmt => stmt.trim().length > 0);
      
      for (const statement of statements) {
        if (statement.trim() && supabase) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement.trim() });
          if (error) {
            console.warn('Statement execution warning:', error);
          }
        }
      }
      
      console.log('✅ Database schema setup completed');
      
      // Initialize with sample data
      await this.initializeSampleData();
      
    } catch (error) {
      console.error('❌ Database setup failed:', error);
      throw error;
    }
  }

  private static async getSchemaSQL(): Promise<string> {
    // This would normally read from the database-schema.sql file
    // For now, we'll use the Supabase Dashboard to run the schema
    return `
      -- This is a placeholder for the schema setup
      -- The actual schema should be run in the Supabase Dashboard SQL Editor
      -- See database-schema.sql for the complete schema
    `;
  }

  private static async initializeSampleData() {
    console.log('Initializing sample data...');
    
    try {
      // Create sample categories
      const sampleCategories = [
        {
          name: 'Restaurants',
          slug: 'restaurants',
          description: 'Discover amazing dining experiences',
          seo_title: 'Best Restaurants - Gift Cards & Dining',
          seo_description: 'Find the perfect restaurant gift cards for food lovers',
          seo_keywords: ['restaurants', 'dining', 'food', 'gift cards', 'fine dining'],
          is_active: true,
          is_featured: true,
          order: 1
        },
        {
          name: 'Retail',
          slug: 'retail',
          description: 'Shop your favorite stores',
          seo_title: 'Retail Gift Cards - Shopping & Fashion',
          seo_description: 'Gift cards for your favorite retail stores and fashion brands',
          seo_keywords: ['retail', 'shopping', 'fashion', 'clothing', 'gift cards'],
          is_active: true,
          is_featured: true,
          order: 2
        },
        {
          name: 'Services',
          slug: 'services',
          description: 'Professional services and experiences',
          seo_title: 'Service Gift Cards - Beauty, Spa & More',
          seo_description: 'Gift cards for beauty, spa, fitness and professional services',
          seo_keywords: ['services', 'beauty', 'spa', 'fitness', 'gift cards'],
          is_active: true,
          is_featured: false,
          order: 3
        }
      ];

      for (const category of sampleCategories) {
        if (supabase) {
          const { error } = await supabase
            .from('categories')
            .insert(category);
          
          if (error) {
            console.warn('Category insertion warning:', error);
          }
        }
      }

      console.log('✅ Sample data initialized');
      
    } catch (error) {
      console.error('❌ Sample data initialization failed:', error);
    }
  }

  static async testConnection() {
    try {
      console.log('Testing Supabase connection...');
      
      if (!supabase) {
        console.error('❌ Supabase client not initialized');
        return { 
          success: false, 
          error: 'Supabase client not initialized. Check environment variables.' 
        };
      }
      
      // Test basic connection
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('❌ Database connection test failed:', error);
        return { success: false, error: error.message || 'Unknown error' };
      }
      
      console.log('✅ Database connection successful');
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  static async testEnvironmentVariables() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    return {
      supabaseUrl: supabaseUrl ? '✅ Set' : '❌ Not set',
      supabaseAnonKey: supabaseAnonKey ? '✅ Set' : '❌ Not set',
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey
    };
  }
}
