// src/modules/risk-classifier/hooks/useModelInfo.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Model } from '../types';
import { getModels, addModel } from '../services/riskService';

/**
 * Hook para gestionar la lista de modelos IA.
 * - usa React Query para cache, retries y suspensión opcional
 * - soporta cancelación vía AbortController (signal)
 * - expone datos, estados y función createModel con invalidación automática
 */
export function useModelInfo() {
  const qc = useQueryClient();

  // Query de modelos
  const modelsQuery = useQuery<Model[], Error>({
    queryKey: ['models'],
    queryFn: ({ signal }) => getModels(signal),
    staleTime: 5 * 60_000,       // 5 minutos en cache
    retry: 2,                    // reintenta al fallo 2 veces
  });

  // Mutation para crear un modelo nuevo
  const createModelMutation = useMutation<
    Model,                      // Tipo que devuelve
    Error,                      // Tipo de error
    { name: string; version: string; owner: string } // Variables
  >({
    mutationFn: ({ name, version, owner }) =>
      addModel(name, version, owner),
    onSuccess: () => {
      // invalidar cache al crear
      qc.invalidateQueries({ queryKey: ['models'] });
    },
  });

  return {
    // Datos y estados para el listado
    models: modelsQuery.data ?? [],
    isLoadingModels: modelsQuery.isLoading,
    isErrorModels: modelsQuery.isError,
    errorModels: modelsQuery.error,

    // Función y estados para crear
    createModel: createModelMutation.mutateAsync,
    isCreating: createModelMutation.isLoading,
    errorCreate: createModelMutation.error,
  };
}
