'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminSetupPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const makeCurrentUserAdmin = async () => {
    if (!user) {
      setMessage('Please log in first');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      // Update the current user's role to admin
      await setDoc(doc(db, 'users', user.uid), {
        role: 'admin',
        updatedAt: serverTimestamp()
      }, { merge: true });

      setMessage('✅ Success! You are now an admin. Redirecting...');
      
      // Redirect to admin dashboard after a short delay
      setTimeout(() => {
        router.push('/admin');
      }, 2000);

    } catch (error) {
      console.error('Error making user admin:', error);
      setMessage('❌ Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Setup</h1>
          <p className="text-gray-600 mb-4">Please log in first to set up admin access.</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Setup</h1>
          <p className="text-gray-600 mb-6">
            Make your current account an admin to access the admin dashboard.
          </p>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Current User:</strong> {user.displayName || user.email}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Current Role:</strong> {user.role}
            </p>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-lg ${
              message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <button
            onClick={makeCurrentUserAdmin}
            disabled={loading || user.role === 'admin'}
            className={`w-full px-4 py-2 rounded-md text-white font-medium ${
              user.role === 'admin'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Setting up...' : user.role === 'admin' ? 'Already Admin' : 'Make Me Admin'}
          </button>

          <div className="mt-4">
            <button
              onClick={() => router.push('/admin')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Go to Admin Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 