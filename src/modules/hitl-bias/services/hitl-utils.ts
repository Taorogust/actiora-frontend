// src/modules/hitl-bias/services/hitl-utils.ts
import { v4 as uuid } from 'uuid';
import type { ReviewTask, BiasMetric } from '../types';

/** Configuración de mocks */
export const MOCK_DELAY_MS = parseInt(process.env.REACT_APP_MOCK_DELAY_MS || '300', 10);
export const ERROR_RATE = parseFloat(process.env.REACT_APP_MOCK_ERROR_RATE || '0');

/** Umbral para alertas automáticas (e.g. riesgo alto) */
export const REVIEW_ALERT_THRESHOLD = parseFloat(process.env.REACT_APP_REVIEW_ALERT_THRESHOLD || '0.7');

/** Retardo con soporte de AbortSignal */
export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(id);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

/** Simula errores de red */
export async function maybeError(): Promise<void> {
  if (Math.random() < ERROR_RATE) {
    throw new Error('Mock network error');
  }
}

/** Genérico de hashing (mock) */
export function computeHash(payload: any): string {
  return Math.random().toString(36).slice(2, 10);
}
export function signHash(hash: string): string {
  return Math.random().toString(36).slice(2, 10);
}

/** EventTarget para notificaciones en tiempo real */
const reviewTaskEvents = new EventTarget();

/** Suscripción a nuevos ReviewTask */
export function subscribeReviewTasks(listener: (task: ReviewTask) => void) {
  const cb = (e: Event) => listener((e as CustomEvent).detail);
  reviewTaskEvents.addEventListener('reviewTask', cb);
  return () => reviewTaskEvents.removeEventListener('reviewTask', cb);
}

/** Suscripción a alertas automáticas */
export function subscribeAlerts(listener: (task: ReviewTask) => void) {
  const cb = (e: Event) => listener((e as CustomEvent).detail);
  reviewTaskEvents.addEventListener('alert', cb);
  return () => reviewTaskEvents.removeEventListener('alert', cb);
}

/** Dispara un evento de tarea nueva */
export function emitReviewTask(task: ReviewTask) {
  reviewTaskEvents.dispatchEvent(new CustomEvent('reviewTask', { detail: task }));
}

/** Dispara una alerta automática */
export function emitAlert(task: ReviewTask) {
  reviewTaskEvents.dispatchEvent(new CustomEvent('alert', { detail: task }));
}
