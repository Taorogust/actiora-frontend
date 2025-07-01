import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignReviewTask } from '../services/hitlService';
import type { ReviewTask } from '../types';

/** Hook para aprobar o rechazar tareas HITL */
export function useReviewAssignment() {
  const qc = useQueryClient();
  const mutation = useMutation<ReviewTask, Error, {
    taskId: string;
    reviewerId: string;
    status: 'approved' | 'rejected';
    comments?: string;
  }>(
    params => assignReviewTask(params.taskId, params.reviewerId, params.status, params.comments),
    { onSuccess: () => qc.invalidateQueries(['reviewTasks']) }
  );
  return {
    reviewTask: mutation.mutateAsync,
    isReviewing: mutation.isLoading,
    errorReview: mutation.error,
  };
}
