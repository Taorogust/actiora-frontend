// src/components/VersionHistory.tsx

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTemplateVersions } from '@/services/policyService'
import type { TemplateVersion } from '@/services/policyService'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import { Download, RefreshCw } from 'lucide-react'

interface VersionHistoryProps {
  /** ID de la plantilla actual */
  templateId: string
  /** Callback para descargar un documento */
  onDownload: (documentId: string) => Promise<void>
  /** Callback para verificar un documento */
  onVerify: (documentId: string) => Promise<void>
}

const VersionHistory: React.FC<VersionHistoryProps> = ({
  templateId,
  onDownload,
  onVerify,
}) => {
  const {
    data: versions,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<TemplateVersion[], Error>(
    ['templateVersions', templateId],
    () => getTemplateVersions(templateId),
    {
      staleTime: 1000 * 60 * 2,  // 2 minutos
      retry: 1,
      onError: (err) => {
        toast.error(`Error al cargar historial: ${err.message}`)
      },
    }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="animate-spin h-6 w-6 text-primary mr-2" />
        <span>Cargando historial de versiones...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
        <p>Error cargando historial: {error?.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 btn btn-outline-secondary flex items-center space-x-2"
        >
          <RefreshCw size={16} />
          <span>Reintentar</span>
        </button>
      </div>
    )
  }

  if (!versions || versions.length === 0) {
    return (
      <p className="text-gray-500 italic">
        No hay versiones generadas para esta plantilla aún.
      </p>
    )
  }

  return (
    <div className="overflow-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Versión</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Generado por</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Fecha</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Parámetros</th>
            <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {versions.map((v) => (
            <tr key={v.versionId}>
              <td className="px-4 py-3 text-sm text-gray-800">{v.versionId}</td>
              <td className="px-4 py-3 text-sm text-gray-800">{v.generatedBy}</td>
              <td className="px-4 py-3 text-sm text-gray-800">
                {format(new Date(v.generatedAt), 'dd/MM/yyyy HH:mm')}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800 break-words max-w-xs">
                <pre className="whitespace-pre-wrap">{JSON.stringify(v.params, null, 2)}</pre>
              </td>
              <td className="px-4 py-3 text-center space-x-2">
                <button
                  onClick={() => onDownload(v.versionId)}
                  className="inline-flex items-center btn btn-sm btn-outline-primary space-x-1"
                >
                  <Download size={14} />
                  <span>Descargar</span>
                </button>
                <button
                  onClick={() => onVerify(v.versionId)}
                  className="inline-flex items-center btn btn-sm btn-outline-secondary space-x-1"
                >
                  <RefreshCw size={14} />
                  <span>Verificar</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default VersionHistory
