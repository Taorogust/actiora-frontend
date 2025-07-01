import { useQuery } from '@tanstack/react-query';
import { getBiasMetrics, getBiasMetricsByDecision } from '../services/hitlService';
import type { BiasMetric } from '../types';

/**
 * Hook para obtener métricas de sesgo,
 * opcionalmente filtradas por decisionId
 */
export function useBiasMetrics(decisionId?: string) {
  const query = useQuery<BiasMetric[], Error>(
    decisionId ? ['biasMetrics', decisionId] : ['biasMetrics'],
    ({ signal }) =>
      decisionId
        ? getBiasMetricsByDecision(decisionId, signal)
        : getBiasMetrics(signal),
    { staleTime: 5 * 60_000, retry: 1 }
  );
  return { metrics: query.data ?? [], ...query };
}
