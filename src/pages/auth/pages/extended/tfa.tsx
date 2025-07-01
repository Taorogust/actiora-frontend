import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getTfaSchema, TfaSchemaType } from '../forms/tfa-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { MoveLeft } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { motion } from 'framer-motion';
import { toAbsoluteUrl } from '@/lib/helpers';
import { useAuth } from '@/auth/context/auth-context';

export function TwoFactorAuth() {
  const navigate = useNavigate();
  const { verifyTfa, resendTfa } = useAuth();
  const [resendTimer, setResendTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for auto-focus
  const inputsRef = useRef<HTMLInputElement[]>([]);

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm<TfaSchemaType>({
    resolver: zodResolver(getTfaSchema()),
    defaultValues: { code: '' },
    mode: 'onChange',
  });

  // Countdown for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const onSubmit = async (data: TfaSchemaType) => {
    setSubmissionError(null);
    setIsSubmitting(true);
    try {
      await verifyTfa(data.code);
      navigate('/dashboard');
    } catch (err) {
      setSubmissionError(err instanceof Error ? err.message : 'Código incorrecto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setIsResending(true);
    try {
      await resendTfa();
      setResendTimer(60);
    } catch {
      // ignore or set error
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg"
    >
      <div className="flex flex-col items-center mb-6">
        <img
          src={toAbsoluteUrl('/media/illustrations/34.svg')}
          className="dark:hidden h-20 mb-4"
          alt="Ilustración 2FA"
        />
        <img
          src={toAbsoluteUrl('/media/illustrations/34-dark.svg')}
          className="light:hidden h-20 mb-4"
          alt="Ilustración 2FA"
        />
        <h3 className="text-xl font-semibold mb-2">Verifica tu cuenta</h3>
        <p className="text-sm text-muted-foreground text-center">
          Ingresa el código de 6 dígitos enviado a tu dispositivo.
        </p>
      </div>

      {submissionError && (
        <Alert variant="destructive" className="mb-4" aria-live="assertive">
          <AlertIcon />
          <AlertTitle>{submissionError}</AlertTitle>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Controller
          name="code"
          control={control}
          render={({ field }) => {
            const digits = (field.value || '').padEnd(6).split('').map((ch, i) => ch);
            return (
              <div className="flex justify-center gap-2">
                {digits.map((digit, idx) => (
                  <Input
                    key={idx}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/, '');
                      const next = [...digits];
                      next[idx] = val;
                      field.onChange(next.join(''));
                      if (val && idx < 5) inputsRef.current[idx + 1]?.focus();
                    }}
                    ref={el => (inputsRef.current[idx] = el!)}
                    className="w-12 h-12 text-center text-lg font-mono focus:ring-2 focus:ring-brand-400"
                  />
                ))}
              </div>
            );
          }}
        />
        {errors.code && (
          <p className="text-sm text-destructive text-center">
            {errors.code.message}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner className="h-5 w-5" /> Verificando...
            </span>
          ) : (
            'Continuar'
          )}
        </Button>

        <div className="flex justify-between text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendTimer > 0 || isResending}
            className="font-semibold hover:underline disabled:text-muted-foreground"
          >
            {isResending
              ? 'Reenviando…'
              : resendTimer > 0
              ? `Reenviar (${resendTimer}s)`
              : 'Reenviar código'}
          </button>
          <Link
            to="/auth/signin"
            className="flex items-center gap-1 font-semibold hover:underline"
          >
            <MoveLeft className="h-4 w-4 opacity-70" /> Volver
          </Link>
        </div>
      </form>
    </motion.div>
  );
}
