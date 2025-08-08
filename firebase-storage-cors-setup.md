# Firebase Storage CORS Configuration

## Problem
You're getting a CORS error when trying to upload files to Firebase Storage:
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

## Solution
Configure CORS settings for your Firebase Storage bucket.

## Step-by-Step Instructions

### Option 1: Using Firebase CLI (Recommended)

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Set your project**:
   ```bash
   firebase use gift-card-north-via-marketing
   ```

4. **Apply CORS configuration**:
   ```bash
   gsutil cors set firebase-storage-cors-config.json gs://gift-card-north-via-marketing.appspot.com
   ```

### Option 2: Using Google Cloud Console

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com/
   - Select your project: `gift-card-north-via-marketing`

2. **Navigate to Cloud Storage**:
   - Go to "Storage" → "Browser"
   - Click on your bucket: `gift-card-north-via-marketing.appspot.com`

3. **Configure CORS**:
   - Click on the "Permissions" tab
   - Click "Edit CORS configuration"
   - Replace the existing configuration with:
   ```json
   [
     {
       "origin": ["http://localhost:3000", "https://gift-card-north-via-marketing.firebaseapp.com"],
       "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
       "maxAgeSeconds": 3600,
       "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "x-goog-*"]
     }
   ]
   ```
   - Click "Save"

### Option 3: Using gsutil command directly

If you have gsutil installed:

```bash
gsutil cors set firebase-storage-cors-config.json gs://gift-card-north-via-marketing.appspot.com
```

## Verify Configuration

After applying the CORS configuration, test the file upload again. The error should be resolved.

## Troubleshooting

If you still get CORS errors:

1. **Check bucket name**: Make sure you're using the correct bucket name from your Firebase config
2. **Wait a few minutes**: CORS changes can take a few minutes to propagate
3. **Clear browser cache**: Clear your browser cache and try again
4. **Check Firebase Storage Rules**: Ensure your storage rules allow uploads

## Firebase Storage Rules

Make sure your `storage.rules` file allows uploads:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload business application files
    match /business-applications/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to upload profile pictures
    match /user-profiles/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow public read access to categories and subcategories
    match /categories/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(firestore.default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /subcategories/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(firestore.default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Deploy Storage Rules

After updating the rules:

```bash
firebase deploy --only storage
``` 