import React from 'react';
import type { Notification } from '../types';
import { Spinner } from '@/components/Spinner';
import { Button } from '@/components/Button';

interface Props { notifications: Notification[]; isRetrying: boolean; onRetry(id:string):void; }
export const NotificationQueue: React.FC<Props> = ({ notifications, isRetrying, onRetry }) => {
  if (!notifications.length) return <p className="italic text-gray-500">Sin notificaciones.</p>;
  return (
    <ul className="space-y-3">
      {notifications.map(n=>(
        <li key={n.notifId} className="flex justify-between p-3 bg-white rounded-lg shadow-sm">
          <div>
            <p><strong>{n.authority}</strong> via {n.channel}</p>
            <small className="text-gray-500">{n.queuedAt.toLocaleString()} — {n.status}</small>
            {n.response && <blockquote className="mt-1 italic">{n.response}</blockquote>}
          </div>
          {n.status==='failed' && (
            <Button size="sm" variant="outline-warning" onClick={()=>onRetry(n.notifId)} disabled={isRetrying}>
              {isRetrying ? <Spinner size="sm"/> : 'Reintentar'}
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
};
