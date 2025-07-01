// src/modules/hitl-bias/hooks/useReviewTasks.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getReviewTasks } from '../services/hitlService';
import { subscribeReviewTasks } from '../services/hitl-utils';
import type { ReviewTask } from '../types';

/**
 * Hook para listar y suscribirse a las tareas de revisión humana (HITL).
 * - Paginación y filtros via URL (searchParams)
 * - React Query con cache, reintentos y staleTime
 * - Suscripción a nuevas tareas vía EventTarget para UI en tiempo real
 */
export function useReviewTasks() {
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();

  // --- Parámetros desde URL ---
  const page = parseInt(params.get('page')  ?? '1', 10);
  const pageSize = parseInt(params.get('pageSize') ?? '20', 10);
  const statusFilter  = params.get('status')  || undefined;
  const modelFilter   = params.get('modelId') || undefined;

  const queryKey = ['reviewTasks', { page, pageSize, statusFilter, modelFilter }];

  // --- Consulta paginada y filtrada ---
  const {
    data: tasks = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ReviewTask[], Error>(
    queryKey,
    ({ signal }) => getReviewTasks(signal).then(list => {
      // Filtrar
      let result = list;
      if (statusFilter) result = result.filter(t => t.status === statusFilter);
      if (modelFilter)  result = result.filter(t => t.modelId === modelFilter);
      // Paginación
      const start = (page - 1) * pageSize;
      return result.slice(start, start + pageSize);
    }),
    {
      staleTime: 2 * 60_000,
      retry: 2,
    }
  );

  // --- Suscripción a nuevas tareas (real-time mock) ---
  useEffect(() => {
    const unsub = subscribeReviewTasks(newTask => {
      // Solo si encaja con filtros actuales
      if (statusFilter && newTask.status !== statusFilter) return;
      if (modelFilter  && newTask.modelId !== modelFilter)  return;
      // Insertar al frente (optimistic) y recortar
      qc.setQueryData<ReviewTask[]>(queryKey, old => {
        const prev = old ?? [];
        return [newTask, ...prev].slice(0, pageSize);
      });
    });
    return unsub;
  }, [qc, queryKey, statusFilter, modelFilter, pageSize]);

  // --- Helpers para cambiar URL params ---
  const setPage = (p: number) => {
    params.set('page', p.toString());
    setParams(params);
  };
  const setPageSize = (ps: number) => {
    params.set('pageSize', ps.toString());
    setParams(params);
  };
  const setFilters = (opts: { status?: string; modelId?: string }) => {
    if (opts.status) params.set('status', opts.status);
    else params.delete('status');
    if (opts.modelId) params.set('modelId', opts.modelId);
    else params.delete('modelId');
    params.set('page', '1'); // resetear página al cambiar filtros
    setParams(params);
  };

  return {
    tasks,
    isLoading,
    isError,
    error,
    refetch,
    // pagination & filters
    page,
    pageSize,
    statusFilter,
    modelFilter,
    setPage,
    setPageSize,
    setFilters,
  };
}
