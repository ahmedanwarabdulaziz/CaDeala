# Firebase Troubleshooting Guide

## Common Issues and Solutions

### 1. "Failed to get document because the client is offline"

**Cause**: Firestore database is not enabled or not properly configured.

**Solution**:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `gift-card-north-via-marketing`
3. Click **"Firestore Database"** in the left sidebar
4. Click **"Create database"**
5. Choose **"Start in production mode"**
6. Select a location (choose closest to your users)
7. Click **"Done"**

### 2. "Permission denied" in Firestore

**Cause**: Security rules are blocking access.

**Solution**:
1. In Firestore Database, go to **"Rules"** tab
2. Replace with this temporary rule for testing:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
3. Click **"Publish"**

### 3. "Firebase connection failed"

**Cause**: API keys or project configuration issues.

**Solution**:
1. Check your Firebase config in `src/lib/firebase.ts`
2. Verify project ID matches: `gift-card-north-via-marketing`
3. Ensure all API keys are correct
4. Check if project is active in Firebase Console

### 4. Authentication not working

**Cause**: Authentication providers not enabled.

**Solution**:
1. Go to **Authentication** > **Sign-in method**
2. Enable **"Email/Password"**
3. For Google/Apple, follow the setup guide in `setup-firebase.md`

### 5. "User document does not exist in Firestore"

**Cause**: User registered but Firestore document not created.

**Solution**:
1. Check browser console for errors during registration
2. Verify Firestore is enabled
3. Check security rules allow write access
4. Try registering a new user

## Testing Steps

### Step 1: Test Firebase Connection
1. Visit `http://localhost:3000/test-firebase`
2. Click "Test Firebase Connection"
3. Check the logs for detailed information

### Step 2: Test User Registration
1. Visit `http://localhost:3000/auth/register`
2. Create a new account
3. Check browser console for errors
4. Verify user appears in Firebase Console > Authentication > Users

### Step 3: Test User Login
1. Visit `http://localhost:3000/auth/login`
2. Login with created account
3. Should redirect to customer dashboard

### Step 4: Check Firestore Data
1. Go to Firebase Console > Firestore Database > Data
2. Look for `users` collection
3. Verify user document exists with correct data

## Debug Information

### Browser Console
Check browser console (F12) for:
- Firebase initialization errors
- Authentication errors
- Firestore permission errors
- Network connectivity issues

### Firebase Console
Check Firebase Console for:
- Authentication > Users (should show registered users)
- Firestore Database > Data (should show user documents)
- Project settings > General (verify project ID)

### Network Tab
Check browser Network tab for:
- Failed requests to Firebase
- CORS errors
- Authentication token issues

## Quick Fix Checklist

- [ ] Firestore Database is created and enabled
- [ ] Authentication is enabled (Email/Password)
- [ ] Security rules allow read/write for testing
- [ ] Project ID matches in configuration
- [ ] API keys are correct
- [ ] Internet connection is stable
- [ ] No browser extensions blocking requests

## Emergency Fix

If nothing works, try this minimal configuration:

1. **Firestore Rules** (temporary for testing):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

2. **Authentication**: Enable only Email/Password for now

3. **Test**: Use the test page to verify connection

## Getting Help

1. Check the test page logs for specific error messages
2. Verify all steps in `setup-firebase.md`
3. Check browser console for detailed error information
4. Ensure Firebase project is active and not suspended 