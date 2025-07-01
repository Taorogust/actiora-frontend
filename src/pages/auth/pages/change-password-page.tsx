import { useEffect, useState } from 'react';
import { useAuth } from '@/auth/context/auth-context';
import { getChangePasswordSchema, ChangePasswordSchemaType } from '../forms/change-password-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, LoaderCircleIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScreenLoader } from '@/components/common/screen-loader';

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { auth, verify } = useAuth();
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Extract token
  const token =
    searchParams.get('token') ||
    searchParams.get('code') ||
    searchParams.get('token_hash');

  // Verify auth state and token
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        await verify();
      } catch {
        // ignore
      } finally {
        if (mounted) setLoadingAuth(false);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, [verify]);

  // Form setup
  const form = useForm<ChangePasswordSchemaType>({
    resolver: zodResolver(getChangePasswordSchema()),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  async function onSubmit(values: ChangePasswordSchemaType) {
    try {
      setIsProcessing(true);
      setError(null);
      // Update password via supabase
      const { error: supError } = await supabase.auth.updateUser({
        password: values.newPassword,
      });
      if (supError) throw new Error(supError.message);
      setSuccessMessage('¡Contraseña actualizada correctamente!');
      form.reset();
      setTimeout(() => navigate('/auth/signin'), 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.'
      );
    } finally {
      setIsProcessing(false);
    }
  }

  // If loading auth or no token
  if (loadingAuth) return <ScreenLoader />;

  if (!token || !auth?.access_token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <h1 className="text-2xl font-semibold mb-4">Restablecer contraseña</h1>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Necesitas un enlace de restablecimiento válido para cambiar tu contraseña.
        </p>
        <Button className="w-full max-w-sm" asChild>
          <Link to="/auth/request-reset">Solicitar enlace de restablecimiento</Link>
        </Button>
        <Link
          to="/auth/signin"
          className="mt-4 text-sm text-primary hover:underline"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-background p-6"
    >
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="text-center">
              <h1 className="text-2xl font-semibold">Cambiar contraseña</h1>
              <p className="text-sm text-muted-foreground">
                Ingresa tu contraseña actual y define una nueva.
              </p>
            </div>

            {error && (
              <Alert variant="destructive" aria-live="assertive">
                <AlertIcon />
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            )}

            {successMessage && (
              <Alert appearance="light" aria-live="polite">
                <AlertIcon>
                  <Check className="text-green-600" />
                </AlertIcon>
                <AlertTitle>{successMessage}</AlertTitle>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña actual</FormLabel>
                  <Input
                    type="password"
                    placeholder="Contraseña actual"
                    autoComplete="current-password"
                    {...field}
                    className="focus:ring-2 focus:ring-brand-400"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva contraseña</FormLabel>
                  <div className="relative">
                    <Input
                      type={passwordVisible ? 'text' : 'password'}
                      placeholder="Nueva contraseña"
                      autoComplete="new-password"
                      {...field}
                      className="focus:ring-2 focus:ring-brand-400"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      mode="icon"
                      aria-label={
                        passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'
                      }
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    >
                      {passwordVisible ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar nueva contraseña</FormLabel>
                  <div className="relative">
                    <Input
                      type={confirmVisible ? 'text' : 'password'}
                      placeholder="Confirmar contraseña"
                      autoComplete="new-password"
                      {...field}
                      className="focus:ring-2 focus:ring-brand-400"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      mode="icon"
                      aria-label={
                        confirmVisible
                          ? 'Ocultar confirmación'
                          : 'Mostrar confirmación'
                      }
                      onClick={() => setConfirmVisible(!confirmVisible)}
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    >
                      {confirmVisible ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isProcessing}>
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                  Actualizando...
                </span>
              ) : (
                'Actualizar contraseña'
              )}
            </Button>

            <div className="text-center text-sm">
              <Link
                to="/auth/signin"
                className="font-semibold text-primary hover:underline"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </motion.div>
  );
}
