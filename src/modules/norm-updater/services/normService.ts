// src/modules/norm-updater/services/normService.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { backOff } from 'exponential-backoff';
import { NormVersionSchema, AuditTaskSchema } from '../types';
import { z } from 'zod';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 20000,
  headers: { 'X-PWA-Cache': 'true' },
});
api.interceptors.response.use(r=>r, async err=>{
  const status = err.response?.status;
  if ([503,504].includes(status!)) {
    await backOff(() => Promise.reject(err), { startingDelay:500, retry:3 });
  }
  const msg = err.response?.data?.message||err.message;
  return Promise.reject(new Error(`NormService Error: ${msg}`));
});

async function parse<T>(p: Promise<{ data: unknown }>, schema: z.ZodType<T>): Promise<T> {
  const { data } = await p;
  const parsed = schema.safeParse(data);
  if (!parsed.success) throw new Error('Invalid response');
  return parsed.data;
}

export function getVersions() {
  return parse(api.get('/norm/versions'), z.array(NormVersionSchema));
}
export function fetchLatest() {
  return parse(api.post('/norm/fetch'), NormVersionSchema);
}
export function getContent(id: number) {
  return parse(api.get(`/norm/versions/${id}/content`), z.object({ content: z.string() }));
}
export function getTasks() {
  return parse(api.get('/audit/tasks'), z.array(AuditTaskSchema));
}
export function scheduleTask(cron: string) {
  return parse(api.post('/audit/tasks',{cron}), AuditTaskSchema);
}
export function runTask(id: string) {
  return parse(api.post(`/audit/tasks/${id}/run`), AuditTaskSchema);
}
