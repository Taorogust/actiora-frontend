import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toAbsoluteUrl } from '@/lib/helpers';
import { useSettings } from '@/providers/settings-provider';
import { Button } from '@/components/ui/button';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';

/**
 * Página que solicita verificar el email tras registro,
 * con animaciones, ilustración y opciones de reenvío.
 */
export function CheckEmail() {
  const { settings } = useSettings();
  const [email, setEmail] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmail(params.get('email') || 'tu correo');
  }, []);

  const homePath = settings?.layout === 'auth-branded' ? '/' : '/';
  const resendPath = settings?.layout === 'auth-branded' ? '/auth/signup' : '/auth/classic/signup';

  return (
    <motion.main
      role="main"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen bg-background p-6"
    >
      <motion.img
        src={toAbsoluteUrl('/media/illustrations/30.svg')}
        alt="Verifica tu correo"
        className="dark:hidden h-32 mb-6"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
      />
      <motion.img
        src={toAbsoluteUrl('/media/illustrations/30-dark.svg')}
        alt="Verifica tu correo (modo oscuro)"
        className="light:hidden h-32 mb-6"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
      />

      <h2 className="text-2xl font-semibold text-foreground mb-2">Revisa tu correo</h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Has recibido un enlace de verificación en{' '}
        <span className="font-medium text-foreground" aria-live="polite">
          {email}
        </span>
        . Sigue el enlace para completar tu registro.
      </p>

      <Button asChild className="w-full max-w-xs mb-4">
        <Link to={homePath} className="block text-center">
          Volver al inicio
        </Link>
      </Button>

      <div className="flex items-center justify-center gap-2">
        <Alert appearance="light" className="flex-1" aria-live="off">
          <AlertIcon />
          <AlertTitle>¿No recibiste el correo?</AlertTitle>
        </Alert>
        <Button variant="outline" asChild className="font-semibold hover:underline">
          <Link to={resendPath}>Reenviar</Link>
        </Button>
      </div>
    </motion.main>
  );
}
