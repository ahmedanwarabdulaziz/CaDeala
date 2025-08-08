'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TestProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">User Profile Test</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile Picture Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Profile Picture</h2>
                <div className="flex items-center space-x-4">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-2xl">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Profile URL:</p>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                      {user.photoURL || 'Not available'}
                    </p>
                  </div>
                </div>
              </div>

              {/* User Info Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">User Information</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Display Name:</p>
                    <p className="text-lg">{user.displayName || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email:</p>
                    <p className="text-lg">{user.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Phone Number:</p>
                    <p className="text-lg">{user.phoneNumber || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">User Code:</p>
                    <p className="text-lg font-mono">{user.userCode}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Role:</p>
                    <p className="text-lg capitalize">{user.role}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Raw Data Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Raw User Data</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-700 overflow-x-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">How to Test:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Sign out and sign in with Google to see profile data</li>
                <li>• The profile picture should appear if available from Google</li>
                <li>• Phone number may not be available due to Google's privacy settings</li>
                <li>• Display name should come from Google account</li>
              </ul>
            </div>

            {/* Navigation */}
            <div className="mt-6 flex space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => router.push('/auth/login')}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Test Login Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 