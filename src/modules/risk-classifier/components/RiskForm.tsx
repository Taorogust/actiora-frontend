// src/modules/risk-classifier/components/RiskForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useModelInfo } from '../hooks/useModelInfo';
import { useRiskMetrics } from '../hooks/useRiskMetrics';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'react-toastify';

// 1. Schema Zod: O eliges existingModel, o rellenas todos los campos de nuevo modelo
const formSchema = z
  .object({
    selectedModel: z.string(),
    newName: z.string().optional(),
    newVersion: z.string().optional(),
    newOwner: z.string().optional(),
  })
  .refine(
    (data) =>
      !!data.selectedModel ||
      (!!data.newName && !!data.newVersion && !!data.newOwner),
    {
      message:
        'Debes seleccionar un modelo existente o rellenar todos los campos para crear uno nuevo',
      path: ['selectedModel'],
    }
  );

type FormValues = z.infer<typeof formSchema>;

// 2. Subcomponente para los campos de “nuevo modelo”
function NewModelFields({
  register,
  errors,
  disabled,
}: {
  register: ReturnType<typeof useForm<FormValues>>['register'];
  errors: ReturnType<typeof useForm<FormValues>>['formState']['errors'];
  disabled: boolean;
}) {
  return (
    <>
      <div>
        <label htmlFor="newName" className="sr-only">
          Nombre del modelo
        </label>
        <input
          id="newName"
          {...register('newName')}
          disabled={disabled}
          placeholder="Nombre del modelo"
          className="w-full border rounded px-3 py-2"
        />
        {errors.newName && (
          <p className="text-red-600 text-sm">{errors.newName.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="newVersion" className="sr-only">
          Versión
        </label>
        <input
          id="newVersion"
          {...register('newVersion')}
          disabled={disabled}
          placeholder="Versión"
          className="w-full border rounded px-3 py-2"
        />
        {errors.newVersion && (
          <p className="text-red-600 text-sm">{errors.newVersion.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="newOwner" className="sr-only">
          Propietario
        </label>
        <input
          id="newOwner"
          {...register('newOwner')}
          disabled={disabled}
          placeholder="Propietario"
          className="w-full border rounded px-3 py-2"
        />
        {errors.newOwner && (
          <p className="text-red-600 text-sm">{errors.newOwner.message}</p>
        )}
      </div>
    </>
  );
}

export function RiskForm({
  onNewAssessment,
}: {
  onNewAssessment: (id: string) => void;
}) {
  const { models, isLoadingModels, createModel, isCreating, errorCreate } =
    useModelInfo();
  const { evaluate, isEvaluating, errorEvaluate } = useRiskMetrics();

  // 3. React Hook Form + Zod
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      selectedModel: '',
      newName: '',
      newVersion: '',
      newOwner: '',
    },
  });

  const selectedModel = watch('selectedModel');
  const isProcessing = isCreating || isEvaluating || isSubmitting;

  const onSubmit = async (data: FormValues) => {
    try {
      // 4. Crear modelo si es necesario
      let modelId = data.selectedModel;
      if (!modelId) {
        const nuevo = await createModel({
          name: data.newName!,
          version: data.newVersion!,
          owner: data.newOwner!,
        });
        modelId = nuevo.id;
      }
      // 5. Evaluar riesgo
      const assessment = await evaluate(modelId);
      onNewAssessment(assessment.id);
      toast.success('¡Evaluación creada con éxito!');
      reset();
    } catch (err: any) {
      toast.error(err.message ?? 'Error al procesar la evaluación');
    }
  };

  // 6. Feedback de errores globales
  const globalError = errorCreate || errorEvaluate;
  if (globalError) {
    // opcional: podrías mostrar un banner aquí o un toast en useEffect
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 bg-white rounded-lg shadow space-y-4"
      aria-busy={isProcessing}
      aria-live="polite"
    >
      <h2 className="text-2xl font-semibold">Evaluar Riesgo IA</h2>

      {globalError && (
        <p className="text-red-600">Error: {globalError.message}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Selección de modelo existente */}
        <div>
          <label htmlFor="model-select" className="sr-only">
            Modelo existente
          </label>
          <select
            id="model-select"
            {...register('selectedModel')}
            disabled={isLoadingModels}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">— Crear modelo nuevo —</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} v{m.version} ({m.owner})
              </option>
            ))}
          </select>
          {errors.selectedModel && (
            <p className="text-red-600 text-sm">
              {errors.selectedModel.message}
            </p>
          )}
        </div>

        {/* Campos para nuevo modelo (sólo si no hay seleccionado) */}
        {!selectedModel && (
          <div className="grid grid-cols-1 gap-2">
            <NewModelFields
              register={register}
              errors={errors}
              disabled={isProcessing}
            />
          </div>
        )}
      </div>

      {/* Botón de envío con Spinner */}
      <Button
        type="submit"
        variant="solid"
        disabled={!isValid || isProcessing}
        className="flex items-center justify-center"
      >
        {isProcessing ? <Spinner size="sm" /> : 'Evaluar Riesgo'}
      </Button>
    </form>
  );
}
