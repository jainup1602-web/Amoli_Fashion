// Global confirm dialog state management
type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
};

type ConfirmCallback = (options: ConfirmOptions, resolve: (value: boolean) => void) => void;

let globalConfirmCallback: ConfirmCallback | null = null;

export function setGlobalConfirmCallback(callback: ConfirmCallback) {
  globalConfirmCallback = callback;
}

export function showConfirm(options: ConfirmOptions): Promise<boolean> {
  if (globalConfirmCallback) {
    return new Promise((resolve) => {
      globalConfirmCallback!(options, resolve);
    });
  }
  // Fallback
  return Promise.resolve(window.confirm(options.message));
}

export const confirmDelete = (itemName?: string) =>
  showConfirm({
    title: 'Delete Confirmation',
    message: itemName ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.` : 'Are you sure you want to delete this item? This action cannot be undone.',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    variant: 'danger',
  });

export const confirmAction = (message: string, title?: string) =>
  showConfirm({ title: title || 'Confirm Action', message, confirmLabel: 'Confirm', cancelLabel: 'Cancel', variant: 'warning' });
