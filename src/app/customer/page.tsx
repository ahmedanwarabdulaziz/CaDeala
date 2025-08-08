'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/DashboardHeader';
import ProfileDebug from '@/components/ProfileDebug';
import BusinessRegistrationModal from '@/components/BusinessRegistrationModal';

export default function CustomerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showBusinessModal, setShowBusinessModal] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, loading, router]);

  if (loading || !isAuthorized) {
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
      <DashboardHeader />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Dashboard</h2>
              <p className="text-gray-600 mb-4">Welcome to your gift card portal!</p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>• Browse and purchase gift cards</p>
                <p>• View your purchase history</p>
                <p>• Manage your profile and preferences</p>
                <p>• Request business upgrade</p>
              </div>
              
              {user?.role === 'customer' && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowBusinessModal(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md text-sm font-medium"
                  >
                    Upgrade to Business
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <ProfileDebug />
      
      {/* Business Registration Modal */}
      <BusinessRegistrationModal 
        isOpen={showBusinessModal}
        onClose={() => setShowBusinessModal(false)}
      />
    </div>
  );
} 