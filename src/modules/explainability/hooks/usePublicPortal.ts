// src/modules/explainability/hooks/usePublicPortal.ts
import { useQuery } from '@tanstack/react-query';
import type { Explanation } from '../types';
import { getExplanationById } from '../services/explainService';

/**
 * Hook público para recuperar una explicación por su ID.
 * - Usa señal de AbortController para poder cancelar peticiones.
 * - No reintenta automáticamente en fallo.
 * - Timeout de caché razonable para datos públicos.
 */
export function usePublicPortal(id?: string) {
  const queryKey = ['explanation', id];

  const {
    data: explanation,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Explanation, Error>(
    queryKey,
    // Query function recibe el signal de React Query
    async ({ signal }) => {
      if (!id) {
        // Rechazar si no hay ID
        return Promise.reject(new Error('No explanation ID provided'));
      }
      return getExplanationById(id, signal);
    },
    {
      enabled: Boolean(id),         // Sólo corre si id está definido
      retry: 0,                     // No reintenta automáticamente
      staleTime: 5 * 60_000,        // 5 minutos en caché
      cacheTime: 10 * 60_000,       // 10 minutos antes de limpiar caché
      // suspense: true,            // opcional: activar si usas Suspense
    }
  );

  return {
    explanation,
    isLoading,
    isError,
    error,
    refetch,
  };
}
