'use client';

import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: AlertType;
  autoClose?: boolean;
  duration?: number;
}

const config: Record<AlertType, { icon: React.ReactNode; accent: string; bg: string; bar: string }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-white" />,
    accent: '#16a34a',
    bg: '#f0fdf4',
    bar: '#16a34a',
  },
  error: {
    icon: <AlertCircle className="h-5 w-5 text-white" />,
    accent: '#dc2626',
    bg: '#fef2f2',
    bar: '#dc2626',
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-white" />,
    accent: '#d97706',
    bg: '#fffbeb',
    bar: '#d97706',
  },
  info: {
    icon: <Info className="h-5 w-5 text-white" />,
    accent: '#1A1A1A',
    bg: '#f9fafb',
    bar: '#1A1A1A',
  },
};

export function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  autoClose = true,
  duration = 3000,
}: AlertDialogProps) {
  const progressRef = useRef<HTMLDivElement>(null);
  const { icon, accent, bg, bar } = config[type];

  const defaultTitle = type === 'success' ? 'Done' : type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Info';

  useEffect(() => {
    if (!isOpen || !autoClose) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [isOpen, autoClose, duration, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - subtle */}
          <motion.div
            className="fixed inset-0 z-[9998]"
            style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />

          {/* Toast-style dialog — top center */}
          <motion.div
            className="fixed top-6 left-1/2 z-[9999] w-full max-w-sm px-4"
            style={{ x: '-50%' }}
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            <div
              className="relative overflow-hidden rounded-xl shadow-2xl border border-gray-100"
              style={{ backgroundColor: bg }}
            >
              {/* Left accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: accent }} />

              {/* Content */}
              <div className="flex items-start gap-3 px-4 py-4 pl-5">
                {/* Icon circle */}
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
                  style={{ backgroundColor: accent }}
                >
                  {icon}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {title || defaultTitle}
                  </p>
                  <p className="text-sm text-gray-600 font-light mt-0.5 leading-snug">{message}</p>
                </div>

                {/* Close */}
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors mt-0.5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Auto-close progress bar */}
              {autoClose && (
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 rounded-b-xl"
                  style={{ backgroundColor: bar }}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: duration / 1000, ease: 'linear' }}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
