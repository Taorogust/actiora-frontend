// src/modules/norm-updater/types.ts
import { z } from 'zod';

export const NormVersionSchema = z.object({
  version_id: z.number().int(),
  source_url: z.string().url(),
  fetched_at: z.string().transform(d => new Date(d)),
  checksum: z.string(),
});
export type NormVersion = z.infer<typeof NormVersionSchema>;

export const AuditTaskSchema = z.object({
  task_id: z.string().uuid(),
  cron: z.string(),
  scheduled_at: z.string().transform(d => new Date(d)),
  status: z.enum(['scheduled','running','completed','failed']),
  completed_at: z.string().nullable().transform(d => d?new Date(d):null),
});
export type AuditTask = z.infer<typeof AuditTaskSchema>;
