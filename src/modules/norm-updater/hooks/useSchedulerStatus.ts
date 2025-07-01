// src/modules/norm-updater/hooks/useSchedulerStatus.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasks, scheduleTask, runTask } from '../services/normService';
import { toast } from 'react-toastify';

export function useSchedulerStatus() {
  const qc = useQueryClient();
  const q = useQuery(['auditTasks'], getTasks, {
    refetchInterval: 60000,
    onError: e=>toast.error(`Scheduler: ${e.message}`)
  });
  const sch = useMutation(scheduleTask, {
    onSuccess: ()=>{ qc.invalidateQueries(['auditTasks']); toast.success('Scheduled'); }
  });
  const run = useMutation(runTask, {
    onSuccess: ()=>{ qc.invalidateQueries(['auditTasks']); toast.success('Ran!'); }
  });
  return { 
    tasks: q.data ?? [], isLoading: q.isLoading,
    schedule: sch.mutateAsync, isScheduling: sch.isLoading,
    run: run.mutateAsync, isRunning: run.isLoading
  };
}
