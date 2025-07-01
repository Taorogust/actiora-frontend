// src/modules/audit-log/services/auditService.ts
import { v4 as uuid } from 'uuid'
import type { AuditRecord, VerificationResult } from '../types'

/**
 * Configuración de mocks vía variables de entorno.
 * Puedes ajustar MOCK_DELAY y ERROR_RATE sin tocar el código.
 */
const DEFAULT_DELAY_MS = 200
const DEFAULT_ERROR_RATE = 0

const MOCK_DELAY = Number(process.env.REACT_APP_MOCK_DELAY_MS) || DEFAULT_DELAY_MS
const ERROR_RATE = parseFloat(process.env.REACT_APP_MOCK_ERROR_RATE ?? `${DEFAULT_ERROR_RATE}`)

/**
 * Delay abortable: rechaza con AbortError si signal se dispara.
 */
const delay = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, ms)
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(id)
        reject(new DOMException('Aborted', 'AbortError'))
      })
    }
  })

/** Simula errores de red con una tasa configurable */
async function maybeError() {
  if (Math.random() < ERROR_RATE) {
    throw new Error('Mock network error')
  }
}

/** Lógica pura extraída para testear y reutilizar */
export function computeHash(payload: unknown): string {
  return Math.random().toString(36).slice(2, 10)
}
export function signHash(hash: string): string {
  return Math.random().toString(36).slice(2, 10)
}

/** Almacén en memoria */
let records: AuditRecord[] = []

/**
 * Obtiene todos los registros ordenados por timestamp desc.
 * Soporta cancelación y simulación de errores.
 */
export async function getAuditRecords(signal?: AbortSignal): Promise<AuditRecord[]> {
  await delay(MOCK_DELAY, signal)
  await maybeError()
  return [...records].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

/**
 * Obtiene un registro por su ID.
 */
export async function getAuditRecordById(
  id: string,
  signal?: AbortSignal
): Promise<AuditRecord | undefined> {
  await delay(MOCK_DELAY / 2, signal)
  await maybeError()
  return records.find(r => r.id === id)
}

/**
 * Verifica la firma de un registro:
 * - 'valid' si signature === payloadHash
 * - 'invalid' en otro caso
 * - 'unknown' si no existe el registro
 */
export async function verifyAuditRecord(
  id: string,
  signal?: AbortSignal
): Promise<VerificationResult> {
  await delay(MOCK_DELAY, signal)
  await maybeError()
  const rec = records.find(r => r.id === id)
  if (!rec) return 'unknown'
  return rec.signature === rec.payloadHash ? 'valid' : 'invalid'
}

/**
 * Crea un nuevo registro de auditoría:
 * Soporta cancelación y simulación de errores.
 */
export async function addAuditRecord(
  entity: string,
  entityId: string,
  userId: string,
  modelVersion: string,
  input?: Record<string, unknown>,
  output?: Record<string, unknown>,
  signal?: AbortSignal
): Promise<AuditRecord> {
  await delay(MOCK_DELAY * 1.5, signal)
  await maybeError()
  const payload = { entity, entityId, userId, modelVersion, input, output }
  const payloadHash = computeHash(payload)
  const signature = signHash(payloadHash)
  const rec: AuditRecord = {
    id: uuid(),
    entity,
    entityId,
    payloadHash,
    signature,
    timestamp: new Date().toISOString(),
    userId,
    modelVersion,
    input,
    output,
  }
  records.unshift(rec)
  return rec
}
