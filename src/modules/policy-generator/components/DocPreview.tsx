// src/components/DocPreview.tsx

import React from 'react'
import type { Document, VerifyResult } from '@/services/policyService'
import { Download, CheckCircle, AlertTriangle } from 'lucide-react'

interface DocPreviewProps {
  /** Documento generado (null si aún no se ha generado) */
  document: Document | null
  /** Flag de loading mientras se genera/verifica */
  isLoading?: boolean
  isDownloading?: boolean
  isVerifying?: boolean
  /** Resultado de la última verificación (null si no se ha verificado aún) */
  verifyResult: VerifyResult | null
  /** Callback para descargar el PDF */
  onDownload: (documentId: string) => Promise<void>
  /** Callback para verificar la validez */
  onVerify: (documentId: string) => Promise<VerifyResult>
}

const Spinner: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => {
  const dim = size === 'sm' ? 'h-4 w-4 border-t-2 border-b-2' : 'h-6 w-6 border-t-2 border-b-2'
  return <div className={`animate-spin ${dim} border-primary rounded-full`} />
}

const DocPreview: React.FC<DocPreviewProps> = ({
  document,
  isLoading = false,
  isDownloading = false,
  isVerifying = false,
  verifyResult,
  onDownload,
  onVerify,
}) => {
  const handleDownload = () => {
    if (document) onDownload(document.documentId)
  }
  const handleVerify = () => {
    if (document) onVerify(document.documentId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Vista previa del documento</h3>
        {isLoading && <Spinner size="sm" />}
      </div>

      {!document ? (
        <p className="text-gray-500 italic">
          Genera un documento para ver la previsualización aquí
        </p>
      ) : (
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <object
            data={document.url}
            type="application/pdf"
            width="100%"
            height="500px"
            className="w-full h-80"
          >
            <p className="p-4 text-center">
              Tu navegador no soporta PDF embebido.
              <a
                href={document.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline ml-1"
              >
                Abrir en nueva pestaña
              </a>
            </p>
          </object>
        </div>
      )}

      {document && (
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="btn btn-primary flex items-center space-x-2"
          >
            {isDownloading ? <Spinner size="sm" /> : <Download size={16} />}
            <span>{isDownloading ? 'Descargando...' : 'Descargar PDF'}</span>
          </button>

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className={`btn ${
              verifyResult?.valid ? 'btn-success' : 'btn-outline-secondary'
            } flex items-center space-x-2`}
          >
            {isVerifying ? (
              <Spinner size="sm" />
            ) : verifyResult?.valid ? (
              <CheckCircle size={16} />
            ) : (
              <AlertTriangle size={16} />
            )}
            <span>
              {isVerifying
                ? 'Verificando...'
                : verifyResult
                ? verifyResult.valid
                  ? 'Válido'
                  : 'Problemas de verificación'
                : 'Verificar documento'}
            </span>
          </button>

          {verifyResult && !isVerifying && (
            verifyResult.valid ? (
              <span className="badge badge-success flex items-center space-x-1">
                <CheckCircle size={14} />
                <span>Documento válido</span>
              </span>
            ) : (
              <div className="badge badge-warning p-3 space-y-1">
                <span className="flex items-center space-x-1">
                  <AlertTriangle size={14} />
                  <strong>Problemas detectados:</strong>
                </span>
                <ul className="list-disc pl-5">
                  {verifyResult.issues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      )}
    </div>
)

export default DocPreview
