import { z } from 'zod';

export const IncidentSchema = z.object({
  incidentId: z.string().uuid(),
  source: z.string(),
  type: z.string(),
  severity: z.enum(['low','medium','high','critical']),
  payload: z.record(z.any()),
  timestamp: z.string().transform(s => new Date(s)),
  status: z.enum(['new','processing','resolved','failed']),
});
export type Incident = z.infer<typeof IncidentSchema>;

export const NotificationSchema = z.object({
  notifId: z.string().uuid(),
  incidentId: z.string().uuid(),
  authority: z.string(),
  channel: z.enum(['email','sms']),
  recipient: z.string(),
  queuedAt: z.string().transform(s => new Date(s)),
  sentAt: z.string().nullable().transform(s => s ? new Date(s) : null),
  status: z.enum(['queued','sent','failed']),
  response: z.string().nullable(),
});
export type Notification = z.infer<typeof NotificationSchema>;
