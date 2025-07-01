// src/modules/compliance-dashboard/hooks/useComplianceState.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getComplianceState, computeComplianceState } from '../services/complianceService';
import type { ComplianceState } from '../types';
import { toast } from 'react-toastify';

export function useComplianceState() {
  const qc = useQueryClient();
  const q = useQuery<ComplianceState,Error>(
    ['complianceState'], getComplianceState,
    { staleTime:300000, onError:e=>toast.error(e.message) }
  );
  const m = useMutation(computeComplianceState, {
    onSuccess: data => {
      qc.setQueryData(['complianceState'], data);
      toast.success('Semáforo recalculado');
    },
    onError:e=>toast.error(e.message),
  });
  return {
    state: q.data ?? null,
    isLoading: q.isLoading,
    compute: m.mutateAsync,
    isComputing: m.isLoading
  };
}
