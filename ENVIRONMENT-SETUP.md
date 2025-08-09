# Environment Variables Setup

## Required Environment Variables

To fix the registration link issue, you need to set the `NEXT_PUBLIC_APP_URL` environment variable.

### Step 1: Local Development

1. **Open your `.env.local` file** (create it if it doesn't exist)
2. **Add this line:**
   ```
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
   (or whatever port your app is running on, e.g., `http://localhost:3001`, `http://localhost:3002`)

### Step 2: Production (Vercel)

1. **Go to your Vercel dashboard**
2. **Select your project**
3. **Go to Settings > Environment Variables**
4. **Add a new variable:**
   - **Name:** `NEXT_PUBLIC_APP_URL`
   - **Value:** `https://your-app-domain.vercel.app` (replace with your actual domain)
   - **Environment:** Production (and Preview if needed)

### Step 3: Verify

After setting the environment variable:

1. **Restart your development server**
2. **Generate a new QR code** in your business dashboard
3. **The registration link should now work properly**

## Current Issue

The registration link is showing as `undefined/register/business/BR_73ad09b6_1754740546920` because:

- `NEXT_PUBLIC_APP_URL` is not set
- The fallback URL is not being used properly

## Quick Fix

If you want to test immediately without setting environment variables:

1. **Update the fallback URL** in `src/lib/postgresql.ts` line 1127:
   ```typescript
   const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
   ```
   Change `3000` to whatever port your app is running on.

2. **Restart your development server**

## Testing the Registration Link

Once the environment variable is set:

1. **Go to your business dashboard**
2. **Generate a new QR code**
3. **Copy the registration link**
4. **Open it in a new browser tab**
5. **You should see the customer registration form**

The registration link should look like:
```
http://localhost:3000/register/business/BR_73ad09b6_1754740546920
```

Instead of:
```
undefined/register/business/BR_73ad09b6_1754740546920
```
