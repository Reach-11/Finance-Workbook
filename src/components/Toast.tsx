import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />,
    warning: <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />,
    info: <Info className="h-4 w-4 text-blue-600 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-white text-slate-800',
    warning: 'border-amber-200 bg-white text-slate-800',
    info: 'border-blue-200 bg-white text-slate-800',
  };

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between gap-3 rounded-xl border p-3.5 shadow-lg backdrop-blur-xs transition-all animate-in fade-in slide-in-from-bottom-2 ${
        borders[toast.type]
      }`}
    >
      <div className="flex items-center gap-2.5 text-xs font-medium">
        {icons[toast.type]}
        <span>{toast.text}</span>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
