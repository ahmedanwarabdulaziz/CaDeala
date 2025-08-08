// Admin and Business Management Types

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  bannerImage: string;
  roundedImage: string;
  squareImage: string;
  cardImage: string;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // admin uid
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  bannerImage: string;
  roundedImage: string;
  squareImage: string;
  cardImage: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface SubSubcategory {
  id: string;
  categoryId: string;
  subcategoryId: string;
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  bannerImage: string;
  roundedImage: string;
  squareImage: string;
  cardImage: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface BusinessApplication {
  id: string;
  userId: string; // Customer who applied
  userEmail: string;
  userName: string;
  businessName: string;
  businessType: string;
  industry: string;
  description: string;
  yearEstablished: number;
  website: string;
  businessPhone: string;
  businessEmail: string;
  
  // Contact Information
  contactName: string;
  contactTitle: string;
  contactPhone: string;
  contactEmail: string;
  alternativeContact: string;
  
  // Location Information
  locationName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  businessHours: {
    open: string;
    close: string;
  };
  hasMultipleLocations: boolean;
  
  // Categories
  primaryCategory: string;
  subcategories: string[];
  additionalCategories: string[];
  
  // Business Details
  employeeCount: string;
  revenueRange: string;
  targetCustomers: string[];
  specializations: string[];
  
  // Verification Documents
  licenseNumber: string;
  taxId: string;
  documents: {
    registrationCertificate?: string;
    businessLicense?: string;
    taxCertificate?: string;
  };
  
  // Marketing
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
  businessPhotos: string[];
  logo?: string;
  
  // Terms
  termsAccepted: boolean;
  privacyAccepted: boolean;
  dataConsentAccepted: boolean;
  
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  appliedAt: Date;
  reviewedBy?: string; // admin uid
  reviewedAt?: Date;
}

export interface BusinessLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Business {
  id: string;
  applicationId: string; // Reference to original application
  businessName: string;
  categoryId: string;
  subcategoryId?: string;
  subSubcategoryId?: string;
  description: string;
  logo: string;
  bannerImage: string;
  squareImage: string;
  isActive: boolean;
  isVerified: boolean;
  verificationDate?: Date;
  verifiedBy?: string; // admin uid
  createdAt: Date;
  updatedAt: Date;
  
  // Location data
  locations: BusinessLocation[];
  
  // Rating system
  averageRating: number;
  totalReviews: number;
}

export interface Review {
  id: string;
  businessId: string;
  userId: string;
  rating: number; // 1-5 stars
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean; // Customer made a purchase
}

export interface AdminStats {
  totalUsers: number;
  totalBusinesses: number;
  pendingApplications: number;
  totalCategories: number;
  totalReviews: number;
  recentActivity: {
    type: 'application' | 'review' | 'business' | 'category';
    id: string;
    title: string;
    timestamp: Date;
  }[];
} 