'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { AlertDialog, AlertType } from '@/components/ui/alert-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { setGlobalAlertCallback } from '@/lib/alert';
import { setGlobalConfirmCallback } from '@/lib/confirm';

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
};

export function AlertProvider({ children }: { children: React.ReactNode }) {
  // Alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<AlertType>('info');

  // Confirm state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions>({ message: '' });
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const showAlert = useCallback((msg: string, type: AlertType) => {
    setAlertMessage(msg);
    setAlertType(type);
    setAlertOpen(true);
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions, resolve: (value: boolean) => void) => {
    setConfirmOptions(options);
    resolveRef.current = resolve;
    setConfirmOpen(true);
  }, []);

  useEffect(() => {
    setGlobalAlertCallback(showAlert);
    setGlobalConfirmCallback(showConfirm);
  }, [showAlert, showConfirm]);

  const handleConfirm = () => {
    setConfirmOpen(false);
    resolveRef.current?.(true);
    resolveRef.current = null;
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    resolveRef.current?.(false);
    resolveRef.current = null;
  };

  return (
    <>
      {children}
      <AlertDialog
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        message={alertMessage}
        type={alertType}
      />
      <ConfirmDialog
        isOpen={confirmOpen}
        title={confirmOptions.title}
        message={confirmOptions.message}
        confirmLabel={confirmOptions.confirmLabel}
        cancelLabel={confirmOptions.cancelLabel}
        variant={confirmOptions.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
