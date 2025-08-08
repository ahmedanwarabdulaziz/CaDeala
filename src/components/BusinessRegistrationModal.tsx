'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PostgreSQLService } from '@/lib/postgresql';
import { FileUploadService } from '@/lib/file-upload';
import { DatabaseCategory, DatabaseSubcategory } from '@/lib/postgresql';
import ApplicationStatusPage from './ApplicationStatusPage';
import {
  BuildingOfficeIcon,
  UserIcon,
  MapPinIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CloudArrowUpIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface BusinessRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BusinessRegistrationData {
  // Business Information
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
    registrationCertificate: File | null;
    businessLicense: File | null;
    taxCertificate: File | null;
  };
  
  // Marketing
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
  businessPhotos: File[];
  logo: File | null;
  
  // Terms
  termsAccepted: boolean;
  privacyAccepted: boolean;
  dataConsentAccepted: boolean;
}

const businessTypes = [
  'Restaurant',
  'Retail Store',
  'Service Business',
  'Entertainment',
  'Health & Wellness',
  'Beauty & Spa',
  'Technology',
  'Education',
  'Automotive',
  'Real Estate',
  'Other'
];

const industries = [
  'Food & Beverage',
  'Fashion & Apparel',
  'Electronics',
  'Home & Garden',
  'Health & Fitness',
  'Beauty & Personal Care',
  'Entertainment & Recreation',
  'Professional Services',
  'Technology',
  'Education',
  'Automotive',
  'Real Estate',
  'Other'
];

const employeeCounts = [
  '1-5 employees',
  '6-10 employees',
  '11-25 employees',
  '26-50 employees',
  '50+ employees'
];

const revenueRanges = [
  'Under $50,000',
  '$50,000 - $100,000',
  '$100,000 - $500,000',
  '$500,000 - $1,000,000',
  '$1,000,000+'
];

const targetCustomers = [
  'Local',
  'Regional',
  'National',
  'International'
];

const countries = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'Germany',
  'France',
  'Other'
];

