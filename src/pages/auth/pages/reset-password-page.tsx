import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Check, MoveLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoaderCircleIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  getResetRequestSchema,
  ResetRequestSchemaType,
} from '../forms/reset-password-schema';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ResetRequestSchemaType>({
    resolver: zodResolver(getResetRequestSchema()),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ResetRequestSchemaType) {
    try {
      setIsProcessing(true);
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(
        values.email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password/check-email?email=${encodeURIComponent(
            values.email,
          )}`,
        },
      );

      if (error) throw error;

      setSuccessMessage(
        `¡Listo! Se ha enviado un enlace de restablecimiento a ${values.email}.`,
      );
      form.reset();

      setTimeout(() => {
        navigate(
          `/auth/reset-password/check-email?email=${encodeURIComponent(
            values.email,
          )}`,
        );
      }, 2500);
    } catch (err) {
      console.error('Error al solicitar restablecimiento:', err);
      setError(
        err instanceof Error
          ? `Error: ${err.message}`
          : 'Ocurrió un error al solicitar el enlace. Por favor, inténtalo de nuevo.',
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-center min-h-screen bg-background p-4"
    >
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Restablecer contraseña</h1>
          <p className="text-sm text-muted-foreground">
            Introduce tu correo para recibir un enlace de restablecimiento.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" appearance="light" aria-live="assertive">
            <AlertIcon>
              <AlertCircle />
            </AlertIcon>
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}

        {successMessage && (
          <Alert appearance="light" aria-live="polite">
            <AlertIcon>
              <Check />
            </AlertIcon>
            <AlertTitle>{successMessage}</AlertTitle>
          </Alert>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="tu@ejemplo.com"
                      autoComplete="email"
                      className="focus:ring-2 focus:ring-brand-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <LoaderCircleIcon className="h-4 w-4 animate-spin" /> Enviando…
                </span>
              ) : (
                'Enviar enlace'
              )}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm">
          <Link
            to="/auth/signin"
            className="inline-flex items-center gap-2 font-semibold hover:underline"
          >
            <MoveLeft className="size-4 opacity-70" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
