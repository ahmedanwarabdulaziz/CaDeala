'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DebugProfilePage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const testGoogleSignIn = async () => {
    try {
      setTestResult({ status: 'Testing Google sign-in...' });
      await signInWithGoogle();
      setTestResult({ status: 'Google sign-in completed' });
    } catch (error: any) {
      setTestResult({ status: 'Error', error: error.message });
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Debug Page</h1>
            
            {/* Test Google Sign-in */}
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">Test Google Sign-in</h2>
              <button
                onClick={testGoogleSignIn}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-sm font-medium"
              >
                Test Google Sign-in Again
              </button>
              {testResult && (
                <div className="mt-4 p-3 bg-white rounded border">
                  <p className="text-sm font-medium">Status: {testResult.status}</p>
                  {testResult.error && (
                    <p className="text-sm text-red-600">Error: {testResult.error}</p>
                  )}
                </div>
              )}
            </div>

            {/* Current User Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Current User Data</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Photo URL:</p>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
                      {user.photoURL || 'null'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Display Name:</p>
                    <p className="text-lg">{user.displayName || 'null'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email:</p>
                    <p className="text-lg">{user.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">Role:</p>
                    <p className="text-lg capitalize">{user.role}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600">User Code:</p>
                    <p className="text-lg font-mono">{user.userCode}</p>
                  </div>
                </div>
              </div>

              {/* Profile Picture Test */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Profile Picture Test</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Large Test Image:</p>
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="Profile Test" 
                        className="w-32 h-32 rounded-full border-4 border-gray-200 object-cover"
                        onError={(e) => {
                          console.error('Large image failed to load:', user.photoURL);
                          const target = e.target as HTMLImageElement;
                          target.style.border = '4px solid red';
                          target.style.backgroundColor = 'red';
                        }}
                        onLoad={() => {
                          console.log('Large image loaded successfully:', user.photoURL);
                        }}
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-4xl font-medium">
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Header Size Test:</p>
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="Header Test" 
                        className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover"
                        onError={(e) => {
                          console.error('Header image failed to load:', user.photoURL);
                          const target = e.target as HTMLImageElement;
                          target.style.border = '2px solid red';
                          target.style.backgroundColor = 'red';
                        }}
                        onLoad={() => {
                          console.log('Header image loaded successfully:', user.photoURL);
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm font-medium">
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Raw Data */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Raw User Data</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-700 overflow-x-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-6 flex space-x-4">
              <button
                onClick={() => router.push('/customer')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Go to Customer Dashboard
              </button>
              <button
                onClick={() => router.push('/auth/login')}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 