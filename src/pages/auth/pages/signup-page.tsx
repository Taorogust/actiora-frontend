import { useState } from 'react';
import { useAuth } from '@/auth/context/auth-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
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
import { Eye, EyeOff, LoaderCircleIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '@/assets/logo.png';
import { getSignupSchema, SignupSchemaType } from '../forms/signup-schema';
import Captcha from '@/components/ui/captcha';

export function SignUpPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<SignupSchemaType>({
    resolver: zodResolver(getSignupSchema()),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      emailConfirm: '',
      password: '',
      confirmPassword: '',
      terms: false,
      captchaToken: '',
    },
    mode: 'onChange',
  });

  async function onSubmit(values: SignupSchemaType) {
    try {
      setIsProcessing(true);
      setError(null);

      await register(
        values.email,
        values.password,
        values.confirmPassword,
        values.firstName,
        values.lastName,
      );

      setSuccessMessage('¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.');
      form.reset();
      setTimeout(() => navigate('/auth/signin'), 3000);
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen bg-background"
    >
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg">
        <img src={logo} alt="Logotipo Empresa" className="mx-auto mb-6 h-12 w-auto" />

        <Form {...form}>
          <motion.form
            onSubmit={form.handleSubmit(onSubmit)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-5"
          >
            <div className="text-center space-y-1 pb-3">
              <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
              <p className="text-sm text-muted-foreground">Completa el formulario para empezar</p>
            </div>

            {error && (
              <Alert variant="destructive" appearance="light" onClose={() => setError(null)} aria-live="assertive">
                <AlertIcon />
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            )}
            {successMessage && (
              <Alert appearance="light" onClose={() => setSuccessMessage(null)} aria-live="polite">
                <AlertIcon />
                <AlertTitle>{successMessage}</AlertTitle>
              </Alert>
            )}

            {/* Name fields */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl><Input placeholder="Tu nombre" {...field} className="focus:ring-2 focus:ring-brand-400" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellidos</FormLabel>
                  <FormControl><Input placeholder="Tus apellidos" {...field} className="focus:ring-2 focus:ring-brand-400" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email fields */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl><Input type="email" placeholder="tu@ejemplo.com" {...field} className="focus:ring-2 focus:ring-brand-400" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="emailConfirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar correo</FormLabel>
                  <FormControl><Input type="email" placeholder="Repite tu correo" {...field} className="focus:ring-2 focus:ring-brand-400" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password fields */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <div className="relative">
                    <Input placeholder="Crea una contraseña" type={passwordVisible ? 'text' : 'password'} {...field} className="focus:ring-2 focus:ring-brand-400" />
                    <Button type="button" variant="ghost" mode="icon" aria-label={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setPasswordVisible(!passwordVisible)} className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent">
                      {passwordVisible ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar contraseña</FormLabel>
                  <div className="relative">
                    <Input placeholder="Repite tu contraseña" type={confirmPasswordVisible ? 'text' : 'password'} {...field} className="focus:ring-2 focus:ring-brand-400" />
                    <Button type="button" variant="ghost" mode="icon" aria-label={confirmPasswordVisible ? 'Ocultar confirmación' : 'Mostrar confirmación'} onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)} className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent">
                      {confirmPasswordVisible ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Terms */}
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <FormLabel className="text-sm cursor-pointer">Acepto los <Link to="/legal/terms" className="font-semibold hover:underline">Términos y condiciones</Link></FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Captcha */}
            <FormField
              control={form.control}
              name="captchaToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verificación</FormLabel>
                  <FormControl><Captcha onVerify={(token: string) => field.onChange(token)} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isProcessing || !form.formState.isValid}>
              {isProcessing ? <span className="flex items-center gap-2"><LoaderCircleIcon className="h-4 w-4 animate-spin" /> Registrando...</span> : 'Crear cuenta'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta? <Link to="/auth/signin" className="font-semibold hover:text-primary">Inicia sesión</Link>
            </div>
          </motion.form>
        </Form>

        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <LoaderCircleIcon className="h-12 w-12 animate-spin text-white" />
          </div>
        )}
      </div>
    </motion.div>
  );
}