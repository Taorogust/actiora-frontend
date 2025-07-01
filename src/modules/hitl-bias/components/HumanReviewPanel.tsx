// src/modules/hitl-bias/components/HumanReviewPanel.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useReviewAssignment } from '../hooks/useReviewAssignment';
import type { ReviewTask } from '../types';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useDPToast } from '@/components/common/toaster';
import { useEstimatedReviewTime } from '../hooks/useEstimatedReviewTime';

interface Props {
  task: ReviewTask;
  reviewerId: string;
}

/**
 * Panel para que un humano revise y apruebe/rechace una tarea IA.
 * - Validación de comentarios (mínimo 5, máximo 500 caracteres)
 * - Undo de última acción antes de confirmación
 * - Indicador de tiempo estimado de revisión
 */
export const HumanReviewPanel: React.FC<Props> = ({ task, reviewerId }) => {
  const [comments, setComments] = useState('');
  const [lastAction, setLastAction] = useState<null | { status: 'approved' | 'rejected'; comments: string }>(null);
  const [errorMsg, setErrorMsg] = useState<string>();
  const { reviewTask, isReviewing } = useReviewAssignment();
  const toast = useDPToast();
  const estimatedTime = useEstimatedReviewTime(); // p.ej. hook que devuelve "2m 30s"

  // Validate comments length
  const commentError = comments.length > 0 && (comments.length < 5 || comments.length > 500)
    ? 'Los comentarios deben tener entre 5 y 500 caracteres.'
    : '';

  const canSubmit = !isReviewing && !commentError && task.status === 'pending';

  const handleAction = useCallback(async (status: 'approved' | 'rejected') => {
    if (!canSubmit) return;
    setErrorMsg(undefined);
    setLastAction({ status, comments });

    try {
      await reviewTask({ taskId: task.id, reviewerId, status, comments });
      toast.success(`Tarea ${status === 'approved' ? 'aprobada' : 'rechazada'}`, { ariaLive: 'polite' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error en la revisión');
      toast.error('Error al enviar la revisión', { ariaLive: 'assertive' });
      // Rollback optimistic state happens inside hook
    }
  }, [canSubmit, comments, reviewerId, reviewTask, task.id, toast]);

  const handleUndo = useCallback(() => {
    if (!lastAction) return;
    // Reset to pending and clear comments
    setComments(lastAction.comments);
    setLastAction(null);
    toast.info('Última acción deshecha', { ariaLive: 'polite' });
  }, [lastAction, toast]);

  return (
    <ErrorBoundary>
      <article
        role="region"
        aria-label={`Revisión de tarea ${task.id}`}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4"
      >
        <header className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Tarea {task.id.slice(0, 8)}</h2>
          <span
            className={`px-2 py-1 text-sm rounded ${
              task.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : task.status === 'approved'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {task.status}
          </span>
        </header>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-medium">Modelo</dt>
            <dd>{task.modelId}</dd>
          </div>
          <div>
            <dt className="font-medium">Riesgo</dt>
            <dd>{task.riskLevel}</dd>
          </div>
          <div>
            <dt className="font-medium">Input</dt>
            <dd className="font-mono text-xs truncate">{JSON.stringify(task.input)}</dd>
          </div>
          <div>
            <dt className="font-medium">Output</dt>
            <dd className="font-mono text-xs truncate">{JSON.stringify(task.output)}</dd>
          </div>
        </dl>

        {task.status === 'pending' && (
          <section aria-labelledby="review-actions" className="space-y-4">
            <h3 id="review-actions" className="font-medium">Comentarios (mín. 5, máx. 500 caracteres)</h3>
            <Textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              placeholder="Añade tus comentarios..."
              aria-label="Comentarios del revisor"
              disabled={isReviewing}
            />
            {commentError && <p className="text-red-600 text-sm">{commentError}</p>}
            {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="solid"
                disabled={!canSubmit}
                onClick={() => handleAction('approved')}
                aria-disabled={!canSubmit}
              >
                {isReviewing ? 'Procesando…' : 'Aprobar'}
              </Button>
              <Button
                variant="outline"
                disabled={!canSubmit}
                onClick={() => handleAction('rejected')}
                aria-disabled={!canSubmit}
              >
                {isReviewing ? 'Procesando…' : 'Rechazar'}
              </Button>
              {lastAction && !isReviewing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUndo}
                  aria-label="Deshacer última acción"
                >
                  Deshacer
                </Button>
              )}
              <span className="ml-auto text-gray-500 text-sm">
                Tiempo estimado: {estimatedTime}
              </span>
            </div>
          </section>
        )}
      </article>
    </ErrorBoundary>
  );
};
