// src/modules/norm-updater/hooks/useNormFetch.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNormVersions, fetchLatestNorm, getNormContent } from '../services/normService'
import type { NormVersion } from '../types'
import { toast } from 'react-toastify'

export function useNormFetch() {
  const qc = useQueryClient()

  // 1️⃣ Consultar todas las versiones
  const {
    data: versions = [],
    isLoading: isLoadingVersions,
    isError: isErrorVersions,
    refetch: refetchVersions
  } = useQuery<NormVersion[], Error>(
    ['normVersions'],
    getNormVersions,
    {
      staleTime: 1000 * 60 * 15,
      onError: err => toast.error(`Error cargando versiones: ${err.message}`)
    }
  )

  // 2️⃣ Mutación: fetch de la última versión
  const {
    mutateAsync: fetchLatest,
    isLoading: isFetchingLatest
  } = useMutation(fetchLatestNorm, {
    onSuccess: () => {
      toast.success('Última versión descargada ✔️')
      qc.invalidateQueries(['normVersions'])
    },
    onError: err => toast.error(`Error al obtener última versión: ${err.message}`)
  })

  // 3️⃣ Función para cargar el contenido raw de una versión
  const getContent = async (versionId: number): Promise<string> => {
    try {
      const { content } = await getNormContent(versionId)
      return content
    } catch (err: any) {
      toast.error(`Error obteniendo contenido de v${versionId}: ${err.message}`)
      throw err
    }
  }

  return {
    versions,
    isLoadingVersions,
    isErrorVersions,
    refetchVersions,

    fetchLatest,
    isFetchingLatest,

    getContent,
  }
}
