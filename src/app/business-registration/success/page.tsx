'use client';

import { useRouter } from 'next/navigation';
import { CheckCircleIcon, EnvelopeIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function BusinessRegistrationSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Application Submitted!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for your business registration application. We've received your submission and will review it shortly.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <ClockIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">What happens next?</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Our team will review your application within 2-3 business days. You'll receive an email notification once the review is complete.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <EnvelopeIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Email notifications</h3>
                <p className="mt-1 text-sm text-gray-600">
                  We'll send you updates about your application status via email. Please check your inbox regularly.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Application Status</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Application submitted</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                <span className="text-sm text-gray-500">Under review</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                <span className="text-sm text-gray-500">Approval decision</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={() => router.push('/customer')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Dashboard
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Homepage
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Have questions? Contact us at{' '}
            <a href="mailto:support@giftcardapp.com" className="text-blue-600 hover:text-blue-500">
              support@giftcardapp.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 