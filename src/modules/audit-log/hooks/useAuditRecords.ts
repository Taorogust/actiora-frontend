// src/modules/audit-log/hooks/useAuditRecords.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAuditRecords,
  addAuditRecord,
} from '../services/auditService'
import type { AuditRecord } from '../types'

export function useAuditRecords() {
  const qc = useQueryClient()

  // 1. Query principal para traer todos los registros
  const {
    data: records = [],
    isLoading,
    isError,
    error,
  } = useQuery<AuditRecord[], Error>(
    ['auditRecords'],
    ({ signal }) => getAuditRecords(signal),
    {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 2,                 // reintenta hasta 2 veces
      // suspense: true,        // opcional: activar Suspense si lo usas
    }
  )

  // 2. Mutation para añadir un registro    
  const {
    mutateAsync: createRecord,
    isLoading: isCreating,
    isError: isErrorCreating,
    error: errorCreating,
  } = useMutation<
    AuditRecord,       // tipo de retorno
    Error,             // tipo de error
    Parameters<typeof addAuditRecord> // args de la función
  >(
    (params) => addAuditRecord(...params),
    {
      onSuccess: () => {
        // invalidar cache para volver a recargar la lista
        qc.invalidateQueries(['auditRecords'])
      },
    }
  )

  return {
    // Datos
    records,
    isLoading,
    isError,
    error,

    // Creación (mutation)
    createRecord,
    isCreating,
    isErrorCreating,
    errorCreating,
  }
}
