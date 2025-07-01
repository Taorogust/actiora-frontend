// src/components/common/ErrorBoundary.tsx
import React, { ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSettings } from '@/providers/settings-provider';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback UI */
  fallback?: ReactNode;
  /** Callback when an error is caught */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  info: ErrorInfo | null;
}

/**
 * Core ErrorBoundary class without hooks.
 * Receives theme from wrapper.
 */
class ErrorBoundaryCore extends React.Component<ErrorBoundaryProps & { theme: string }, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps & { theme: string }) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info);
    this.setState({ info });
    this.props.onError?.(error, info);
    // Optionally report to external service
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, info: null });
  };

  render() {
    const { hasError, error, info } = this.state;
    const { fallback, theme } = this.props;

    if (hasError) {
      if (fallback) return <>{fallback}</>;

      return (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={
              `fixed inset-0 z-50 flex flex-col justify-center items-center p-6 ` +
              `bg-white ${theme === 'dark' ? 'dark:bg-gray-900' : ''} text-center`
            }
          >
            <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
              Oops! Algo salió mal.
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Lo sentimos, ocurrió un error inesperado.
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
              <Button onClick={this.handleReset} variant="solid">
                Reintentar
              </Button>
              <Button as={Link} to="/dashboard" variant="outline">
                Volver al inicio
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  const url = encodeURIComponent(window.location.href);
                  const body = encodeURIComponent(
                    `Error: ${error?.message}\n\nStacktrace:\n${error?.stack}`
                  );
                  window.open(
                    `https://github.com/dataport/dataport/issues/new?title=[BUG]&body=${body}%0APage:%20${url}`,
                    '_blank'
                  );
                }}
              >
                Reportar problema
              </Button>
            </div>
            {error && (
              <details className="text-left max-w-xl w-full text-sm text-gray-600 dark:text-gray-400">
                <summary className="cursor-pointer mb-2 font-semibold">
                  Mostrar detalles
                </summary>
                <pre className="whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-4 rounded">
                  {error.message}
                  {info?.componentStack && `\n\nComponent stack:\n${info.componentStack}`}
                </pre>
              </details>
            )}
          </motion.div>
        </AnimatePresence>
      );
    }
    return this.props.children;
  }
}

/**
 * Functional wrapper to inject theme via hook.
 */
const ErrorBoundary: React.FC<ErrorBoundaryProps> = props => {
  const {
    options: { theme },
  } = useSettings();
  return <ErrorBoundaryCore {...props} theme={theme} />;
};

export default ErrorBoundary;
