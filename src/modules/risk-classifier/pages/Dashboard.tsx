// src/modules/risk-classifier/pages/Dashboard.tsx
import React, { useState, useRef, Suspense, useMemo } from 'react';
import { RiskForm } from '../components/RiskForm';
import { RiskCard } from '../components/RiskCard';
import { RiskChart } from '../components/RiskChart';
import { useRiskMetrics } from '../hooks/useRiskMetrics';
import { useModelInfo } from '../hooks/useModelInfo';
import { DateRangePicker, DateRange } from '@/components/common/date-range-picker';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function Dashboard() {
  const { assessments, isLoadingAssessments, isErrorAssessments, errorAssessments } =
    useRiskMetrics();
  const { models, isLoadingModels } = useModelInfo();
  const formRef = useRef<HTMLFormElement>(null);

  // Filters & pagination
  const [filterModel, setFilterModel] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  // Filtered assessments
  const filtered = useMemo(() => {
    return assessments
      .filter(a => !filterModel || a.modelId === filterModel)
      .filter(a => {
        if (!dateRange.from && !dateRange.to) return true;
        const t = new Date(a.timestamp).getTime();
        if (dateRange.from && t < dateRange.from.getTime()) return false;
        if (dateRange.to && t > dateRange.to.getTime()) return false;
        return true;
      });
  }, [assessments, filterModel, dateRange]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="space-y-8">
      <ErrorBoundary>
        <Suspense fallback={<div className="p-6"><Skeleton height={200} /></div>}>
          <div ref={formRef}>
            <RiskForm onNewAssessment={scrollToForm} />
          </div>
        </Suspense>
      </ErrorBoundary>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold">Mis Evaluaciones</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={filterModel}
            onChange={e => { setFilterModel(e.target.value); setPage(1); }}
            disabled={isLoadingModels}
            className="w-48"
            aria-label="Filtrar por modelo"
          >
            <option value="">— Todos los modelos —</option>
            {models.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} v{m.version}
              </option>
            ))}
          </Select>
          <DateRangePicker
            selected={dateRange}
            onChange={setDateRange}
            renderAnchor={({ selected, onClick }) => (
              <Button variant="outline" size="sm" onClick={onClick} className="flex items-center gap-2">
                {selected.from ? selected.from.toLocaleDateString() : 'Desde'} –{' '}
                {selected.to ? selected.to.toLocaleDateString() : 'Hasta'}
              </Button>
            )}
          />
        </div>
      </div>

      {isLoadingAssessments ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} height={200} className="rounded-lg" />
          ))}
        </div>
      ) : isErrorAssessments ? (
        <div className="text-red-600">{errorAssessments?.message}</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center bg-yellow-50 rounded-lg">
          <p className="mb-4 text-lg">Aún no has evaluado ningún modelo.</p>
          <Button onClick={scrollToForm}>Empieza tu primera evaluación →</Button>
        </div>
      ) : (
        <>
          <ErrorBoundary>
            <Suspense fallback={<Skeleton height={300} />}>
              <RiskChart assessments={filtered} />
            </Suspense>
          </ErrorBoundary>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map(a => (
              <ErrorBoundary key={a.id}>
                <Suspense fallback={<Skeleton height={200} />}>
                  <RiskCard assessment={a} />
                </Suspense>
              </ErrorBoundary>
            ))}
          </div>

          {pageCount > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Anterior
              </Button>
              <span>
                Página {page} de {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === pageCount}
                onClick={() => setPage(p => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
