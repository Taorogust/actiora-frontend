import type { Model, Assessment } from '../types';
import { computeScore, classify } from '../utils/risk-utils';

/** Base URL de la API (o MSW) */
const API_BASE = process.env.REACT_APP_API_BASE_URL ?? '';

/** Latencia simulada (ms), configurable vía .env */
const MOCK_DELAY = Number(process.env.REACT_APP_MOCK_DELAY_MS ?? 200);

/**
 * Espera un tiempo simulado, abortable.
 */
function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(id);
          reject(new DOMException('Aborted', 'AbortError'));
        },
        { once: true }
      );
    }
  });
}

/**
 * Envuelve fetch con timeout/abort y latencia simulada.
 */
async function fetchWithMock<T>(
  input: RequestInfo,
  init: RequestInit = {},
  signal?: AbortSignal
): Promise<T> {
  // Primero, delay simulando red
  await delay(MOCK_DELAY, signal);

  // Luego la petición real (interceptada por MSW en desarrollo)
  const controller = new AbortController();
  const mergedSignal = controller.signal;
  if (signal) {
    // si recibimos signal, hacemos pirueta para abortar ambos
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  const response = await fetch(input, { ...init, signal: mergedSignal });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} – ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

/** Obtiene todos los modelos (GET /models) */
export async function getModels(signal?: AbortSignal): Promise<Model[]> {
  return fetchWithMock<Model[]>(`${API_BASE}/models`, { method: 'GET' }, signal);
}

/** Crea un modelo nuevo (POST /models) */
export async function addModel(
  name: string,
  version: string,
  owner: string,
  signal?: AbortSignal
): Promise<Model> {
  return fetchWithMock<Model>(
    `${API_BASE}/models`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, version, owner }),
    },
    signal
  );
}

/** Obtiene todas las evaluaciones (GET /assessments) */
export async function getAssessments(
  signal?: AbortSignal
): Promise<Assessment[]> {
  return fetchWithMock<Assessment[]>(
    `${API_BASE}/assessments`,
    { method: 'GET' },
    signal
  );
}

/** Obtiene una evaluación por ID (GET /assessments/:id) */
export async function getAssessmentById(
  id: string,
  signal?: AbortSignal
): Promise<Assessment | undefined> {
  try {
    return await fetchWithMock<Assessment>(
      `${API_BASE}/assessments/${id}`,
      { method: 'GET' },
      signal
    );
  } catch (e: any) {
    if (e.name === 'AbortError') throw e;
    return undefined;
  }
}

/** Dispara una nueva evaluación (POST /assessments) */
export async function assessRisk(
  modelId: string,
  signal?: AbortSignal
): Promise<Assessment> {
  // El servidor (o MSW) aplicará computeScore/classify; 
  // si quieres lógica local, expón otro endpoint
  return fetchWithMock<Assessment>(
    `${API_BASE}/assessments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modelId }),
    },
    signal
  );
}
