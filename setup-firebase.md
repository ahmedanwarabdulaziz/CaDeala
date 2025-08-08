# Firebase Setup Guide

## Step 1: Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `gift-card-north-via-marketing`
3. Make sure you're in the correct project

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable the following providers:
   - **Email/Password**: Enable
   - **Google**: Enable (you'll need to configure OAuth consent screen)
   - **Apple**: Enable (requires Apple Developer account)

### For Google Sign-in:
1. Click on Google provider
2. Enable it
3. Add your domain to authorized domains
4. Configure OAuth consent screen in Google Cloud Console

### For Apple Sign-in:
1. Click on Apple provider
2. Enable it
3. You'll need an Apple Developer account to configure this

## Step 3: Enable Firestore Database

1. Go to **Firestore Database**
2. If not created, click "Create database"
3. Choose "Start in production mode"
4. Select a location (choose closest to your users)
5. Click "Done"

## Step 4: Set Up Security Rules

1. In Firestore Database, go to **Rules** tab
2. Replace the default rules with the content from `firestore.rules` file
3. Click "Publish"

## Step 5: Test the Connection

1. Visit `http://localhost:3000/test-firebase`
2. Click "Test Firebase Connection"
3. Check the status message

## Step 6: Create Test Users

### Create an Admin User (Manual Process)

1. Go to **Authentication** > **Users**
2. Click "Add user"
3. Enter email and password
4. Go to **Firestore Database** > **Data**
5. Create a document in `users` collection with ID matching the user's UID
6. Add the following fields:
   ```json
   {
     "email": "admin@example.com",
     "displayName": "Admin User",
     "role": "admin",
     "userCode": "AD000001",
     "isEmailVerified": true,
     "createdAt": "2024-01-01T00:00:00.000Z"
   }
   ```

## Step 7: Verify Configuration

1. Check that your Firebase config in `src/lib/firebase.ts` matches your project
2. Verify all environment variables are set correctly
3. Test registration and login flows

## Common Issues and Solutions

### Issue: "Firebase connection failed"
**Solution**: Check API keys and project settings

### Issue: "Permission denied" in Firestore
**Solution**: Update security rules in Firebase Console

### Issue: "Google sign-in not working"
**Solution**: 
1. Configure OAuth consent screen
2. Add authorized domains
3. Enable Google Sign-in API

### Issue: "Apple sign-in not working"
**Solution**: 
1. Requires Apple Developer account
2. Configure Apple Sign-in in Apple Developer Console
3. Add your domain to authorized domains

## Testing Checklist

- [ ] Firebase connection test passes
- [ ] User registration works
- [ ] Email/password login works
- [ ] Google sign-in works (if configured)
- [ ] Apple sign-in works (if configured)
- [ ] Role-based redirects work
- [ ] User data is saved to Firestore
- [ ] Security rules are working

## Next Steps

After completing this setup:

1. Test the authentication flow
2. Create the business upgrade request form
3. Build the gift card management features
4. Add admin dashboard functionality
5. Deploy to production

## Support

If you encounter issues:

1. Check browser console for detailed error messages
2. Verify Firebase project settings
3. Test with the `/test-firebase` page
4. Check Firebase Console logs 