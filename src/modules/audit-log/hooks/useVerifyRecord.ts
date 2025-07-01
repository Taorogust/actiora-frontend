// src/modules/audit-log/hooks/useVerifyRecord.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { verifyAuditRecord } from '../services/auditService'
import type { VerificationResult } from '../types'

/**
 * Hook para verificar un registro de auditoría:
 * - verify(id) dispara la verificación
 * - isVerifying / isErrorVerify / errorVerify para feedback en UI
 */
export function useVerifyRecord() {
  const qc = useQueryClient()

  const {
    mutateAsync: verify,
    isLoading: isVerifying,
    isError: isErrorVerify,
    error: errorVerify,
  } = useMutation<VerificationResult, Error, string>(
    (id) => verifyAuditRecord(id),
    {
      onSuccess: () => {
        // Cuando termine la verificación, recarga la lista de registros
        qc.invalidateQueries(['auditRecords'])
      },
    }
  )

  return {
    verify,
    isVerifying,
    isErrorVerify,
    errorVerify,
  }
}
