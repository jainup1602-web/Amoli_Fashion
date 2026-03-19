'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/account');
      return;
    }
    // Open login modal via custom event (Header listens to this)
    window.dispatchEvent(new CustomEvent('openLoginModal'));
    router.replace('/');
  }, [isAuthenticated, router]);

  return null;
}