export default function BusinessRegistrationModal({ isOpen, onClose }: BusinessRegistrationModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<DatabaseCategory[]>([]);
  const [subcategories, setSubcategories] = useState<DatabaseSubcategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [checkingApplication, setCheckingApplication] = useState(true);
  
  const [formData, setFormData] = useState<BusinessRegistrationData>({
    businessName: '',
    businessType: '',
    industry: '',
    description: '',
    yearEstablished: new Date().getFullYear(),
    website: '',
    businessPhone: '',
    businessEmail: '',
    contactName: '',
    contactTitle: '',
    contactPhone: '',
    contactEmail: '',
    alternativeContact: '',
    locationName: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    businessHours: { open: '09:00', close: '17:00' },
    hasMultipleLocations: false,
    primaryCategory: '',
    subcategories: [],
    additionalCategories: [],
    employeeCount: '',
    revenueRange: '',
    targetCustomers: [],
    specializations: [],
    licenseNumber: '',
    taxId: '',
    documents: {
      registrationCertificate: null,
      businessLicense: null,
      taxCertificate: null,
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
    },
    businessPhotos: [],
    logo: null,
    termsAccepted: false,
    privacyAccepted: false,
    dataConsentAccepted: false,
  });

  useEffect(() => {
    if (isOpen && user) {
      checkExistingApplication();
    }
  }, [isOpen, user]);

  const checkExistingApplication = async () => {
    try {
      setCheckingApplication(true);
      const userApplication = await PostgreSQLService.getUserApplication(user?.uid || '');
      
      if (userApplication) {
        setExistingApplication(userApplication);
      } else {
        // No existing application, load categories for new form
        await loadCategories();
      }
    } catch (error) {
      console.error('Error checking existing application:', error);
      // If there's an error, still try to load categories
      await loadCategories();
    } finally {
      setCheckingApplication(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await PostgreSQLService.getCategories();
      setCategories(categoriesData);
      // For now, we'll use empty subcategories since we haven't implemented subcategory methods yet
      setSubcategories([]);
    } catch (error) {
      console.error('Error loading categories/subcategories:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => {
      const parentValue = prev[parent as keyof BusinessRegistrationData];
      const parentObject = typeof parentValue === 'object' && parentValue !== null ? parentValue : {};
      
      return {
        ...prev,
        [parent]: { ...parentObject, [field]: value }
      };
    });
  };

  const handleFileUpload = (field: string, file: File) => {
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [field]: file }
    }));
  };

  const handleMultipleFiles = (field: string, files: FileList) => {
    const fileArray = Array.from(files);
    setFormData(prev => ({ ...prev, [field]: fileArray }));
  };

  const removeFile = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: Array.isArray(prev[field as keyof BusinessRegistrationData]) 
        ? (prev[field as keyof BusinessRegistrationData] as any[]).filter((_: any, i: number) => i !== index)
        : prev[field as keyof BusinessRegistrationData]
    }));
  };

  const handleDocumentUpload = (field: string, file: File) => {
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [field]: file }
    }));
  };

  const removeDocument = (field: string) => {
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [field]: null }
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (step) {
      case 1:
        if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
        if (!formData.businessType) newErrors.businessType = 'Business type is required';
        if (!formData.industry) newErrors.industry = 'Industry is required';
        if (!formData.description.trim()) newErrors.description = 'Business description is required';
        if (!formData.yearEstablished) newErrors.yearEstablished = 'Year established is required';
        if (!formData.businessPhone.trim()) newErrors.businessPhone = 'Business phone is required';
        if (!formData.businessEmail.trim()) newErrors.businessEmail = 'Business email is required';
        if (formData.businessEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
          newErrors.businessEmail = 'Please enter a valid email address';
        }
        break;

      case 2:
        if (!formData.contactName.trim()) newErrors.contactName = 'Contact name is required';
        if (!formData.contactTitle.trim()) newErrors.contactTitle = 'Contact title is required';
        if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Contact phone is required';
        if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required';
        if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
          newErrors.contactEmail = 'Please enter a valid email address';
        }
        break;

      case 3:
        if (!formData.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
        if (!formData.country) newErrors.country = 'Country is required';
        if (!formData.primaryCategory) newErrors.primaryCategory = 'Primary category is required';
        break;

      case 4:
        if (!formData.employeeCount) newErrors.employeeCount = 'Employee count is required';
        if (!formData.revenueRange) newErrors.revenueRange = 'Revenue range is required';
        if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
        if (!formData.taxId.trim()) newErrors.taxId = 'Tax ID is required';
        if (!formData.documents.registrationCertificate) newErrors.registrationCertificate = 'Business registration certificate is required';
        if (!formData.documents.businessLicense) newErrors.businessLicense = 'Business license is required';
        if (!formData.documents.taxCertificate) newErrors.taxCertificate = 'Tax certificate is required';
        break;

      case 5:
        if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms and conditions';
        if (!formData.privacyAccepted) newErrors.privacyAccepted = 'You must accept the privacy policy';
        if (!formData.dataConsentAccepted) newErrors.dataConsentAccepted = 'You must accept data consent';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user || !validateStep(currentStep)) return;
    
    setLoading(true);
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Sync current user to PostgreSQL if they don't exist
      try {
        await PostgreSQLService.syncCurrentUser(user);
      } catch (syncError) {
        console.warn('Failed to sync user to PostgreSQL:', syncError);
        // Continue with application submission even if user sync fails
      }
      
      // Upload files first
      const uploadedData: any = { ...formData };
      let totalUploads = 0;
      let completedUploads = 0;
      
      // Count total files to upload
      if (formData.documents.registrationCertificate) totalUploads++;
      if (formData.documents.businessLicense) totalUploads++;
      if (formData.documents.taxCertificate) totalUploads++;
      if (formData.businessPhotos.length > 0) totalUploads += formData.businessPhotos.length;
      if (formData.logo) totalUploads++;
      
      // Upload documents
      if (formData.documents.registrationCertificate || 
          formData.documents.businessLicense || 
          formData.documents.taxCertificate) {
        setUploadProgress(10);
        const documentUrls = await FileUploadService.uploadBusinessDocuments(
          formData.documents,
          user.uid
        );
        // Convert camelCase to snake_case for PostgreSQL
        uploadedData.documents = {
          registration_certificate: documentUrls.registrationCertificate,
          business_license: documentUrls.businessLicense,
          tax_certificate: documentUrls.taxCertificate
        };
        completedUploads += Object.keys(documentUrls).length;
        setUploadProgress((completedUploads / totalUploads) * 100);
      }
      
      // Upload business photos
      if (formData.businessPhotos.length > 0) {
        setUploadProgress(40);
        const photoUrls = await FileUploadService.uploadBusinessPhotos(
          formData.businessPhotos,
          user.uid
        );
        uploadedData.businessPhotos = photoUrls;
        completedUploads += formData.businessPhotos.length;
        setUploadProgress((completedUploads / totalUploads) * 100);
      }
      
      // Upload logo
      if (formData.logo) {
        setUploadProgress(80);
        const logoUrl = await FileUploadService.uploadBusinessLogo(
          formData.logo,
          user.uid
        );
        uploadedData.logo = logoUrl;
        completedUploads++;
        setUploadProgress((completedUploads / totalUploads) * 100);
      }
      
      // Remove File objects from the data before saving to PostgreSQL
      delete uploadedData.documents.registrationCertificate;
      delete uploadedData.documents.businessLicense;
      delete uploadedData.documents.taxCertificate;
      
      setUploadProgress(90);
      
      // Format data for PostgreSQL schema
      const applicationData = {
        user_id: user.uid,
        user_email: user.email || '',
        user_name: user.displayName || '',
        business_name: uploadedData.businessName,
        business_type: uploadedData.businessType,
        industry: uploadedData.industry,
        description: uploadedData.description,
        year_established: uploadedData.yearEstablished,
        website: uploadedData.website,
        business_phone: uploadedData.businessPhone,
        business_email: uploadedData.businessEmail,
        contact_name: uploadedData.contactName,
        contact_title: uploadedData.contactTitle,
        contact_phone: uploadedData.contactPhone,
        contact_email: uploadedData.contactEmail,
        alternative_contact: uploadedData.alternativeContact,
        location_name: uploadedData.locationName,
        street_address: uploadedData.streetAddress,
        city: uploadedData.city,
        state: uploadedData.state,
        zip_code: uploadedData.zipCode,
        country: uploadedData.country,
        business_hours: uploadedData.businessHours,
        has_multiple_locations: uploadedData.hasMultipleLocations,
        primary_category: uploadedData.primaryCategory,
        subcategories: uploadedData.subcategories,
        additional_categories: uploadedData.additionalCategories,
        employee_count: uploadedData.employeeCount,
        revenue_range: uploadedData.revenueRange,
        target_customers: uploadedData.targetCustomers,
        specializations: uploadedData.specializations,
        license_number: uploadedData.licenseNumber,
        tax_id: uploadedData.taxId,
        documents: uploadedData.documents,
        social_media: uploadedData.socialMedia,
        business_photos: uploadedData.businessPhotos,
        logo: uploadedData.logo,
        terms_accepted: uploadedData.termsAccepted,
        privacy_accepted: uploadedData.privacyAccepted,
        data_consent_accepted: uploadedData.dataConsentAccepted,
        status: 'pending' as const
      };
      
      await PostgreSQLService.createBusinessApplication(applicationData);
      setUploadProgress(100);
      
      onClose();
      router.push('/business-registration/success');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application. Please try again.');
    } finally {
      setLoading(false);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h4 className="text-2xl font-bold text-gray-900 mb-2">Business Information</h4>
        <p className="text-gray-600">Tell us about your business</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Business Name *</label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            className={`mt-1 block w-full px-4 py-3 rounded-xl border-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 ${
              errors.businessName ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            placeholder="Enter your business name"
            required
          />
          {errors.businessName && <p className="mt-1 text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠</span>{errors.businessName}
          </p>}
        </div>
        
                 <div className="space-y-2">
           <label className="block text-sm font-semibold text-gray-700">Business Type *</label>
           <select
             value={formData.businessType}
             onChange={(e) => handleInputChange('businessType', e.target.value)}
             className={`mt-1 block w-full px-4 py-3 rounded-xl border-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 ${
               errors.businessType ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
             }`}
             required
           >
             <option value="">Select Business Type</option>
             {businessTypes.map(type => (
               <option key={type} value={type}>{type}</option>
             ))}
           </select>
           {errors.businessType && <p className="mt-1 text-sm text-red-600 flex items-center">
             <span className="mr-1">⚠</span>{errors.businessType}
           </p>}
         </div>
        
                 <div className="space-y-2">
           <label className="block text-sm font-semibold text-gray-700">Industry *</label>
           <select
             value={formData.industry}
             onChange={(e) => handleInputChange('industry', e.target.value)}
             className={`mt-1 block w-full px-4 py-3 rounded-xl border-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 ${
               errors.industry ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
             }`}
             required
           >
             <option value="">Select Industry</option>
             {industries.map(industry => (
               <option key={industry} value={industry}>{industry}</option>
             ))}
           </select>
           {errors.industry && <p className="mt-1 text-sm text-red-600 flex items-center">
             <span className="mr-1">⚠</span>{errors.industry}
           </p>}
         </div>
        
                 <div className="space-y-2">
           <label className="block text-sm font-semibold text-gray-700">Year Established *</label>
           <input
             type="number"
             value={formData.yearEstablished}
             onChange={(e) => handleInputChange('yearEstablished', parseInt(e.target.value))}
             min="1900"
             max={new Date().getFullYear()}
             className={`mt-1 block w-full px-4 py-3 rounded-xl border-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 ${
               errors.yearEstablished ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
             }`}
             placeholder="Enter year established"
             required
           />
           {errors.yearEstablished && <p className="mt-1 text-sm text-red-600 flex items-center">
             <span className="mr-1">⚠</span>{errors.yearEstablished}
           </p>}
         </div>
        
                 <div className="space-y-2">
           <label className="block text-sm font-semibold text-gray-700">Business Phone *</label>
           <input
             type="tel"
             value={formData.businessPhone}
             onChange={(e) => handleInputChange('businessPhone', e.target.value)}
             className={`mt-1 block w-full px-4 py-3 rounded-xl border-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 ${
               errors.businessPhone ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
             }`}
             placeholder="Enter business phone number"
             required
           />
           {errors.businessPhone && <p className="mt-1 text-sm text-red-600 flex items-center">
             <span className="mr-1">⚠</span>{errors.businessPhone}
           </p>}
         </div>
        
                 <div className="space-y-2">
           <label className="block text-sm font-semibold text-gray-700">Business Email *</label>
           <input
             type="email"
             value={formData.businessEmail}
             onChange={(e) => handleInputChange('businessEmail', e.target.value)}
             className={`mt-1 block w-full px-4 py-3 rounded-xl border-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 ${
               errors.businessEmail ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
             }`}
             placeholder="Enter business email address"
             required
           />
           {errors.businessEmail && <p className="mt-1 text-sm text-red-600 flex items-center">
             <span className="mr-1">⚠</span>{errors.businessEmail}
           </p>}
         </div>
        
                 <div className="md:col-span-2 space-y-2">
           <label className="block text-sm font-semibold text-gray-700">Website</label>
           <input
             type="url"
             value={formData.website}
             onChange={(e) => handleInputChange('website', e.target.value)}
             className="mt-1 block w-full px-4 py-3 rounded-xl border-2 border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 hover:border-gray-300"
             placeholder="https://www.yourbusiness.com"
           />
         </div>
        
                 <div className="md:col-span-2 space-y-2">
           <label className="block text-sm font-semibold text-gray-700">Business Description *</label>
           <textarea
             value={formData.description}
             onChange={(e) => handleInputChange('description', e.target.value)}
             rows={4}
             maxLength={500}
             className={`mt-1 block w-full px-4 py-3 rounded-xl border-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 ${
               errors.description ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
             }`}
             placeholder="Describe your business, services, and what makes you unique..."
             required
           />
           {errors.description && <p className="mt-1 text-sm text-red-600 flex items-center">
             <span className="mr-1">⚠</span>{errors.description}
           </p>}
           <p className="mt-1 text-sm text-gray-500">{formData.description.length}/500 characters</p>
         </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h4 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h4>
        <p className="text-gray-600">Tell us who to contact for business matters</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Contact Name *</label>
          <input
            type="text"
            value={formData.contactName}
            onChange={(e) => handleInputChange('contactName', e.target.value)}
            className={`mt-1 block w-full px-4 py-3 rounded-xl border-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 ${
              errors.contactName ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            placeholder="Enter contact person's full name"
            required
          />
          {errors.contactName && <p className="mt-1 text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠</span>{errors.contactName}
          </p>}
        </div>
        
                 <div className="space-y-2">
           <label className="block text-sm font-semibold text-gray-700">Position/Title *</label>
           <input
             type="text"
             value={formData.contactTitle}
             onChange={(e) => handleInputChange('contactTitle', e.target.value)}
             className={`mt-1 block w-full px-4 py-3 rounded-xl border-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 ${
               errors.contactTitle ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
             }`}
             placeholder="Enter contact person's position"
             required
           />
           {errors.contactTitle && <p className="mt-1 text-sm text-red-600 flex items-center">
             <span className="mr-1">⚠</span>{errors.contactTitle}
           </p>}
         </div>
        
                 <div className="space-y-2">
           <label className="block text-sm font-semibold text-gray-700">Contact Phone *</label>
           <input
             type="tel"
             value={formData.contactPhone}
             onChange={(e) => handleInputChange('contactPhone', e.target.value)}
             className={`mt-1 block w-full px-4 py-3 rounded-xl border-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 ${
               errors.contactPhone ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
             }`}
             placeholder="Enter contact phone number"
             required
           />
           {errors.contactPhone && <p className="mt-1 text-sm text-red-600 flex items-center">
             <span className="mr-1">⚠</span>{errors.contactPhone}
           </p>}
         </div>
        
                 <div className="space-y-2">
           <label className="block text-sm font-semibold text-gray-700">Contact Email *</label>
           <input
             type="email"
             value={formData.contactEmail}
             onChange={(e) => handleInputChange('contactEmail', e.target.value)}
             className={`mt-1 block w-full px-4 py-3 rounded-xl border-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 ${
               errors.contactEmail ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
             }`}
             placeholder="Enter contact email address"
             required
           />
           {errors.contactEmail && <p className="mt-1 text-sm text-red-600 flex items-center">
             <span className="mr-1">⚠</span>{errors.contactEmail}
           </p>}
         </div>
        
                 <div className="md:col-span-2 space-y-2">
           <label className="block text-sm font-semibold text-gray-700">Alternative Contact</label>
           <input
             type="text"
             value={formData.alternativeContact}
             onChange={(e) => handleInputChange('alternativeContact', e.target.value)}
             className="mt-1 block w-full px-4 py-3 rounded-xl border-2 border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 hover:border-gray-300"
             placeholder="Additional contact person or information"
           />
         </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h4 className="text-2xl font-bold text-gray-900 mb-2">Location & Categories</h4>
        <p className="text-gray-600">Where is your business located and what do you do?</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Location Name</label>
          <input
            type="text"
            value={formData.locationName}
            onChange={(e) => handleInputChange('locationName', e.target.value)}
            className="mt-1 block w-full px-4 py-3 rounded-xl border-2 border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 hover:border-gray-300"
            placeholder="e.g., Main Branch, Downtown Store"
          />
        </div>
        
                 <div className="space-y-2">
           <label className="block text-sm font-semibold text-gray-700">Country *</label>
           <select
             value={formData.country}
             onChange={(e) => handleInputChange('country', e.target.value)}
             className={`mt-1 block w-full px-4 py-3 rounded-xl border-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 ${
               errors.country ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
             }`}
             required
           >
             {countries.map(country => (
               <option key={country} value={country}>{country}</option>
             ))}
           </select>
           {errors.country && <p className="mt-1 text-sm text-red-600 flex items-center">
             <span className="mr-1">⚠</span>{errors.country}
           </p>}
         </div>
        
                 <div className="md:col-span-2 space-y-2">
           <label className="block text-sm font-semibold text-gray-700">Street Address *</label>
           <input
             type="text"
             value={formData.streetAddress}
             onChange={(e) => handleInputChange('streetAddress', e.target.value)}
             className={`mt-1 block w-full px-4 py-3 rounded-xl border-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 ${
               errors.streetAddress ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
             }`}
             placeholder="Enter street address"
             required
           />
           {errors.streetAddress && <p className="mt-1 text-sm text-red-600 flex items-center">
             <span className="mr-1">⚠</span>{errors.streetAddress}
           </p>}
         </div>
        
                 <div className="space-y-2">
           <label className="block text-sm font-semibold text-gray-700">City *</label>
           <input
             type="text"
             value={formData.city}
             onChange={(e) => handleInputChange('city', e.target.value)}
             className={`mt-1 block w-full px-4 py-3 rounded-xl border-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 ${
               errors.city ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
             }`}
             placeholder="Enter city"
             required
           />
           {errors.city && <p className="mt-1 text-sm text-red-600 flex items-center">
             <span className="mr-1">⚠</span>{errors.city}
           </p>}
         </div>
        
                 <div className="space-y-2">
           <label className="block text-sm font-semibold text-gray-700">State/Province *</label>
           <input
             type="text"
             value={formData.state}
             onChange={(e) => handleInputChange('state', e.target.value)}
             className={`mt-1 block w-full px-4 py-3 rounded-xl border-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 ${
               errors.state ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
             }`}
             placeholder="Enter state or province"
             required
           />
           {errors.state && <p className="mt-1 text-sm text-red-600 flex items-center">
             <span className="mr-1">⚠</span>{errors.state}
           </p>}
         </div>
        
                 <div className="space-y-2">
           <label className="block text-sm font-semibold text-gray-700">ZIP/Postal Code *</label>
           <input
             type="text"
             value={formData.zipCode}
             onChange={(e) => handleInputChange('zipCode', e.target.value)}
             className={`mt-1 block w-full px-4 py-3 rounded-xl border-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 ${
               errors.zipCode ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
             }`}
             placeholder="Enter ZIP or postal code"
             required
           />
           {errors.zipCode && <p className="mt-1 text-sm text-red-600 flex items-center">
             <span className="mr-1">⚠</span>{errors.zipCode}
           </p>}
         </div>
        
                 <div className="md:col-span-2 space-y-2">
           <label className="block text-sm font-semibold text-gray-700">Primary Category *</label>
           <select
             value={formData.primaryCategory}
             onChange={(e) => handleInputChange('primaryCategory', e.target.value)}
             className={`mt-1 block w-full px-4 py-3 rounded-xl border-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 ${
               errors.primaryCategory ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
             }`}
             required
           >
             <option value="">Select Primary Category</option>
             {categories.map(category => (
               <option key={category.id} value={category.id}>{category.name}</option>
             ))}
           </select>
           {errors.primaryCategory && <p className="mt-1 text-sm text-red-600 flex items-center">
             <span className="mr-1">⚠</span>{errors.primaryCategory}
           </p>}
         </div>
        
                 <div className="md:col-span-2 space-y-2">
           <label className="block text-sm font-semibold text-gray-700">Subcategories</label>
           <select
             multiple
             value={formData.subcategories}
             onChange={(e) => {
               const selected = Array.from(e.target.selectedOptions, option => option.value);
               handleInputChange('subcategories', selected);
             }}
             className="mt-1 block w-full px-4 py-3 rounded-xl border-2 border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 hover:border-gray-300"
           >
             {subcategories.map(subcategory => (
               <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>
             ))}
           </select>
           <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple</p>
         </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h4 className="text-2xl font-bold text-gray-900 mb-2">Business Details & Verification</h4>
        <p className="text-gray-600">Complete your business profile and upload required documents</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Employee Count *</label>
          <select
            value={formData.employeeCount}
            onChange={(e) => handleInputChange('employeeCount', e.target.value)}
            className={`mt-1 block w-full px-4 py-3 rounded-xl border-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 ${
              errors.employeeCount ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            required
          >
            <option value="">Select Employee Count</option>
            {employeeCounts.map(count => (
              <option key={count} value={count}>{count}</option>
            ))}
          </select>
          {errors.employeeCount && <p className="mt-1 text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠</span>{errors.employeeCount}
          </p>}
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Revenue Range *</label>
          <select
            value={formData.revenueRange}
            onChange={(e) => handleInputChange('revenueRange', e.target.value)}
            className={`mt-1 block w-full px-4 py-3 rounded-xl border-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 ${
              errors.revenueRange ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            required
          >
            <option value="">Select Revenue Range</option>
            {revenueRanges.map(range => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
          {errors.revenueRange && <p className="mt-1 text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠</span>{errors.revenueRange}
          </p>}
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">License Number *</label>
          <input
            type="text"
            value={formData.licenseNumber}
            onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
            className={`mt-1 block w-full px-4 py-3 rounded-xl border-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 ${
              errors.licenseNumber ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            placeholder="Enter your business license number"
            required
          />
          {errors.licenseNumber && <p className="mt-1 text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠</span>{errors.licenseNumber}
          </p>}
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Tax ID *</label>
          <input
            type="text"
            value={formData.taxId}
            onChange={(e) => handleInputChange('taxId', e.target.value)}
            className={`mt-1 block w-full px-4 py-3 rounded-xl border-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 ${
              errors.taxId ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            placeholder="Enter your tax identification number"
            required
          />
          {errors.taxId && <p className="mt-1 text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠</span>{errors.taxId}
          </p>}
        </div>
        
        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Specializations</label>
          <textarea
            value={formData.specializations.join(', ')}
            onChange={(e) => handleInputChange('specializations', e.target.value.split(', ').filter(s => s.trim()))}
            rows={3}
            className="mt-1 block w-full px-4 py-3 rounded-xl border-2 border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 hover:border-gray-300"
            placeholder="Enter your business specializations separated by commas"
          />
        </div>
      </div>

      {/* Document Upload Section */}
      <div className="mt-8">
        <h5 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Registration Certificate */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Business Registration Certificate *
            </label>
            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-200 ${
              errors.registrationCertificate ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
            }`}>
              {formData.documents.registrationCertificate ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <DocumentTextIcon className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-600">{formData.documents.registrationCertificate.name}</p>
                  <button
                    type="button"
                    onClick={() => removeDocument('registrationCertificate')}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <CloudArrowUpIcon className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Upload registration certificate</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => e.target.files?.[0] && handleDocumentUpload('registrationCertificate', e.target.files[0])}
                    className="hidden"
                    id="registrationCertificate"
                  />
                  <label
                    htmlFor="registrationCertificate"
                    className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer"
                  >
                    Choose File
                  </label>
                </div>
              )}
            </div>
            {errors.registrationCertificate && <p className="mt-1 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠</span>{errors.registrationCertificate}
            </p>}
          </div>

          {/* Business License */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Business License *
            </label>
            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-200 ${
              errors.businessLicense ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
            }`}>
              {formData.documents.businessLicense ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <DocumentTextIcon className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-600">{formData.documents.businessLicense.name}</p>
                  <button
                    type="button"
                    onClick={() => removeDocument('businessLicense')}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <CloudArrowUpIcon className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Upload business license</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => e.target.files?.[0] && handleDocumentUpload('businessLicense', e.target.files[0])}
                    className="hidden"
                    id="businessLicense"
                  />
                  <label
                    htmlFor="businessLicense"
                    className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer"
                  >
                    Choose File
                  </label>
                </div>
              )}
            </div>
            {errors.businessLicense && <p className="mt-1 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠</span>{errors.businessLicense}
            </p>}
          </div>

          {/* Tax Certificate */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Tax Certificate *
            </label>
            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-200 ${
              errors.taxCertificate ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400'
            }`}>
              {formData.documents.taxCertificate ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <DocumentTextIcon className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-600">{formData.documents.taxCertificate.name}</p>
                  <button
                    type="button"
                    onClick={() => removeDocument('taxCertificate')}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <CloudArrowUpIcon className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Upload tax certificate</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => e.target.files?.[0] && handleDocumentUpload('taxCertificate', e.target.files[0])}
                    className="hidden"
                    id="taxCertificate"
                  />
                  <label
                    htmlFor="taxCertificate"
                    className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer"
                  >
                    Choose File
                  </label>
                </div>
              )}
            </div>
            {errors.taxCertificate && <p className="mt-1 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠</span>{errors.taxCertificate}
            </p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h4 className="text-2xl font-bold text-gray-900 mb-2">Marketing & Terms</h4>
        <p className="text-gray-600">Connect your social media and accept our terms</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Facebook</label>
          <input
            type="url"
            value={formData.socialMedia.facebook}
            onChange={(e) => handleNestedChange('socialMedia', 'facebook', e.target.value)}
            className="mt-1 block w-full px-4 py-3 rounded-xl border-2 border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 hover:border-gray-300"
            placeholder="https://facebook.com/yourbusiness"
          />
        </div>
        
                 <div className="space-y-2">
           <label className="block text-sm font-semibold text-gray-700">Instagram</label>
           <input
             type="url"
             value={formData.socialMedia.instagram}
             onChange={(e) => handleNestedChange('socialMedia', 'instagram', e.target.value)}
             className="mt-1 block w-full px-4 py-3 rounded-xl border-2 border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 hover:border-gray-300"
             placeholder="https://instagram.com/yourbusiness"
           />
         </div>
        
                 <div className="space-y-2">
           <label className="block text-sm font-semibold text-gray-700">Twitter</label>
           <input
             type="url"
             value={formData.socialMedia.twitter}
             onChange={(e) => handleNestedChange('socialMedia', 'twitter', e.target.value)}
             className="mt-1 block w-full px-4 py-3 rounded-xl border-2 border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 hover:border-gray-300"
             placeholder="https://twitter.com/yourbusiness"
           />
         </div>
        
                 <div className="space-y-2">
           <label className="block text-sm font-semibold text-gray-700">LinkedIn</label>
           <input
             type="url"
             value={formData.socialMedia.linkedin}
             onChange={(e) => handleNestedChange('socialMedia', 'linkedin', e.target.value)}
             className="mt-1 block w-full px-4 py-3 rounded-xl border-2 border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all duration-200 hover:border-gray-300"
             placeholder="https://linkedin.com/company/yourbusiness"
           />
         </div>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Terms & Agreements</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
              className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
            />
            <label className="text-sm text-gray-700 leading-relaxed">
              I accept the <a href="#" className="text-blue-600 hover:text-blue-500 font-semibold underline">Terms and Conditions</a> *
            </label>
          </div>
          {errors.termsAccepted && <p className="mt-1 text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠</span>{errors.termsAccepted}
          </p>}
          
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={formData.privacyAccepted}
              onChange={(e) => handleInputChange('privacyAccepted', e.target.checked)}
              className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
            />
            <label className="text-sm text-gray-700 leading-relaxed">
              I accept the <a href="#" className="text-blue-600 hover:text-blue-500 font-semibold underline">Privacy Policy</a> *
            </label>
          </div>
          {errors.privacyAccepted && <p className="mt-1 text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠</span>{errors.privacyAccepted}
          </p>}
          
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={formData.dataConsentAccepted}
              onChange={(e) => handleInputChange('dataConsentAccepted', e.target.checked)}
              className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
            />
            <label className="text-sm text-gray-700 leading-relaxed">
              I consent to the processing of my data for business purposes *
            </label>
          </div>
          {errors.dataConsentAccepted && <p className="mt-1 text-sm text-red-600 flex items-center">
            <span className="mr-1">⚠</span>{errors.dataConsentAccepted}
          </p>}
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return renderStep1();
    }
  };

  if (!isOpen) return null;

  // If checking for existing application, show loading
  if (checkingApplication) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-8 border-0 w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-2xl rounded-2xl bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking your application status...</p>
          </div>
        </div>
      </div>
    );
  }

  // If there's an existing application, show the status page
  if (existingApplication) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-8 border-0 w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-2xl rounded-2xl bg-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Application Status</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Import and use ApplicationStatusPage component */}
          <div className="max-h-[70vh] overflow-y-auto">
            <ApplicationStatusPage onBackToForm={() => {
              setExistingApplication(null);
              setCheckingApplication(true);
              checkExistingApplication();
            }} />
          </div>
        </div>
      </div>
    );
  }

  // Show the normal registration form
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-8 border-0 w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-2xl rounded-2xl bg-gradient-to-br from-white to-gray-50">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Business Registration
              </h3>
              <p className="text-sm text-gray-600 mt-1">Step {currentStep} of 5 • Complete your business profile</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step <= currentStep 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-110' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step < currentStep ? <CheckCircleIcon className="h-6 w-6" /> : step}
                  </div>
                  {step < 5 && (
                    <div className={`w-20 h-2 mx-4 rounded-full transition-all duration-300 ${
                      step < currentStep ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              {renderStepContent()}
            </div>
          </div>

          {/* Enhanced Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                currentStep === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
              }`}
            >
              <ArrowLeftIcon className="h-4 w-4 inline mr-2" />
              Previous
            </button>
            
            <div>
              {currentStep < 5 ? (
                <button
                  onClick={nextStep}
                  className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Next
                  <ArrowRightIcon className="h-4 w-4 inline ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`px-8 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    loading
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {uploading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Submitting...'}
                    </div>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 