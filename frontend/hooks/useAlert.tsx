'use client';

import { useState, useCallback } from 'react';
import { AlertDialog, AlertType } from '@/components/ui/alert-dialog';

interface AlertOptions {
  title?: string;
  type?: AlertType;
  autoClose?: boolean;
  duration?: number;
}

export function useAlert() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [options, setOptions] = useState<AlertOptions>({});

  const showAlert = useCallback((msg: string, opts: AlertOptions = {}) => {
    setMessage(msg);
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const closeAlert = useCallback(() => {
    setIsOpen(false);
  }, []);

  const AlertComponent = useCallback(() => (
    <AlertDialog
      isOpen={isOpen}
      onClose={closeAlert}
      message={message}
      title={options.title}
      type={options.type}
      autoClose={options.autoClose}
      duration={options.duration}
    />
  ), [isOpen, closeAlert, message, options]);

  return {
    showAlert,
    closeAlert,
    AlertComponent,
  };
}
