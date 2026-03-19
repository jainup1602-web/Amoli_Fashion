import { AlertType } from '@/components/ui/alert-dialog';

// Global alert state management
type AlertCallback = (message: string, type: AlertType) => void;

let globalAlertCallback: AlertCallback | null = null;

export function setGlobalAlertCallback(callback: AlertCallback) {
  globalAlertCallback = callback;
}

export function showAlert(message: string, type: AlertType = 'info') {
  if (globalAlertCallback) {
    globalAlertCallback(message, type);
  } else {
    // Fallback to native alert if callback not set
    alert(message);
  }
}

// Convenience methods
export const alertSuccess = (message: string) => showAlert(message, 'success');
export const alertError = (message: string) => showAlert(message, 'error');
export const alertWarning = (message: string) => showAlert(message, 'warning');
export const alertInfo = (message: string) => showAlert(message, 'info');
