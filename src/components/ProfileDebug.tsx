'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function ProfileDebug() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">Profile Debug</h3>
      <div className="space-y-1 text-xs">
        <p><strong>Photo URL:</strong> {user.photoURL || 'null'}</p>
        <p><strong>Display Name:</strong> {user.displayName || 'null'}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>User Code:</strong> {user.userCode}</p>
      </div>
      
      {user.photoURL && (
        <div className="mt-2">
          <p className="text-xs font-medium text-gray-700 mb-1">Profile Image Test:</p>
          <img 
            src={user.photoURL} 
            alt="Debug" 
            className="w-8 h-8 rounded-full border"
            onError={(e) => {
              console.error('Image failed to load:', user.photoURL);
              const target = e.target as HTMLImageElement;
              target.style.border = '2px solid red';
              target.style.backgroundColor = 'red';
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', user.photoURL);
            }}
          />
        </div>
      )}
    </div>
  );
} 