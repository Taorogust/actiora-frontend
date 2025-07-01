// src/modules/compliance-dashboard/services/complianceService.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { backOff } from 'exponential-backoff';
import mitt from 'mitt';
import { z } from 'zod';
import { MetricSchema, ComplianceStateSchema, TaskSchema } from '../types';

type Events = {
  state: z.infer<typeof ComplianceStateSchema>;
  tasks: z.infer<typeof TaskSchema>[];
};

export const complianceEmitter = mitt<Events>();

const api: AxiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/compliance`,
  timeout: 10000,
  headers: { 'X-PWA-Cache': 'true' },
});

api.interceptors.response.use(
  res => res,
  async (err: AxiosError) => {
    const status = err.response?.status;
    if ([503,504].includes(status!)) {
      await backOff(() => Promise.reject(err), { startingDelay:500, retry:3 });
    }
    const msg = err.response?.data?.message || err.message;
    return Promise.reject(new Error(`Compliance API Error: ${msg}`));
  }
);

async function parse<T>(p: Promise<{ data: unknown }>, schema: z.ZodType<T>): Promise<T> {
  const { data } = await p;
  const parsed = schema.safeParse(data);
  if (!parsed.success) throw new Error('Invalid response format');
  return parsed.data;
}

// SSE real-time
let es: EventSource|null = null;
export function subscribeCompliance() {
  if (es) return;
  es = new EventSource(`${import.meta.env.VITE_API_BASE_URL}/compliance/stream`);
  es.addEventListener('state', e => {
    try {
      const s = ComplianceStateSchema.parse(JSON.parse((e as any).data));
      complianceEmitter.emit('state', s);
    } catch {}
  });
  es.addEventListener('tasks', e => {
    try {
      const ts = z.array(TaskSchema).parse(JSON.parse((e as any).data));
      complianceEmitter.emit('tasks', ts);
    } catch {}
  });
}
export function unsubscribeCompliance() {
  es?.close(); es = null;
}

// Métricas
export function getMetrics() { 
  return parse(api.get('/metrics'), z.array(MetricSchema)); 
}
export function postMetric(input: Omit<Task, 'task_id'> & { value:number }) {
  return parse(api.post('/metrics', input), MetricSchema);
}

// Estado
export function getComplianceState() {
  return parse(api.get('/state/latest'), ComplianceStateSchema);
}
export function computeComplianceState() {
  return parse(api.post('/state/compute'), ComplianceStateSchema);
}

// Tareas
export function getTasks() {
  return parse(api.get('/tasks'), z.array(TaskSchema));
}
export function upsertTask(input: Partial<Task> & Omit<Task,'task_id'>) {
  return parse(api.post('/tasks', input), TaskSchema);
}
export function completeTask(taskId: string) {
  return parse(api.patch(`/tasks/${taskId}/complete`), TaskSchema);
}
