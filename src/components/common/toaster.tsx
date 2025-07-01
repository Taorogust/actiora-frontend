// src/components/common/toaster.tsx
import { createContext, useContext, ReactNode } from 'react';
import { Toaster, toast as sonnerToast, ToastOptions } from 'sonner';
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export type DPToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';
export type DPToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface DPToastOptions {
  duration?: number;
  position?: DPToastPosition;
  action?: { label: string; onClick: () => void };
}

export interface DPToastAPI {
  success(message: string, opts?: DPToastOptions): string | number;
  error(message: string, opts?: DPToastOptions): string | number;
  info(message: string, opts?: DPToastOptions): string | number;
  warning(message: string, opts?: DPToastOptions): string | number;
  loading(message: string, opts?: DPToastOptions): string | number;
  update(
    id: string,
    message: string,
    type: Exclude<DPToastType, 'loading'>,
    opts?: DPToastOptions
  ): void;
  dismissAll(): void;
}

const DPToastContext = createContext<DPToastAPI | null>(null);

export function useDPToast(): DPToastAPI {
  const ctx = useContext(DPToastContext);
  if (!ctx) throw new Error('useDPToast must be used within DPToasterProvider');
  return ctx;
}

export function DPToasterProvider({ children }: { children: ReactNode }) {
  const createToast =
    (type: DPToastType) =>
    (message: string, opts: DPToastOptions = {}) => {
      const {
        duration = type === 'loading' ? Infinity : 4000,
        position = 'top-right' as DPToastPosition,
        action,
      } = opts;

      const icon = {
        success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        error:   <XCircle      className="h-5 w-5 text-red-500" />,
        info:    <Info         className="h-5 w-5 text-blue-500" />,
        warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
        loading: <Loader2      className="h-5 w-5 animate-spin text-gray-600" />,
      }[type];

      return sonnerToast[type](message, {
        duration,
        position,
        action,
        icon,
        // ensure each toast is announced by screen readers
        ariaProps: { role: 'status', 'aria-live': 'polite' },
      });
    };

  const dpToast: DPToastAPI = {
    success: createToast('success'),
    error:   createToast('error'),
    info:    createToast('info'),
    warning: createToast('warning'),
    loading: createToast('loading'),
    update: (id, message, type, opts = {}) => {
      const {
        duration = 4000,
        position = 'top-right' as DPToastPosition,
        action,
      } = opts;
      const icon = {
        success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        error:   <XCircle      className="h-5 w-5 text-red-500" />,
        info:    <Info         className="h-5 w-5 text-blue-500" />,
        warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      }[type];

      sonnerToast[type](message, {
        id,
        duration,
        position,
        action,
        icon,
        ariaProps: { role: 'status', 'aria-live': 'polite' },
      });
    },
    dismissAll: () => {
      sonnerToast.dismiss();
    },
  };

  // Common toast styles and accessibility props
  const defaultToastOptions: ToastOptions = {
    style: {
      background:   'var(--dp-toast-bg, #ffffff)',
      color:        'var(--dp-toast-foreground, #1f2937)',
      border:       '1px solid var(--dp-toast-border, #e5e7eb)',
      boxShadow:    '0 2px 10px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      padding:      '12px 16px',
      fontSize:     '0.875rem',
      fontWeight:   500,
      display:      'flex',
      alignItems:   'center',
      gap:          '8px',
    },
    // ensure focusable and announced
    ariaProps: { role: 'status', 'aria-live': 'polite' },
  };

  return (
    <DPToastContext.Provider value={dpToast}>
      {children}
      <Toaster
        richColors
        toastOptions={defaultToastOptions}
      />
    </DPToastContext.Provider>
  );
}
