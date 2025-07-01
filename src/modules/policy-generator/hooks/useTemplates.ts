// src/hooks/useTemplates.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTemplates, upsertTemplate } from '@/services/policyService';
import type { Template } from '@/services/policyService';
import { toast } from 'react-toastify';

export interface UseTemplatesReturn {
  templates: Template[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  upsertTemplate: (payload: { id?: string; name: string; content: string }) => Promise<Template>;
  isUpserting: boolean;
}

export const useTemplates = (): UseTemplatesReturn => {
  const queryClient = useQueryClient();

  // 1️⃣ Query: carga y cache de plantillas
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<Template[], Error>(
    ['templates'],
    getTemplates,
    {
      staleTime: 1000 * 60 * 5,       // 5 min de frescura
      refetchOnWindowFocus: false,   // no recarga al volver al tab
      retry: 1,                       // 1 reintento
      onError: (err) => {
        toast.error(`Error al cargar plantillas: ${err.message}`);
      },
    }
  );

  // 2️⃣ Mutation: crear o actualizar plantilla
  const {
    mutateAsync,
    isLoading: isUpserting,
  } = useMutation<Template, Error, { id?: string; name: string; content: string }>(
    upsertTemplate,
    {
      onSuccess: (tpl) => {
        queryClient.invalidateQueries(['templates']);
        toast.success(`Plantilla ${tpl.id ? 'actualizada' : 'creada'} con éxito`);
      },
      onError: (err) => {
        toast.error(`Error al guardar plantilla: ${err.message}`);
      },
    }
  );

  return {
    templates: data ?? [],
    isLoading,
    isError,
    error: error ?? null,
    upsertTemplate: mutateAsync,
    isUpserting,
  };
};
