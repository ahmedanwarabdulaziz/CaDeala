'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PostgreSQLService } from '@/lib/postgresql';
import BusinessRegistrationModal from '@/components/BusinessRegistrationModal';
import {
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function CustomerPage() {
  const { user } = useAuth();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBusinessModal, setShowBusinessModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Check if user has a business application
      const applicationData = await PostgreSQLService.getUserApplication(user?.uid);
      setApplication(applicationData);
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.displayName || 'Customer'}!</h1>
              <p className="text-gray-600">Customer Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              {!application && (
                <button 
                  onClick={() => setShowBusinessModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Upgrade to Business
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {application ? (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center mb-4">
              {application.status === 'pending' && (
                <ClockIcon className="h-8 w-8 text-yellow-500 mr-3" />
              )}
              {application.status === 'approved' && (
                <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
              )}
              {application.status === 'rejected' && (
                <XCircleIcon className="h-8 w-8 text-red-500 mr-3" />
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">Business Application Status</h2>
                <p className="text-gray-600">Application for: {application.business_name}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  application.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : application.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {application.status === 'pending' && 'Under Review'}
                  {application.status === 'approved' && 'Approved'}
                  {application.status === 'rejected' && 'Rejected'}
                </span>
              </div>

              {application.status === 'pending' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Application Under Review</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Your business application is currently being reviewed by our team. 
                        You'll receive an email notification once a decision has been made.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {application.status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <XCircleIcon className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Application Rejected</h3>
                      <p className="text-sm text-red-700 mt-1">
                        {application.admin_notes || 'Your business application was not approved at this time.'}
                      </p>
                      <button className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium">
                        Contact Support
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-600">
                <p><strong>Applied:</strong> {new Date(application.applied_at).toLocaleDateString()}</p>
                {application.reviewed_at && (
                  <p><strong>Reviewed:</strong> {new Date(application.reviewed_at).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="text-center">
              <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to CaDeala!</h2>
              <p className="text-gray-600 mb-6">
                Discover amazing deals and gift cards from local businesses in your area.
              </p>
              <div className="flex justify-center space-x-4">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                  Browse Gift Cards
                </button>
                <button 
                  onClick={() => setShowBusinessModal(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
                >
                  Upgrade to Business
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Customer Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">My Gift Cards</h3>
            <p className="text-gray-600 mb-4">View and manage your purchased gift cards.</p>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              View Cards →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">My Points</h3>
            <p className="text-gray-600 mb-4">Track your loyalty points and rewards.</p>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              View Points →
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Purchase History</h3>
            <p className="text-gray-600 mb-4">See your past gift card purchases.</p>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              View History →
            </button>
          </div>
        </div>
      </div>

      {/* Business Registration Modal */}
      <BusinessRegistrationModal 
        isOpen={showBusinessModal}
        onClose={() => setShowBusinessModal(false)}
      />
    </div>
  );
} 