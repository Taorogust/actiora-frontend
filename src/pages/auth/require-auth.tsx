// src/pages/auth/require-auth.tsx
import { useEffect, useRef, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScreenLoader } from '@/components/common/screen-loader';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from './context/auth-context';

/**
 * Guardián de rutas protegidas:
 * - Comprueba sesión / SSO
 * - Redirige a setup de MFA si es necesario
 * - Redirige a panel admin según rol
 * - Muestra loaders, errores y animaciones
 */
export const RequireAuth = () => {
  const { auth, verify, user, loading: globalLoading } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const verificationStarted = useRef(false);

  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      if (!verificationStarted.current) {
        verificationStarted.current = true;
        try {
          await verify();
        } catch {
          if (mounted) {
            setError('Error al verificar la sesión. Por favor, inténtalo de nuevo.');
          }
        } finally {
          if (mounted) setLoading(false);
        }
      } else {
        if (mounted) setLoading(false);
      }
    };
    checkAuth();
    return () => {
      mounted = false;
    };
  }, [verify]);

  // Mostrar loader mientras se verifica o hay carga global
  if (loading || globalLoading) {
    return <ScreenLoader />;
  }

  // Error en la verificación: alerta y botón para reintentar
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen bg-background p-6"
      >
        <Alert
          variant="destructive"
          appearance="light"
          aria-live="assertive"
          className="mb-4"
        >
          <AlertIcon />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
        <Button
          onClick={() => {
            setError(null);
            setLoading(true);
            verificationStarted.current = false;
          }}
        >
          Reintentar
        </Button>
      </motion.div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!auth?.access_token) {
    return (
      <Navigate
        to={`/auth/signin?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // Si no ha configurado MFA, redirigir a setup-2fa
  if (user && !user.mfaEnabled) {
    return (
      <Navigate
        to="/auth/setup-2fa"
        replace
        state={{ from: location }}
      />
    );
  }

  // Si es admin, redirigir al panel de administración
  if (user?.roles?.includes('admin')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Usuario autenticado sin rol admin: renderizar rutas hijas
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background"
    >
      <Outlet />
    </motion.div>
  );
};
