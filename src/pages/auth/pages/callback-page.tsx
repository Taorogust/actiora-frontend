import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/auth/context/auth-context';
import { supabase } from '@/lib/supabase';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/common/LoadingSpinner';

/**
 * Callback page for handling OAuth redirects.
 */
export function CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { saveAuth } = useAuth();
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const errorDesc = searchParams.get('error_description');
    if (errorParam) {
      const msg = errorDesc || 'Error de autenticación';
      setErrorMessage(msg);
      setStatus('error');
      setTimeout(() => {
        navigate(
          `/auth/signin?error=${errorParam}&error_description=${encodeURIComponent(
            msg
          )}`
        );
      }, 2000);
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          throw error || new Error('No se estableció la sesión');
        }
        const { access_token, refresh_token } = data.session;
        saveAuth({ access_token, refresh_token });
        setStatus('success');
        const next = searchParams.get('next') || '/';
        setTimeout(() => navigate(next), 1000);
      } catch (err) {
        console.error('OAuth Callback Error:', err);
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Error inesperado durante la autenticación'
        );
        setStatus('error');
        setTimeout(() => {
          navigate(
            '/auth/signin?error=auth_callback_error&error_description=' +
              encodeURIComponent('Falló la autenticación')
          );
        }, 2000);
      }
    })();
  }, [navigate, searchParams, saveAuth]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center"
    >
      {status === 'loading' && (
        <div className="flex flex-col items-center">
          <LoadingSpinner className="h-12 w-12 mb-4" />
          <p className="text-sm text-muted-foreground">Procesando autenticación...</p>
        </div>
      )}

      {status === 'error' && (
        <Alert variant="destructive" aria-live="assertive" className="max-w-md">
          <AlertIcon />
          <AlertTitle>{errorMessage}</AlertTitle>
          <p className="text-sm mt-2">Serás redirigido al inicio de sesión.</p>
        </Alert>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 120 }}
          >
            <LoadingSpinner className="h-12 w-12 text-green-500" />
          </motion.div>
          <p className="text-sm text-muted-foreground mt-2">Autenticación exitosa</p>
          <Button
            variant="outline"
            onClick={() => {
              const next = searchParams.get('next') || '/';
              navigate(next);
            }}
            className="mt-4"
          >
            Continuar
          </Button>
        </div>
      )}
    </motion.div>
  );
}
