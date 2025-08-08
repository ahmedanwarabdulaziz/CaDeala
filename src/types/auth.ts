export type UserRole = 'customer' | 'business' | 'admin';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  role: UserRole;
  userCode: string;
  isEmailVerified: boolean;
  createdAt: Date;
  businessProfile?: {
    businessId: string;
    businessName: string;
    upgradeRequested: boolean;
    upgradeRequestDate?: Date;
  };
}

export interface BusinessUpgradeRequest {
  id: string;
  userId: string;
  userEmail: string;
  businessName: string;
  businessDescription: string;
  contactPhone: string;
  website?: string;
  requestDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
} 