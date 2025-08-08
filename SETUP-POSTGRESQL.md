# PostgreSQL Migration Setup Guide

## Overview
This guide will help you migrate from Firebase Firestore to PostgreSQL using Supabase while keeping Firebase for authentication.

## Architecture
- **Firebase**: Authentication only (Email/Password, Google, Apple)
- **PostgreSQL**: All data storage (users, categories, businesses, etc.)
- **Supabase**: PostgreSQL database with built-in APIs and security

## Step 1: Supabase Project Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login
3. Create a new project
4. Note down your project URL and anon key

### 1.2 Environment Variables
Your `.env.local` file should contain:
```env
# Firebase (for authentication)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Supabase PostgreSQL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 2: Database Schema Setup

### 2.1 Run Database Schema
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `database-schema.sql`
4. Paste and execute the SQL

### 2.2 Verify Tables Created
After running the schema, you should see these tables:
- `users` - User profiles and authentication data
- `categories` - Business categories
- `subcategories` - Subcategories within categories
- `sub_subcategories` - Sub-subcategories
- `business_applications` - Business upgrade requests
- `businesses` - Approved businesses
- `reviews` - Customer reviews
- `admin_stats` - Platform statistics
- `settings` - System settings

## Step 3: Test the Setup

### 3.1 Test Database Connection
1. Visit `http://localhost:3000/test-postgresql`
2. Click "Test Connection"
3. Verify the connection is successful

### 3.2 Test User Operations
1. Click "Test User Operations"
2. Verify user creation and retrieval works

### 3.3 Test Category Operations
1. Click "Test Category Operations"
2. Verify category retrieval works

## Step 4: Update Authentication Context

### 4.1 Modify AuthContext
The `AuthContext.tsx` needs to be updated to use PostgreSQL instead of Firestore:

```typescript
// In AuthContext.tsx, replace Firestore operations with PostgreSQL
import { PostgreSQLService } from '@/lib/postgresql';

// Replace Firestore user creation with PostgreSQL
await PostgreSQLService.createUser({
  id: result.user.uid,
  email: result.user.email!,
  display_name: result.user.displayName,
  photo_url: result.user.photoURL,
  phone_number: result.user.phoneNumber,
  role: 'customer',
  user_code: userCode,
  is_email_verified: result.user.emailVerified
});

// Replace Firestore user retrieval with PostgreSQL
const userData = await PostgreSQLService.getUser(firebaseUser.uid);
```

## Step 5: Update All Database Operations

### 5.1 Replace Firestore with PostgreSQL
All database operations need to be updated:

```typescript
// Old Firestore code
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// New PostgreSQL code
import { PostgreSQLService } from '@/lib/postgresql';

// Example: Getting categories
const categories = await PostgreSQLService.getCategories();
```

### 5.2 Update Components
Update these components to use PostgreSQL:
- `BusinessRegistrationModal.tsx`
- `AdminLayout.tsx`
- All admin pages
- All business pages

## Step 6: Data Migration (Optional)

### 6.1 Export Firestore Data
If you have existing data in Firestore:
1. Go to Firebase Console
2. Export your collections as JSON
3. Use the migration script to import to PostgreSQL

### 6.2 Migration Script
Create a migration script to move data from Firestore to PostgreSQL:

```typescript
// migration-script.ts
import { PostgreSQLService } from '@/lib/postgresql';

export async function migrateUsers(firestoreUsers: any[]) {
  for (const user of firestoreUsers) {
    await PostgreSQLService.createUser({
      id: user.id,
      email: user.email,
      display_name: user.displayName,
      role: user.role,
      user_code: user.userCode,
      is_email_verified: user.isEmailVerified
    });
  }
}
```

## Step 7: Security and Permissions

### 7.1 Row Level Security (RLS)
The schema includes RLS policies that:
- Users can only access their own data
- Admins can access all data
- Public read access for categories and businesses
- Authenticated users can create reviews

### 7.2 API Security
Supabase automatically provides:
- REST API with automatic CRUD operations
- GraphQL API (if enabled)
- Real-time subscriptions
- Built-in authentication integration

## Step 8: File Storage

### 8.1 Option A: Keep Firebase Storage
- Continue using Firebase Storage for files
- Update file URLs in PostgreSQL

### 8.2 Option B: Migrate to Supabase Storage
- Create storage buckets in Supabase
- Update file upload functions
- Migrate existing files

## Step 9: Testing

### 9.1 Test All Features
1. User registration and login
2. Business application submission
3. Admin approval process
4. Category management
5. Business profile management

### 9.2 Performance Testing
- Test database query performance
- Verify real-time updates work
- Check file upload/download

## Step 10: Deployment

### 10.1 Environment Variables
Ensure all environment variables are set in production:
- Firebase configuration
- Supabase configuration

### 10.2 Database Backups
- Enable automatic backups in Supabase
- Set up monitoring and alerts

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify environment variables
   - Check Supabase project status
   - Ensure network connectivity

2. **Permission Errors**
   - Verify RLS policies are correct
   - Check user authentication status
   - Ensure proper role assignments

3. **Data Migration Issues**
   - Validate data format before migration
   - Check for duplicate entries
   - Verify foreign key relationships

### Debug Tools
- Use `http://localhost:3000/test-postgresql` for testing
- Check Supabase Dashboard for logs
- Use browser developer tools for API calls

## Benefits of PostgreSQL Migration

1. **Better Performance**: PostgreSQL is faster for complex queries
2. **ACID Compliance**: Full transaction support
3. **Advanced Queries**: SQL with joins, aggregations, etc.
4. **Better Analytics**: Built-in analytics and reporting
5. **Cost Effective**: More predictable pricing
6. **Scalability**: Better for large datasets
7. **Real-time**: Built-in real-time subscriptions

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Create database schema
3. ✅ Test connection
4. 🔄 Update authentication context
5. 🔄 Update all database operations
6. 🔄 Test all features
7. 🔄 Deploy to production

## Support

- Supabase Documentation: https://supabase.com/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Firebase Auth Documentation: https://firebase.google.com/docs/auth
