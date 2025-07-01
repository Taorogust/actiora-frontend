// src/modules/audit-log/types.ts

/**
 * Campos comunes para un registro de auditoría.
 */
export interface BaseRecord {
  /** Identificador único del registro */
  id: string;
  /** Marca de tiempo ISO 8601 cuando se generó el registro */
  timestamp: string;
  /** Hash criptográfico del payload */
  payloadHash: string;
  /** Firma del hash del payload */
  signature: string;
}

/**
 * Estados posibles de verificación de un registro de auditoría.
 */
export enum VerificationResult {
  /** La verificación aún no se ha ejecutado */
  Pending = 'pending',
  /** El registro fue validado correctamente */
  Valid = 'valid',
  /** El registro fue marcado como inválido */
  Invalid = 'invalid',
  /** No se pudo determinar el estado de verificación */
  Unknown = 'unknown',
}

/**
 * Un único registro de auditoría, extendible para nuevos campos.
 */
export interface AuditRecord extends BaseRecord {
  /** Tipo de entidad auditada, por ejemplo "User" o "Transaction" */
  entity: string;
  /** Identificador de la entidad auditada */
  entityId: string;
  /** Identificador del usuario que generó el registro */
  userId: string;
  /** Versión del modelo o sistema asociado */
  modelVersion: string;
  /** Datos de entrada auditados (opcional) */
  input?: Record<string, any>;
  /** Datos de salida auditados (opcional) */
  output?: Record<string, any>;
  /** Estado de verificación actual */
  status: VerificationResult;
}
