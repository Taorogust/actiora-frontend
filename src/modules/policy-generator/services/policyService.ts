// src/services/policyService.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

/** CONFIGURACIÓN DEL CLIENTE */
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10_000,
});

// Interceptor global de errores
apiClient.interceptors.response.use(
  res => res,
  (error: AxiosError) => {
    // Aquí podrías mapear códigos de status a errores de negocio
    const message = error.response?.data?.message || error.message;
    return Promise.reject(new Error(`API Error: ${message}`));
  }
);

/** ESQUEMAS ZOD */

// Plantilla básica
const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  content: z.string(),           // Jinja template
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Template = z.infer<typeof TemplateSchema>;

// Versión de documento histórico
const TemplateVersionSchema = z.object({
  versionId: z.string(),
  templateId: z.string(),
  generatedBy: z.string(),
  generatedAt: z.string(),
  params: z.record(z.any()),
});
export type TemplateVersion = z.infer<typeof TemplateVersionSchema>;

// Documento generado
const DocumentSchema = z.object({
  documentId: z.string(),
  url: z.string().url(),
  checksum: z.string(),
});
export type Document = z.infer<typeof DocumentSchema>;

// Resultado de verificación
const VerifySchema = z.object({
  documentId: z.string(),
  valid: z.boolean(),
  issues: z.array(z.string()),
});
export type VerifyResult = z.infer<typeof VerifySchema>;

/** UTILIDAD PARA LLAMADAS */
async function parseResponse<T>(
  promise: Promise<{ data: unknown }>,
  schema: z.ZodType<T>
): Promise<T> {
  const { data } = await promise;
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error('Validation Error', result.error.format());
    throw new Error('Invalid response format from server');
  }
  return result.data;
}

/** SERVICES */

/** 1. Obtener todas las plantillas disponibles */
export async function getTemplates(): Promise<Template[]> {
  return parseResponse(
    apiClient.get('/templates'),
    z.array(TemplateSchema)
  );
}

/** 2. Crear o actualizar plantilla */
export async function upsertTemplate(template: {
  id?: string;
  name: string;
  content: string;
}): Promise<Template> {
  return parseResponse(
    apiClient.post('/templates', template),
    TemplateSchema
  );
}

/** 3. Historial de versiones de una plantilla */
export async function getTemplateVersions(templateId: string): Promise<TemplateVersion[]> {
  return parseResponse(
    apiClient.get(`/templates/${templateId}/versions`),
    z.array(TemplateVersionSchema)
  );
}

/** 4. Generar un documento a partir de plantilla + params */
export async function generateDocument(
  templateId: string,
  params: Record<string, any>
): Promise<Document> {
  return parseResponse(
    apiClient.post('/documents', { templateId, params }),
    DocumentSchema
  );
}

/** 5. Descargar metadatos (URL) de un documento generado */
export async function getDocument(documentId: string): Promise<Document> {
  return parseResponse(
    apiClient.get(`/documents/${documentId}`),
    DocumentSchema
  );
}

/** 6. Verificar la validez de un documento */
export async function verifyDocument(documentId: string): Promise<VerifyResult> {
  return parseResponse(
    apiClient.get(`/documents/${documentId}/verify`),
    VerifySchema
  );
}
