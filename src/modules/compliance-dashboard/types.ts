// src/modules/compliance-dashboard/types.ts
import { z } from 'zod';

export const MetricSchema = z.object({
  metric_id: z.string().uuid(),
  module: z.string(),
  metric_name: z.string(),
  value: z.number().min(0).max(1),
  timestamp: z.string().transform(s => new Date(s)),
});
export type Metric = z.infer<typeof MetricSchema>;

export const ComplianceStateSchema = z.object({
  state_id: z.string().uuid(),
  date: z.string().transform(s => new Date(s)),
  overall_status: z.enum(['Verde','Amarillo','Rojo']),
  details_json: z.record(z.number().min(0).max(1)),
});
export type ComplianceState = z.infer<typeof ComplianceStateSchema>;

export const TaskSchema = z.object({
  task_id: z.string().uuid(),
  module: z.string(),
  description: z.string(),
  assigned_to: z.string().uuid(),
  due_date: z.string().transform(s => new Date(s)),
  status: z.enum(['pending','completed']),
});
export type Task = z.infer<typeof TaskSchema>;
