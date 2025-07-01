// src/hooks/useGenerateDoc.ts

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateDocument, verifyDocument, getDocument } from '@/services/policyService';
import type { Document, VerifyResult } from '@/services/policyService';
import { toast } from 'react-toastify';

/** Interfaz de retorno del hook */
export interface UseGenerateDocReturn {
  /** Lanza la generación de un documento */
  generate: (templateId: string, params: Record<string, any>) => Promise<Document>;
  /** Datos del documento generado (id, url, checksum) */
  document: Document | null;
  /** Estado de carga de la generación */
  isGenerating: boolean;
  /** Error al generar, si lo hay */
  generateError: Error | null;

  /** Dispara la verificación de un documento ya generado */
  verify: (documentId: string) => Promise<VerifyResult>;
  /** Resultado de la verificación (valid y issues) */
  verifyResult: VerifyResult | null;
  /** Estado de carga de la verificación */
  isVerifying: boolean;
  /** Error al verificar, si lo hay */
  verifyError: Error | null;

  /** Descarga el PDF del documento */
  download: (documentId: string) => Promise<void>;
  /** Estado de descarga en curso */
  isDownloading: boolean;
}

export const useGenerateDoc = (): UseGenerateDocReturn => {
  const queryClient = useQueryClient();
  const [isDownloading, setDownloading] = useState(false);

  /** Mutación: generar documento */
  const {
    mutateAsync: generate,
    data: document,
    isLoading: isGenerating,
    error: generateError,
  } = useMutation<Document, Error, { templateId: string; params: Record<string, any> }>(
    ({ templateId, params }) => generateDocument(templateId, params),
    {
      retry: 0,
      onSuccess: (_doc, { templateId }) => {
        toast.success('Documento generado con éxito');
        // Refrescar historial de versiones
        queryClient.invalidateQueries(['templateVersions', templateId]);
      },
      onError: (err) => {
        toast.error(`Error al generar documento: ${err.message}`);
      },
    }
  );

  /** Mutación: verificar documento */
  const {
    mutateAsync: verify,
    data: verifyResult,
    isLoading: isVerifying,
    error: verifyError,
  } = useMutation<VerifyResult, Error, string>(
    (docId) => verifyDocument(docId),
    {
      retry: 1,
      onSuccess: (result) => {
        if (result.valid) {
          toast.success('Documento verificado correctamente');
        } else {
          toast.warn(`Problemas de verificación: ${result.issues.join(', ')}`);
        }
      },
      onError: (err) => {
        toast.error(`Error en verificación: ${err.message}`);
      },
    }
  );

  /** Función para descargar el PDF */
  const download = useCallback(async (docId: string) => {
    try {
      setDownloading(true);
      const { url } = await getDocument(docId);
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al obtener el archivo');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${docId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Descarga iniciada');
    } catch (err: any) {
      toast.error(`Error al descargar: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  }, []);

  return {
    generate,
    document: document ?? null,
    isGenerating,
    generateError: generateError ?? null,

    verify,
    verifyResult: verifyResult ?? null,
    isVerifying,
    verifyError: verifyError ?? null,

    download,
    isDownloading,
  };
};
