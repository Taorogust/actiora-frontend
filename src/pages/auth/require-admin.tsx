import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScreenLoader } from '@/components/common/screen-loader';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/auth/context/auth-context';

export const RequireAdmin = () => {
  const { user, loading, auth } = useAuth();

  // Mostrar loader si aún no sabemos si está autenticado o cargando
  if (loading || !auth?.access_token) {
    return <ScreenLoader />;
  }

  // Si no es admin, mostrar “Acceso denegado” y enlace de vuelta
  if (!user?.roles?.includes('admin')) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen bg-background p-6"
      >
        <Alert variant="destructive" appearance="light" aria-live="assertive" className="mb-4">
          <AlertIcon />
          <AlertTitle>Acceso denegado</AlertTitle>
        </Alert>
        <Button asChild>
          <a href="/dashboard">Volver al panel</a>
        </Button>
      </motion.div>
    );
  }

  // Si es admin, renderizar las rutas hijas
  return <Outlet />;
};
