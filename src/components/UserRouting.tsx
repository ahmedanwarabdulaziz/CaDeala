'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PostgreSQLService } from '@/lib/postgresql';

export default function UserRouting() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [checkingBusiness, setCheckingBusiness] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    if (!loading && user) {
      checkUserAccess();
    } else if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading]);

  const checkUserAccess = async () => {
    if (!user) return;

    try {
      setCheckingBusiness(true);
      setDebugInfo('Checking user access...');

      // First, sync the user to PostgreSQL if they don't exist
      await PostgreSQLService.syncCurrentUser(user);
      setDebugInfo('User synced to PostgreSQL');

      // Check if user is admin
      if (user.role === 'admin') {
        setDebugInfo('User is admin, redirecting to admin');
        router.push('/admin');
        return;
      }

      // Check if user has an approved business
      const business = await PostgreSQLService.getBusinessByUserId(user.uid);
      setDebugInfo(`Business check result: ${business ? 'Found business' : 'No business found'}`);
      
      if (business) {
        // User has a business, update their role to 'business' if it's not already
        if (user.role !== 'business') {
          setDebugInfo('Updating user role to business');
          try {
            await PostgreSQLService.updateUser(user.uid, { role: 'business' });
            setDebugInfo('User role updated to business');
            // Refresh the user data to reflect the role change
            await refreshUser();
            setDebugInfo('User data refreshed, role should now be business');
          } catch (error) {
            console.error('Error updating user role:', error);
          }
        }
        
        // User has a business, redirect to business dashboard
        setDebugInfo('User has approved business, redirecting to business dashboard');
        router.push('/business/dashboard');
      } else {
        // Check if user has a pending business application
        const application = await PostgreSQLService.getUserApplication(user.uid);
        setDebugInfo(`Application check result: ${application ? `Found ${application.status} application` : 'No application found'}`);
        
        if (application && application.status === 'pending') {
          // User has a pending application, show customer page with pending status
          setDebugInfo('User has pending application, redirecting to customer page');
          router.push('/customer');
        } else if (application && application.status === 'rejected') {
          // User has a rejected application, show customer page
          setDebugInfo('User has rejected application, redirecting to customer page');
          router.push('/customer');
        } else {
          // User is a regular customer
          setDebugInfo('User is regular customer, redirecting to customer page');
          router.push('/customer');
        }
      }
    } catch (error) {
      console.error('Error checking user access:', error);
      setDebugInfo(`Error: ${error}`);
      // Fallback to customer page
      router.push('/customer');
    } finally {
      setCheckingBusiness(false);
    }
  };

  if (loading || checkingBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
          {debugInfo && (
            <p className="mt-2 text-sm text-gray-500">{debugInfo}</p>
          )}
        </div>
      </div>
    );
  }

  return null;
}
