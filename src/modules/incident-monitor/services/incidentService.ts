import axios, { AxiosInstance, AxiosError } from 'axios';
import mitt from 'mitt';
import { backOff } from 'exponential-backoff';
import { z } from 'zod';
import { IncidentSchema, NotificationSchema } from '../types';

type Events = { incident: z.infer<typeof IncidentSchema> };
export const incidentEmitter = mitt<Events>();

const apiClient: AxiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/incidents`,
  timeout: 15_000,
});

// Circuit breaker + retry
apiClient.interceptors.response.use(
  res => res,
  async (err: AxiosError) => {
    const msg = err.response?.data?.message || err.message;
    // si es 503 o 504, reintentar con backoff
    if ([503, 504].includes(err.response?.status || 0)) {
      await backOff(() => Promise.reject(err), {
        startingDelay: 500,
        retry: 3,
        timeMultiple: 2,
      });
    }
    return Promise.reject(new Error(`Incident API Error: ${msg}`));
  }
);

// SSE con reconexión exponencial
let es: EventSource | null = null;
let reconnectDelay = 1000;
export function subscribeIncidents() {
  if (es) return;
  es = new EventSource(`${import.meta.env.VITE_API_BASE_URL}/incidents/stream`);
  es.onmessage = e => {
    try {
      const data = JSON.parse(e.data);
      const inc = IncidentSchema.parse(data);
      incidentEmitter.emit('incident', inc);
    } catch {}
  };
  es.onerror = () => {
    es?.close(); es = null;
    setTimeout(subscribeIncidents, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 2, 30000);
  };
}
export function unsubscribeIncidents() {
  es?.close(); es = null; reconnectDelay = 1000;
}

async function parse<T>(p: Promise<{ data: unknown }>, schema: z.ZodType<T>): Promise<T> {
  const { data } = await p;
  const parsed = schema.safeParse(data);
  if (!parsed.success) throw new Error('Invalid response format');
  return parsed.data;
}

const Paged = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ items: z.array(item), total: z.number().int(), page: z.number().int(), pageSize: z.number().int() });
export type Paged<T> = z.infer<ReturnType<typeof Paged>>;

export interface IncidentQueryParams {
  status?: string; severity?: string; q?: string;
  dateFrom?: string; dateTo?: string;
  page?: number; pageSize?: number;
}
export function getIncidents(params: IncidentQueryParams): Promise<Paged<typeof IncidentSchema>> {
  return parse(apiClient.get('/', { params }), Paged(IncidentSchema));
}
export function getIncident(id: string) { return parse(apiClient.get(`/${id}`), IncidentSchema); }
export function getNotifications(id: string) {
  return parse(apiClient.get(`/${id}/notifications`), z.array(NotificationSchema));
}
export function notifyAuthority(incidentId: string, authority: string, channel: 'email'|'sms') {
  return parse(apiClient.post(`/${incidentId}/notify`, { authority, channel }), NotificationSchema);
}
export function retryNotification(notifId: string) {
  return parse(apiClient.post(`/notifications/${notifId}/retry`), NotificationSchema);
}
