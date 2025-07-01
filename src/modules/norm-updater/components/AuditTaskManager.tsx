// src/modules/norm-updater/components/AuditTaskManager.tsx
import React, { useContext } from 'react';
import { useSchedulerStatus } from '../hooks/useSchedulerStatus';
import { Cron } from 'react-js-cron';
import 'react-js-cron/dist/styles.css';
import { NormContext } from '../context/NormContext';
import { Badge } from '@/components/Badge';

export const AuditTaskManager: React.FC = () => {
  const { tasks } = useContext(NormContext);
  const { schedule, isScheduling, run, isRunning } = useSchedulerStatus();

  return (
    <div className="space-y-4">
      <Cron onChange={cron=>schedule(cron)} value="" />
      <ul className="space-y-2">
        {tasks.map(t=>(
          <li key={t.task_id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <div>
              <Badge variant={t.status}>{t.status}</Badge>
              <span className="ml-2">{t.cron}</span>
            </div>
            <button onClick={()=>run(t.task_id)} disabled={isRunning} className="btn btn-sm">
              {isRunning?'⏳ Running':'▶️ Run'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
