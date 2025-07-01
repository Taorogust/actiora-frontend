// src/modules/explainability/services/explainService.ts
import { v4 as uuid } from 'uuid';
import type { Explanation } from '../types';
import { computeText, computeChartData } from '../utils/explain-utils';

const MOCK_DELAY_MS = parseInt(process.env.REACT_APP_MOCK_DELAY_MS || '700', 10);
const ERROR_RATE = parseFloat(process.env.REACT_APP_MOCK_ERROR_RATE || '0');

/** Delay abortable */
function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((res, rej) => {
    const id = setTimeout(res, ms);
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(id);
        rej(new DOMException('Request aborted', 'AbortError'));
      });
    }
  });
}

/** Simula fallo aleatorio según ERROR_RATE */
async function maybeError(): Promise<void> {
  if (Math.random() < ERROR_RATE) {
    throw new Error('Mock network error');
  }
}

let explanations: Explanation[] = [];

/**
 * Devuelve todas las explicaciones, ordenadas por timestamp.
 */
export async function fetchExplanations(
  signal?: AbortSignal
): Promise<Explanation[]> {
  await delay(MOCK_DELAY_MS, signal);
  await maybeError();
  return [...explanations].sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp)
  );
}

/**
 * Busca una explicación por ID.
 */
export async function getExplanationById(
  id: string,
  signal?: AbortSignal
): Promise<Explanation | undefined> {
  await delay(MOCK_DELAY_MS / 2, signal);
  await maybeError();
  return explanations.find(e => e.id === id);
}

/**
 * Crea una nueva explicación generando texto y datos de gráfico.
 */
export async function createExplanation(
  modelId: string,
  input: Record<string, any>,
  signal?: AbortSignal
): Promise<Explanation> {
  await delay(MOCK_DELAY_MS * 1.5, signal);
  await maybeError();

  const text = computeText(input);
  const chartData = computeChartData(input);
  const exp: Explanation = {
    id: uuid(),
    modelId,
    input,
    text,
    chartData,
    timestamp: new Date().toISOString(),
  };
  explanations.unshift(exp);
  return exp;
}
