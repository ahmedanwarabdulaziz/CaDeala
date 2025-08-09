'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PostgreSQLService, DatabaseBusinessRegistrationLink } from '@/lib/postgresql';
import { QrCodeIcon, UserIcon, EnvelopeIcon, PhoneIcon, CheckIcon } from '@heroicons/react/24/outline';

interface BusinessRegistrationPageProps {
  params: {
    code: string;
  };
}

export default function BusinessRegistrationPage({ params }: BusinessRegistrationPageProps) {
  const router = useRouter();
  const [registrationLink, setRegistrationLink] = useState<DatabaseBusinessRegistrationLink | null>(null);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadBusinessInfo();
  }, [params.code]);

  const loadBusinessInfo = async () => {
    try {
      setLoading(true);
      console.log('Loading business info for code:', params.code);
      
      const link = await PostgreSQLService.getBusinessRegistrationLinkByCode(params.code);
      console.log('Registration link result:', link);
      
      if (!link) {
        console.log('No registration link found for code:', params.code);
        setError('Invalid registration link');
        return;
      }

      setRegistrationLink(link);
      
      // Get business information by ID
      console.log('Getting business info for ID:', link.business_id);
      const businessData = await PostgreSQLService.getBusinessById(link.business_id);
      console.log('Business data result:', businessData);
      
      if (businessData) {
        setBusiness(businessData);
      } else {
        console.log('No business found for ID:', link.business_id);
        setError('Business not found');
      }
    } catch (error) {
      console.error('Error loading business info:', error);
      setError(`Error loading business information: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registrationLink || !business) return;

    try {
      setSubmitting(true);
      setError('');
      console.log('Submitting registration for:', formData);

      const result = await PostgreSQLService.registerCustomerThroughBusiness(
        business.id,
        {
          email: formData.email,
          name: formData.name,
          phone: formData.phone
        }
      );

      console.log('Registration successful:', result);
      
      if (result.isExisting) {
        setError('This email is already registered with this business. Please use a different email or contact the business owner.');
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      
      // Redirect to customer page instead of success page
      setTimeout(() => {
        router.push('/customer');
      }, 2000);

    } catch (error) {
      console.error('Error registering customer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Error registering. Please try again. Details: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading registration page...</p>
        </div>
      </div>
    );
  }

  if (error || !registrationLink || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <QrCodeIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Invalid Registration Link</h1>
          <p className="text-gray-600">{error || 'This registration link is not valid or has expired.'}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Registration Successful!</h1>
          <p className="text-gray-600">Welcome to {business.business_name}!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Business Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCodeIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to {business.business_name}
          </h1>
          <p className="text-gray-600">
            Register to earn points and rewards for your purchases!
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Registering...
                </div>
              ) : (
                'Register & Earn Points'
              )}
            </button>
          </form>

          {/* Benefits */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">What you'll get:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Points for every purchase</li>
              <li>• Exclusive rewards and discounts</li>
              <li>• Special offers and promotions</li>
              <li>• Loyalty program benefits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
