# Gift App

A professional gift card management platform built with Next.js and Firebase.

## Features

- **Multi-role Authentication**: Customer, Business, and Admin roles
- **Social Login**: Google and Apple sign-in
- **Role-based Access**: Different dashboards for each user type
- **Business Upgrade System**: Customers can request business upgrades
- **Unique User Codes**: Auto-generated codes for each role (CA, BA, AD)

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Deployment**: Vercel (recommended)

## Setup Instructions

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing project
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google (configure OAuth consent screen)
   - Enable Apple (configure Apple Developer account)
4. Enable Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Choose a location
5. Set up Security Rules:
   - Go to Firestore Database > Rules
   - Replace with the rules from `firestore.rules`

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### 4. Testing

Visit `http://localhost:3000/test-firebase` to test Firebase connectivity.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   └── forgot-password/ # Password reset
│   ├── admin/             # Admin dashboard
│   ├── business/          # Business dashboard
│   ├── customer/          # Customer dashboard
│   └── dashboard/         # Role-based redirect
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
├── lib/                   # Utility libraries
│   └── firebase.ts        # Firebase configuration
└── types/                 # TypeScript types
    └── auth.ts            # Authentication types
```

## User Roles

### Customer (Default)
- **Code Prefix**: CA
- **Features**: Browse gift cards, make purchases, request business upgrade
- **Dashboard**: `/customer`

### Business
- **Code Prefix**: BA
- **Features**: Create/manage gift cards, view analytics, manage business profile
- **Dashboard**: `/business`

### Admin
- **Code Prefix**: AD
- **Features**: Manage all users, approve business upgrades, system analytics
- **Dashboard**: `/admin`

## Authentication Flow

1. **Registration**: All users start as customers
2. **Login**: Redirected to role-specific dashboard
3. **Business Upgrade**: Customers can request upgrade via form
4. **Admin Approval**: Admins approve/reject business requests

## Development

### Adding New Features

1. Create new pages in appropriate directories
2. Update types in `src/types/`
3. Add Firebase security rules if needed
4. Test with different user roles

### Firebase Security Rules

The app includes comprehensive security rules in `firestore.rules`. Key features:

- Users can only access their own data
- Business owners can manage their gift cards
- Admins have full access
- Public read access for gift cards

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Make sure to add all Firebase configuration variables to your deployment platform.

## Troubleshooting

### Common Issues

1. **Firebase Connection Errors**: Check API keys and project settings
2. **Authentication Errors**: Verify sign-in providers are enabled
3. **Firestore Permission Errors**: Check security rules
4. **Build Errors**: Ensure all dependencies are installed

### Testing

- Use the test page at `/test-firebase` to verify connectivity
- Check browser console for detailed error messages
- Verify Firebase project settings match configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

This project is licensed under the MIT License.
