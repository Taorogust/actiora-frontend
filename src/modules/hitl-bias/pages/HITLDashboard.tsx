// src/modules/hitl-bias/pages/HITLDashboard.tsx
import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container } from '@/components/common/container';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useReviewTasks } from '../hooks/useReviewTasks';
import { useDPToast } from '@/components/common/toaster';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Breadcrumbs, Breadcrumb } from '@/components/common/breadcrumbs';

const HumanReviewPanel = React.lazy(() => import('../components/HumanReviewPanel'));

export default function HITLDashboard() {
  const toast = useDPToast();
  const {
    tasks,
    isLoading,
    isError,
    error,
    refetch: reloadTasks,
  } = useReviewTasks();

  // Filters: status & model
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modelFilter, setModelFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Persist filters & page in sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('hitlDashState');
    if (saved) {
      const { status, model, page } = JSON.parse(saved);
      setStatusFilter(status);
      setModelFilter(model);
      setPage(page);
    }
  }, []);
  useEffect(() => {
    sessionStorage.setItem(
      'hitlDashState',
      JSON.stringify({ status: statusFilter, model: modelFilter, page })
    );
  }, [statusFilter, modelFilter, page]);

  // Auto-refresh every 60s
  useEffect(() => {
    const id = setInterval(() => {
      reloadTasks();
      toast.info('Refrescando tareas...', { ariaLive: 'polite' });
    }, 60000);
    return () => clearInterval(id);
  }, [reloadTasks, toast]);

  const filtered = React.useMemo(() => {
    return tasks.filter(t => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (modelFilter && t.modelId !== modelFilter) return false;
      return true;
    });
  }, [tasks, statusFilter, modelFilter]);

  const paginated = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleRetry = useCallback(() => {
    reloadTasks();
    toast.success('Reintentando carga de tareas', { ariaLive: 'assertive' });
  }, [reloadTasks, toast]);

  return (
    <Container className="space-y-6 py-6">
      <Helmet>
        <title>Supervisión Humana – DataPort Wallet™</title>
      </Helmet>

      <Breadcrumbs aria-label="Migas de pan">
        <Breadcrumb to="/">Inicio</Breadcrumb>
        <Breadcrumb>Supervisión Humana</Breadcrumb>
      </Breadcrumbs>

      <div className="flex flex-wrap items-center gap-4">
        <Select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          aria-label="Filtrar por estado"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobado</option>
          <option value="rejected">Rechazado</option>
        </Select>
        <input
          type="text"
          placeholder="Filtrar por Model ID"
          value={modelFilter}
          onChange={e => { setModelFilter(e.target.value); setPage(1); }}
          className="border rounded px-3 py-1"
          aria-label="Filtrar por identificador de modelo"
        />
        <Button variant="outline" size="sm" onClick={() => { setStatusFilter('all'); setModelFilter(''); setPage(1); }}>
          Limpiar filtros
        </Button>
      </div>

      {isError && (
        <div className="text-red-600">
          {error?.message}{' '}
          <Button variant="link" onClick={handleRetry} aria-label="Reintentar carga de tareas">
            Reintentar
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="text-center text-gray-500 py-10">Cargando tareas de revisión…</div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-10">
          <p className="mb-4">No hay tareas pendientes con los filtros actuales.</p>
          <Button onClick={handleRetry}>Recargar tareas</Button>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map(task => (
              <ErrorBoundary key={task.id}>
                <Suspense
                  fallback={
                    <div className="p-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
                  }
                >
                  <HumanReviewPanel task={task} />
                </Suspense>
              </ErrorBoundary>
            ))}
          </div>

          <nav aria-label="Paginación de tareas" className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <span aria-live="polite">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </Button>
          </nav>
        </>
      )}
    </Container>
  );
}
