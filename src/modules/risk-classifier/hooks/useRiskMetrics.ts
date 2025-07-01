// src/modules/risk-classifier/hooks/useRiskMetrics.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Assessment } from '../types';
import {
  getAssessments,
  assessRisk,
} from '../services/riskService';

const STALE_TIME = 2 * 60_000;   // 2 minutos
const RETRY = 1;                 // 1 reintento

/**
 * Hook principal para listado y creación de evaluaciones.
 */
export function useRiskMetrics() {
  const qc = useQueryClient();

  // Query: lista de todas las evaluaciones
  const assessmentsQuery = useQuery<Assessment[], Error>({
    queryKey: ['assessments'],
    queryFn: ({ signal }) => getAssessments(signal),
    staleTime: STALE_TIME,
    retry: RETRY,
  });

  // Mutation: crear nueva evaluación
  const assessMutation = useMutation<Assessment, Error, string>({
    mutationFn: modelId => assessRisk(modelId),
    onSuccess: () => {
      // invalidamos la lista para refetch
      qc.invalidateQueries({ queryKey: ['assessments'] });
    },
  });

  return {
    // listado
    assessments: assessmentsQuery.data ?? [],
    isLoadingAssessments: assessmentsQuery.isLoading,
    isErrorAssessments: assessmentsQuery.isError,
    errorAssessments: assessmentsQuery.error,

    // evaluación
    evaluate: assessMutation.mutateAsync,
    isEvaluating: assessMutation.isLoading,
    errorEvaluate: assessMutation.error,
  };
}

/**
 * Hook dedicado a obtener una evaluación por ID.
 * - usa un queryKey ['assessments', id]
 * - soporta señal de cancelación
 */
export function useAssessment(id: string) {
  return useQuery<Assessment | undefined, Error>({
    queryKey: ['assessments', id],
    queryFn: ({ signal }) => getAssessmentById(id, signal),
    staleTime: STALE_TIME,
    retry: RETRY,
  });
}
