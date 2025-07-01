import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toAbsoluteUrl } from '@/lib/helpers';
import { useSettings } from '@/providers/settings-provider';
import { Button } from '@/components/ui/button';

/**
 * Página que informa de cambio exitoso de contraseña,
 * con ilustración, animaciones y navegación acorde al layout.
 */
export function ResetPasswordChanged() {
  const { settings } = useSettings();
  const signinPath = settings?.layout === 'auth-branded' ? '/auth/signin' : '/auth/classic/signin';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen bg-background p-6"
    >
      <div className="mb-6 text-center">
        <motion.img
          src={toAbsoluteUrl('/media/illustrations/32.svg')}
          alt="Éxito de restablecimiento de contraseña"
          className="dark:hidden mx-auto max-h-[180px] mb-4"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
        />
        <motion.img
          src={toAbsoluteUrl('/media/illustrations/32-dark.svg')}
          alt="Éxito de restablecimiento de contraseña (modo oscuro)"
          className="light:hidden mx-auto max-h-[180px] mb-4"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
        />

        <h3 className="text-2xl font-semibold text-foreground mb-2">
          Contraseña actualizada
        </h3>
        <p className="text-sm text-muted-foreground">
          Tu contraseña ha sido actualizada correctamente. Mantén segura tu cuenta.
        </p>
      </div>

      <Button className="w-full max-w-xs" asChild>
        <Link to={signinPath} className="w-full text-center">
          Iniciar sesión
        </Link>
      </Button>
    </motion.div>
  );
}
