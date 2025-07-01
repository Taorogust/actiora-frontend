import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toAbsoluteUrl } from '@/lib/helpers';
import { useSettings } from '@/providers/settings-provider';
import { Button } from '@/components/ui/button';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';

export function ResetPasswordCheckEmail() {
  const { settings } = useSettings();
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    const paramEmail = new URLSearchParams(window.location.search).get('email') || '';
    setEmail(paramEmail);
  }, []);

  const successPath =
    settings?.layout === 'auth-branded'
      ? '/auth/reset-password/changed'
      : '/auth/classic/reset-password/changed';
  const resendPath =
    settings?.layout === 'auth-branded'
      ? '/auth/reset-password/enter-email'
      : '/auth/classic/reset-password/enter-email';

  return (
    <motion.main
      role="main"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen bg-background p-6"
    >
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <div className="flex justify-center mb-6">
          <motion.img
            src={toAbsoluteUrl('/media/illustrations/30.svg')}
            alt="Correo enviado"
            className="dark:hidden h-32"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
          />
          <motion.img
            src={toAbsoluteUrl('/media/illustrations/30-dark.svg')}
            alt="Correo enviado (modo oscuro)"
            className="light:hidden h-32"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 120 }}
          />
        </div>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Revisa tu correo
          </h2>
          <p className="text-sm text-muted-foreground">
            Hemos enviado un enlace de restablecimiento a{' '}
            <span className="font-medium text-foreground" aria-live="polite">
              {email || 'tu correo'}
            </span>.
            Por favor, revisa tu bandeja de entrada y spam.
          </p>
        </div>

        <Button asChild className="w-full mb-4">
          <Link to={successPath} className="block text-center">
            Ir a la bandeja de entrada
          </Link>
        </Button>

        <div className="flex items-center justify-center text-sm gap-2">
          <Alert appearance="light" className="flex-1" aria-live="off">
            <AlertIcon />
            <AlertTitle>
              ¿No has recibido el correo?
            </AlertTitle>
          </Alert>
          <Button
            variant="ghost"
            asChild
            className="font-semibold hover:underline"
          >
            <Link to={resendPath}>Reenviar</Link>
          </Button>
        </div>
      </div>
    </motion.main>
  );
}
