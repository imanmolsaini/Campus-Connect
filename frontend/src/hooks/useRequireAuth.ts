'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export const useRequireAuth = (requireVerified: boolean = false) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (requireVerified && !user.verified) {
        router.push('/verify-email');
        return;
      }
    }
  }, [user, loading, requireVerified, router]);

  return { user, loading };
};
