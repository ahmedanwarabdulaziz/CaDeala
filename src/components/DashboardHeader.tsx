'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState<string>('');

  useEffect(() => {
    if (user) {
      console.log('DashboardHeader: User role changed to:', user.role);
      setCurrentRole(user.role);
    }
  }, [user?.role]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) return null;

  console.log('DashboardHeader user data:', {
    photoURL: user.photoURL,
    displayName: user.displayName,
    email: user.email,
    role: user.role,
    currentRole: currentRole
  });

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Gift App</h1>
            <span className="ml-4 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
              {user.role}
            </span>
          </div>

          {/* Right side - User Profile */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="flex items-center space-x-3">
              {/* Profile Picture */}
              {user.photoURL ? (
                <div className="relative">
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover"
                    onError={(e) => {
                      console.error('Profile image failed to load:', user.photoURL);
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                    onLoad={() => {
                      console.log('Profile image loaded successfully:', user.photoURL);
                    }}
                  />
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center absolute top-0 left-0" style={{display: 'none'}}>
                    <span className="text-gray-500 text-sm font-medium">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm font-medium">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                  </span>
                </div>
              )}
              
              {/* User Details */}
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">
                  {user.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {user.email}
                </p>
              </div>
            </div>

            {/* User Code */}
            <div className="hidden sm:block">
              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {user.userCode}
              </span>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 