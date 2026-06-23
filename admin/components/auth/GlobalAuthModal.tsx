'use client';

import { useState, useEffect } from 'react';
import { AuthModal } from './AuthModal';

export function GlobalAuthModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('openLoginModal', handleOpen);
    
    return () => {
      window.removeEventListener('openLoginModal', handleOpen);
    };
  }, []);

  return (
    <AuthModal 
      isOpen={isOpen} 
      onClose={() => setIsOpen(false)} 
      initialMode="login" 
    />
  );
}
