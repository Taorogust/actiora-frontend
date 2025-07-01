// src/modules/explainability/hooks/useExplanation.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuid } from 'uuid';
import type { Explanation } from '../types';
import {
  fetchExplanations,
  createExplanation as svcCreateExplanation,
} from '../services/explainService';
import { computeText, computeChartData } from '../utils/explain-utils';

interface ExplainVars {
  modelId: string;
  input: Record<string, any>;
}

export function useExplanation(modelId?: string) {
  const qc = useQueryClient();
  // Key dinámico según modelId
  const queryKey = modelId ? ['explanations', modelId] : ['explanations'];

  // Query: lista de explicaciones, filtrada si hay modelId
  const {
    data: explanations = [],
    isLoading: isLoadingList,
    isError: isErrorList,
    error: errorList,
  } = useQuery<Explanation[], Error>(
    queryKey,
    async ({ signal }) => {
      const all = await fetchExplanations(signal);
      return modelId
        ? all.filter(e => e.modelId === modelId)
        : all;
    },
    {
      staleTime: 5 * 60_000,
      retry: 2,
      // suspense: true, // opcional
    }
  );

  // Mutation: crear explicación con optimistic update
  const {
    mutateAsync: explain,
    isLoading: isExplaining,
    isError: isErrorExplain,
    error: errorExplain,
  } = useMutation<Explanation, Error, ExplainVars>(
    ({ modelId, input }) => svcCreateExplanation(modelId, input),
    {
      // Optimistic update
      onMutate: async ({ modelId, input }) => {
        await qc.cancelQueries(queryKey);
        const previous = qc.getQueryData<Explanation[]>(queryKey) ?? [];
        // Generar explicación provisional
        const temp: Explanation = {
          id: `temp-${uuid()}`,
          modelId,
          input,
          text: computeText(input),
          chartData: computeChartData(input),
          timestamp: new Date().toISOString(),
        };
        qc.setQueryData<Explanation[]>(queryKey, [temp, ...previous]);
        return { previous };
      },
      // Rollback on error
      onError: (_err, _vars, context) => {
        if (context?.previous) {
          qc.setQueryData(queryKey, context.previous);
        }
      },
      // Refetch o invalida tras settled
      onSettled: () => {
        qc.invalidateQueries(queryKey);
      },
    }
  );

  return {
    explanations,
    isLoadingList,
    isErrorList,
    errorList,
    explain,
    isExplaining,
    isErrorExplain,
    errorExplain,
  };
}
