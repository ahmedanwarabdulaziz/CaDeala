'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function TestNavigation() {
  const { user, signOut } = useAuth();

  return (
    <div className="bg-gray-800 text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="font-bold">CaDeala Test Navigation</span>
          <span className="text-sm text-gray-300">
            {user?.displayName || user?.email} ({user?.role || 'unknown'})
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-sm hover:text-gray-300">
            Home
          </Link>
          <Link href="/customer" className="text-sm hover:text-gray-300">
            Customer
          </Link>
          <Link href="/business/dashboard" className="text-sm hover:text-gray-300">
            Business Dashboard
          </Link>
          <Link href="/admin" className="text-sm hover:text-gray-300">
            Admin
          </Link>
          <Link href="/test-database-tables" className="text-sm hover:text-gray-300">
            Test DB
          </Link>
          <button 
            onClick={signOut}
            className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
