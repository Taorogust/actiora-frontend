import React, { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getTfaSchema, TfaSchemaType } from '../forms/tfa-schema';
import { useAuth } from '@/auth/context/auth-context';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import LoadingSpinner from '@/components/common/screen-loader';
import { motion } from 'framer-motion';
import QRCode from 'qrcode.react';

/**
 * Página para configurar la autenticación de dos factores (MFA):
 * - Genera y muestra un código QR
 * - Permite verificar el código TOTP
 * - Muestra códigos de respaldo
 */
export function Setup2FAPage() {
  const navigate = useNavigate();
  const { setupTfa, verifyTfa } = useAuth();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const inputsRef = useRef<HTMLInputElement[]>([]);

  // Generar datos MFA al montar
  useEffect(() => {
    (async () => {
      try {
        const { qrCodeUrl, secret, backupCodes } = await setupTfa();
        setQrCodeUrl(qrCodeUrl);
        setSecret(secret);
        setBackupCodes(backupCodes);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo generar la configuración MFA.'
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [setupTfa]);

  // Formulario de verificación de código MFA
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<TfaSchemaType>({
    resolver: zodResolver(getTfaSchema()),
    defaultValues: { code: '' },
    mode: 'onChange',
  });

  const onSubmit = async (data: TfaSchemaType) => {
    setError(null);
    setVerifying(true);
    try {
      await verifyTfa(data.code);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código incorrecto.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen bg-background p-6"
      >
        <Alert variant="destructive" aria-live="assertive">
          <AlertIcon />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-start min-h-screen bg-background p-6"
    >
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-foreground mb-4 text-center">
          Configurar Autenticación de Dos Factores
        </h2>

        <div className="flex flex-col items-center mb-6">
          <QRCode value={qrCodeUrl} size={160} />
          <p className="text-sm text-muted-foreground mt-2">
            Escanea este código con tu app de autenticación.
          </p>
          <p className="text-xs text-muted-foreground mt-1 break-all">
            O usa este código manualmente: <strong>{secret}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Ingresa el código de 6 dígitos generado por tu app.
            </p>
          </div>

          <Controller
            name="code"
            control={control}
            render={({ field }) => {
              const digits = (field.value || '').padEnd(6).split('');
              return (
                <div className="flex justify-center gap-2">
                  {digits.map((digit, idx) => (
                    <Input
                      key={idx}
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

          <Button type="submit" className="w-full" disabled={!isValid || verifying}>
            {verifying ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner className="h-5 w-5" /> Verificando...
              </span>
            ) : (
              'Verificar Código'
            )}
          </Button>

        </form>

        <div className="mt-6 text-center">
          <h4 className="text-sm font-medium mb-2">Códigos de respaldo</h4>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {backupCodes.map(code => (
              <li key={code} className="font-mono">
                {code}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            Guarda estos códigos en un lugar seguro. Cada uno solo puede usarse una vez.
          </p>
        </div>
      </div>
    </motion.main>
  );
}
