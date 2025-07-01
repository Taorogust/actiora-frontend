// src/modules/explainability/pages/ExplainDashboard.tsx
import React, { useEffect, useState, Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Container } from '@/components/common/container';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useExplanation } from '../hooks/useExplanation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Breadcrumbs } from '@/components/common/breadcrumbs';
import { toast } from 'sonner';

const schema = z.object({
  modelId: z.string().min(1, 'El ID del modelo es obligatorio'),
  inputJson: z
    .string()
    .min(2, 'El JSON no puede estar vacío')
    .refine(
      str => {
        try { JSON.parse(str); return true; }
        catch { return false; }
      },
      'Debe ser un JSON válido'
    ),
});
type FormInputs = z.infer<typeof schema>;

const ExplanationViewer = React.lazy(() => import('../components/ExplanationViewer'));
const SHAPChart         = React.lazy(() => import('../components/SHAPChart'));

export default function ExplainDashboard() {
  const { explanations, isLoadingList, isErrorList, errorList, explain, isExplaining } = useExplanation();
  const [lastExp, setLastExp] = useState<{ id: string; modelId: string } | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>({
    resolver: zodResolver(schema),
    defaultValues: { modelId: '', inputJson: '{}' },
  });

  const onSubmit = async (vals: FormInputs) => {
    try {
      const input = JSON.parse(vals.inputJson);
      const exp = await explain({ modelId: vals.modelId, input });
      setLastExp({ id: exp.id, modelId: vals.modelId });
      toast.success('Explicación generada correctamente', {
        duration: 3000,
        role: 'status',
        ariaLive: 'polite',
      });
      reset({ modelId: vals.modelId, inputJson: '{}' });
    } catch (err: any) {
      toast.error(err?.message || 'Error generando explicación', {
        role: 'alert',
        ariaLive: 'assertive',
      });
    }
  };

  // Actualiza el título cuando llegue una nueva explicación
  useEffect(() => {
    if (lastExp) {
      document.title = `Explicación ${lastExp.id.slice(0,8)} · DataPort Wallet™`;
    }
  }, [lastExp]);

  if (isErrorList) {
    return (
      <Container className="py-6">
        <p className="text-red-600">Error cargando historial: {errorList?.message}</p>
      </Container>
    );
  }

  return (
    <Container className="space-y-8 py-6">
      <Helmet>
        <title>Dashboard de Explicaciones – DataPort Wallet™</title>
        <meta name="description" content="Genera y revisa explicaciones automáticas de tu modelo IA." />
      </Helmet>

      <Breadcrumbs
        items={[
          { label: 'Inicio', to: '/' },
          { label: 'Explicaciones', to: '/explainability' },
        ]}
        aria-label="Migas de pan"
      />

      <ErrorBoundary>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-gray-900 p-6 rounded-lg shadow"
          aria-label="Formulario para generar explicación IA"
          noValidate
        >
          <div>
            <label htmlFor="modelId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Modelo ID
            </label>
            <Input
              id="modelId"
              {...register('modelId')}
              placeholder="p.e. proyecto-xyz"
              aria-invalid={!!errors.modelId}
              className="mt-1"
            />
            {errors.modelId && (
              <p role="alert" className="mt-1 text-xs text-red-600">{errors.modelId.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="inputJson" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Input JSON
            </label>
            <Textarea
              id="inputJson"
              {...register('inputJson')}
              rows={5}
              className="mt-1 font-mono text-sm"
              aria-invalid={!!errors.inputJson}
            />
            {errors.inputJson && (
              <p role="alert" className="mt-1 text-xs text-red-600">{errors.inputJson.message}</p>
            )}
          </div>

          <div className="md:col-span-3 flex justify-end">
            <Button type="submit" variant="solid" disabled={isExplaining}>
              {isExplaining ? 'Generando…' : 'Generar Explicación'}
            </Button>
          </div>
        </form>
      </ErrorBoundary>

      {isLoadingList ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {explanations.map(exp => (
            <ErrorBoundary key={exp.id}>
              <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-48 rounded-lg" />}>
                <ExplanationViewer text={exp.text} />
              </Suspense>
              <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg mt-4" />}>
                <SHAPChart data={exp.chartData} />
              </Suspense>
            </ErrorBoundary>
          ))}
        </div>
      )}
    </Container>
  );
}
