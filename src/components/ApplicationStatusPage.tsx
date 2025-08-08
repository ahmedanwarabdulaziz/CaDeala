'use client';

import { useState, useEffect } from 'react';
import { PostgreSQLService, DatabaseBusinessApplication } from '@/lib/postgresql';
import { useAuth } from '@/contexts/AuthContext';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

interface ApplicationStatusPageProps {
  onBackToForm?: () => void;
}

export default function ApplicationStatusPage({ onBackToForm }: ApplicationStatusPageProps) {
  const { user } = useAuth();
  const [application, setApplication] = useState<DatabaseBusinessApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadUserApplication();
    }
  }, [user]);

  const loadUserApplication = async () => {
    try {
      setLoading(true);
      const userApplication = await PostgreSQLService.getUserApplication(user?.uid || '');
      
      if (userApplication) {
        setApplication(userApplication);
      } else {
        setError('No application found');
      }
    } catch (error) {
      console.error('Error loading application:', error);
      setError('Failed to load application status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-12 w-12 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-12 w-12 text-red-500" />;
      case 'pending':
        return <ClockIcon className="h-12 w-12 text-yellow-500" />;
      default:
        return <ClockIcon className="h-12 w-12 text-gray-500" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          title: 'Application Approved!',
          message: 'Congratulations! Your business upgrade has been approved. You can now access business features and start managing your gift card business.',
          color: 'text-green-600'
        };
      case 'rejected':
        return {
          title: 'Application Not Approved',
          message: 'We regret to inform you that your business upgrade application was not approved at this time. Please contact our support team for more information.',
          color: 'text-red-600'
        };
      case 'pending':
        return {
          title: 'Application Under Review',
          message: 'Your business upgrade application is currently under review. We will notify you once the review process is complete. This typically takes 2-3 business days.',
          color: 'text-yellow-600'
        };
      default:
        return {
          title: 'Application Status',
          message: 'Your application is being processed.',
          color: 'text-gray-600'
        };
    }
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Business Application Support Request');
    const body = encodeURIComponent(
      `Hello,\n\nI need assistance with my business application.\n\n` +
      `Business Name: ${application?.business_name}\n` +
      `Application Status: ${application?.status}\n` +
      `Application Date: ${application?.applied_at ? new Date(application.applied_at).toLocaleDateString() : 'N/A'}\n\n` +
      `Please provide any additional details about your inquiry below:\n\n`
    );
    
    window.open(`mailto:support@giftcardapp.com?subject=${subject}&body=${body}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your application status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          {onBackToForm && (
            <button
              onClick={onBackToForm}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Application Form
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Application Found</h1>
          <p className="text-gray-600 mb-4">You don't have any business upgrade applications.</p>
          {onBackToForm && (
            <button
              onClick={onBackToForm}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply for Business Upgrade
            </button>
          )}
        </div>
      </div>
    );
  }

  const statusInfo = getStatusMessage(application.status);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {getStatusIcon(application.status)}
          </div>
          <h1 className={`text-3xl font-bold ${statusInfo.color} mb-2`}>
            {statusInfo.title}
          </h1>
          <p className="text-gray-600 text-lg">
            {statusInfo.message}
          </p>
        </div>

        {/* Application Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-gray-700">Business Name:</span>
              <p className="text-gray-900">{application.business_name}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Applicant:</span>
              <p className="text-gray-900">{application.user_name}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Application Date:</span>
              <p className="text-gray-900">
                {new Date(application.applied_at).toLocaleDateString()}
              </p>
            </div>
            {application.reviewed_at && (
              <div>
                <span className="font-medium text-gray-700">Review Date:</span>
                <p className="text-gray-900">
                  {new Date(application.reviewed_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="text-center mb-6">
          <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${
            application.status === 'approved' ? 'bg-green-100 text-green-800' :
            application.status === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            Status: {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {application.status === 'rejected' && (
            <button
              onClick={handleContactSupport}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <EnvelopeIcon className="h-5 w-5 mr-2" />
              Contact Support
            </button>
          )}
          
          {onBackToForm && application.status === 'rejected' && (
            <button
              onClick={onBackToForm}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Apply Again
            </button>
          )}
        </div>

        {/* Additional Information */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              Need help? Contact our support team at{' '}
              <a 
                href="mailto:support@giftcardapp.com" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                support@giftcardapp.com
              </a>
            </p>
            <p>
              For urgent matters, please include your business name and application date in your email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
