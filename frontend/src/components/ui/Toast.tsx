import { createContext, useContext, useState, type ReactNode } from 'react';
import './Toast.css';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  exiting: boolean;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'i',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  function dismiss(id: string) {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 300);
  }

  function showToast(message: string, type: ToastType = 'info') {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => dismiss(id), 3500);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="false">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast toast--${toast.type}${toast.exiting ? ' toast--exiting' : ''}`}
            role="alert"
          >
            <span className="toast__icon">{ICONS[toast.type]}</span>
            <span className="toast__message">{toast.message}</span>
            <button
              className="toast__close"
              onClick={() => dismiss(toast.id)}
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
