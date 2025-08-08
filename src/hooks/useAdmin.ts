import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useAdmin() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // No user logged in, redirect to login
        router.push('/auth/login');
        return;
      }

      if (user.role !== 'admin') {
        // User is not admin, redirect to appropriate dashboard
        if (user.role === 'business') {
          router.push('/business');
        } else {
          router.push('/customer');
        }
        return;
      }

      // User is admin
      setIsAdmin(true);
      setAdminLoading(false);
    }
  }, [user, loading, router]);

  return {
    user,
    isAdmin,
    loading: loading || adminLoading
  };
} 