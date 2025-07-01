// src/modules/compliance-dashboard/hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasks, upsertTask, completeTask } from '../services/complianceService';
import type { Task } from '../types';
import { toast } from 'react-toastify';

export function useTasks() {
  const qc = useQueryClient();
  const q = useQuery<Task[],Error>(['tasks'], getTasks, {
    staleTime:300000, onError:e=>toast.error(e.message)
  });
  const save = useMutation(upsertTask, {
    onSuccess:t=>{ qc.invalidateQueries(['tasks','complianceState']); toast.success('Tarea guardada'); }
  });
  const comp = useMutation(completeTask, {
    onSuccess:t=>{ qc.invalidateQueries(['tasks','complianceState']); toast.success('Tarea completada'); }
  });
  return {
    tasks: q.data ?? [],
    isLoading: q.isLoading,
    saveTask: save.mutateAsync,
    isSaving: save.isLoading,
    completeTask: comp.mutateAsync,
    isCompleting: comp.isLoading
  };
}
