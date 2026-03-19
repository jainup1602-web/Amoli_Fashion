'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/account');
      return;
    }
    // Open register modal via custom event
    window.dispatchEvent(new CustomEvent('openRegisterModal'));
    router.replace('/');
  }, [isAuthenticated, router]);

  return null;
}
