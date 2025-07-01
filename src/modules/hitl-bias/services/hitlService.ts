// src/modules/hitl-bias/services/hitlService.ts
import { v4 as uuid } from 'uuid';
import type { ReviewTask, BiasMetric, ReviewStatus } from '../types';
import {
  MOCK_DELAY_MS,
  delay,
  maybeError,
  computeHash,
  signHash,
  REVIEW_ALERT_THRESHOLD,
  emitReviewTask,
  emitAlert,
} from './hitl-utils';

/** In-memory data */
let tasks: ReviewTask[] = [
  {
    id: uuid(),
    decisionId: uuid(),
    modelId: uuid(),
    riskLevel: 'high',
    input: { age: 45, income: 72000 },
    output: { approved: false },
    status: 'pending',
    timestamp: new Date().toISOString(),
  },
];
let metrics: BiasMetric[] = [];

/** Obtiene todas las tareas de revisión */
export async function getReviewTasks(signal?: AbortSignal): Promise<ReviewTask[]> {
  await delay(MOCK_DELAY_MS, signal);
  await maybeError();
  return tasks.slice().sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/**
 * Asigna un revisor y cambia el estado de la tarea
 * - Emite eventos de nueva tarea y alerta si corresponde
 */
export async function assignReviewTask(
  taskId: string,
  reviewerId: string,
  status: Exclude<ReviewStatus, 'pending'>,
  comments?: string,
  signal?: AbortSignal
): Promise<ReviewTask> {
  await delay(MOCK_DELAY_MS, signal);
  await maybeError();

  const idx = tasks.findIndex(t => t.id === taskId);
  if (idx < 0) throw new Error('Task not found');

  const updated: ReviewTask = {
    ...tasks[idx],
    assignedTo: reviewerId,
    status,
    comments,
    timestamp: new Date().toISOString(),
  };
  tasks[idx] = updated;

  // Notifica a los suscriptores
  emitReviewTask(updated);

  // Alerta automática: si el nivel de riesgo supera el umbral
  if (['high'].includes(updated.riskLevel) /* aquí podrías usar umbral dinámico */) {
    emitAlert(updated);
  }

  return updated;
}

/** Obtiene todas las métricas de sesgo */
export async function getBiasMetrics(signal?: AbortSignal): Promise<BiasMetric[]> {
  await delay(MOCK_DELAY_MS, signal);
  await maybeError();
  return metrics.slice().sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/**
 * Obtiene métricas de sesgo para una decisión específica
 */
export async function getBiasMetricsByDecision(
  decisionId: string,
  signal?: AbortSignal
): Promise<BiasMetric[]> {
  await delay(MOCK_DELAY_MS / 2, signal);
  await maybeError();
  return metrics.filter(m => m.decisionId === decisionId);
}
