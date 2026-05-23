'use client';

import { AlertTriangle, Trash2, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const variantConfig = {
  danger: {
    Icon: Trash2,
    iconColor: '#dc2626',
    iconBg: '#fef2f2',
    confirmBg: '#1A1A1A',
    accentBar: '#dc2626',
  },
  warning: {
    Icon: AlertTriangle,
    iconColor: '#d97706',
    iconBg: '#fffbeb',
    confirmBg: '#1A1A1A',
    accentBar: '#d97706',
  },
  info: {
    Icon: Info,
    iconColor: '#1A1A1A',
    iconBg: '#f3f4f6',
    confirmBg: '#1A1A1A',
    accentBar: '#1A1A1A',
  },
};

export function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { Icon, iconColor, iconBg, confirmBg, accentBar } = variantConfig[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[9998] backdrop-blur-[2px]"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onCancel}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5 pointer-events-none">
            <motion.div
              className="bg-white w-full max-w-[320px] pointer-events-auto overflow-hidden"
              style={{ borderRadius: '4px' }}
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            >
              {/* Top accent line */}
              <div className="h-[3px] w-full" style={{ backgroundColor: accentBar }} />

              {/* Body */}
              <div className="px-5 pt-5 pb-4">
                {/* Icon row */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: iconBg }}
                  >
                    <Icon className="h-4 w-4" style={{ color: iconColor }} strokeWidth={1.8} />
                  </div>
                  <button
                    onClick={onCancel}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Title */}
                <p className="text-sm font-semibold text-[#1A1A1A] mb-1.5 leading-snug">
                  {title}
                </p>

                {/* Message */}
                <p className="text-xs text-gray-500 leading-relaxed font-light">
                  {message}
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100 mx-5" />

              {/* Actions */}
              <div className="flex items-center gap-2.5 px-5 py-4">
                <button
                  onClick={onCancel}
                  className="flex-1 py-2 text-xs font-medium tracking-wide text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                  style={{ borderRadius: '2px' }}
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 py-2 text-xs font-semibold tracking-wide text-white transition-all hover:opacity-85 active:scale-[0.98]"
                  style={{ backgroundColor: confirmBg, borderRadius: '2px' }}
                >
                  {confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
