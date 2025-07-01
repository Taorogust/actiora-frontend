// src/pages/auth/pages/signin-page.tsx
import { useEffect, useState } from 'react';
import { SupabaseAdapter } from '@/auth/adapters/supabase-adapter';
import { useAuth } from '@/auth/context/auth-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/common/icons';
import { getSigninSchema, SigninSchemaType } from '../forms/signin-schema';
import logo from '@/assets/logo.png';
import { LoaderCircleIcon, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export function SignInPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | 'facebook' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const pwdReset = searchParams.get('pwd_reset');
    const errorParam = searchParams.get('error');
    const errorDesc = searchParams.get('error_description');
    if (pwdReset === 'success') {
      setSuccessMessage('Tu contraseña ha sido restablecida correctamente.');
    }
    if (errorParam) {
      setError(
        errorDesc || 'Ha ocurrido un error en la autenticación. Por favor, inténtalo de nuevo.'
      );
    }
  }, [searchParams]);

  const form = useForm<SigninSchemaType>({
    resolver: zodResolver(getSigninSchema()),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  async function onSubmit(values: SigninSchemaType) {
    try {
      setIsProcessing(true);
      setError(null);
      await login(values.email, values.password);
      const nextPath = searchParams.get('next') || '/';
      navigate(nextPath);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error inesperado. Por favor, inténtalo de nuevo.'
      );
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleOAuthSignIn(provider: 'google' | 'github' | 'facebook') {
    try {
      setOauthLoading(provider);
      setError(null);
      await SupabaseAdapter.signInWithOAuth(provider);
      // browser will redirect
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `No se pudo iniciar sesión con ${provider}. Por favor, inténtalo de nuevo.`
      );
      setOauthLoading(null);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen bg-background"
    >
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg space-y-6">
        <img src={logo} alt="Logotipo Empresa" className="mx-auto h-12 w-auto" />

        <Form {...form}>
          <motion.form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center space-y-1 pb-3">
              <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
              <p className="text-sm text-muted-foreground">
                ¡Bienvenido de nuevo! Inicia sesión con tus credenciales.
              </p>
            </div>

            {error && (
              <Alert
                variant="destructive"
                appearance="light"
                onClose={() => setError(null)}
                aria-live="assertive"
              >
                <AlertIcon />
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            )}
            {successMessage && (
              <Alert appearance="light" onClose={() => setSuccessMessage(null)}>
                <AlertIcon />
                <AlertTitle>{successMessage}</AlertTitle>
              </Alert>
            )}

            {/* SSO Buttons */}
            <div className="flex flex-col gap-3">
              {(['google', 'github', 'facebook'] as const).map((prov) => (
                <Button
                  key={prov}
                  variant="outline"
                  type="button"
                  onClick={() => handleOAuthSignIn(prov)}
                  disabled={oauthLoading === prov}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {oauthLoading === prov ? (
                    <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icons[`${prov}Colorful` as keyof typeof Icons] className="h-5 w-5" />
                  )}
                  {oauthLoading === prov
                    ? `Iniciando con ${prov.charAt(0).toUpperCase() + prov.slice(1)}…`
                    : `Iniciar con ${prov.charAt(0).toUpperCase() + prov.slice(1)}`}
                </Button>
              ))}
            </div>

            <div className="relative py-1.5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">o</span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tu correo electrónico"
                      className="focus:ring-2 focus:ring-brand-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center gap-2.5">
                    <FormLabel>Contraseña</FormLabel>
                  </div>
                  <div className="relative">
                    <Input
                      placeholder="Tu contraseña"
                      type={passwordVisible ? 'text' : 'password'}
                      className="focus:ring-2 focus:ring-brand-400"
                      {...field}
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

            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      Recordar sesión
                    </FormLabel>
                  </FormItem>
                )}
              />
              <Link
                to="/auth/reset-password"
                className="text-sm font-semibold text-foreground hover:text-primary"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isProcessing}>
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <LoaderCircleIcon className="h-4 w-4 animate-spin" /> Cargando...
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <Link to="/auth/signup" className="font-semibold text-foreground hover:text-primary">
                Regístrate
              </Link>
            </div>
          </motion.form>
        </Form>
      </div>
    </motion.div>
  );
}
