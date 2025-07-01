// src/modules/audit-log/pages/AuditList.tsx
import React, { Suspense, lazy, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container } from '@/components/common/container';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useAuditRecords } from '../hooks/useAuditRecords';
import { AuditFilter, FormValues as AuditFilterValues } from '../components/AuditFilter';
import { AuditTable } from '../components/AuditTable';
import { Button } from '@/components/ui/button';
import { useSearchParams, Link } from 'react-router-dom';

const ExportButtons = lazy(() => import('../components/ExportButtons'));

const PAGE_SIZE = 20;

export default function AuditList() {
  const { records, isLoading, isError, error } = useAuditRecords();
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters & pagination from URL
  const entityParam = searchParams.get('entity') || '';
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const filters: AuditFilterValues = {
    entity: entityParam || undefined,
    from: fromParam ? new Date(fromParam) : undefined,
    to:   toParam   ? new Date(toParam)   : undefined,
  };

  // Apply filters
  const filtered = useMemo(() => {
    return records.filter(r => {
      if (filters.entity && !r.entity.includes(filters.entity)) return false;
      const ts = new Date(r.timestamp).getTime();
      if (filters.from && ts < filters.from.getTime()) return false;
      if (filters.to   && ts > filters.to.getTime())   return false;
      return true;
    });
  }, [records, filters]);

  // Paginate
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const currentPage = Math.min(Math.max(pageParam, 1), totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  // Sync URL params when filters or page change
  const updateParams = (newFilters: AuditFilterValues, page = 1) => {
    const params = new URLSearchParams();
    if (newFilters.entity) params.set('entity', newFilters.entity);
    if (newFilters.from)   params.set('from', newFilters.from.toISOString());
    if (newFilters.to)     params.set('to',   newFilters.to.toISOString());
    if (page > 1)          params.set('page', String(page));
    setSearchParams(params, { replace: true });
  };

  // when URL changes externally, scroll to top
  useEffect(() => window.scrollTo(0, 0), [searchParams]);

  // Handler for AuditFilter
  const handleFilter = (vals: AuditFilterValues) => {
    updateParams(vals, 1);
  };

  // Pagination controls
  const goToPage = (p: number) => updateParams(filters, p);

  return (
    <Container className="space-y-6 py-6">
      <Helmet><title>Audit Log – DataPort Wallet™</title></Helmet>

      <ErrorBoundary>
        <Suspense fallback={<div>Cargando filtros…</div>}>
          <AuditFilter onFilter={handleFilter} defaultValues={filters} />
        </Suspense>
      </ErrorBoundary>

      {isError && <p className="text-red-600">Error: {error?.message}</p>}

      {/* CTA cuando no hay registros */}
      {!isLoading && filtered.length === 0 ? (
        <div className="p-6 bg-blue-50 border border-blue-200 text-center rounded-lg">
          <p className="mb-4 text-blue-800 font-medium">
            No hay registros de auditoría.
          </p>
          <Link to="/audit-log/new">
            <Button variant="solid">Crear primer registro</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Registros ({filtered.length})
            </h2>
            <ErrorBoundary>
              <Suspense fallback={<div>Cargando export…</div>}>
                <ExportButtons records={filtered} />
              </Suspense>
            </ErrorBoundary>
          </div>

          <ErrorBoundary>
            <Suspense fallback={<div>Cargando tabla…</div>}>
              <AuditTable records={paginated} isLoading={isLoading} />
            </Suspense>
          </ErrorBoundary>

          {/* Paginación */}
          {totalPages > 1 && (
            <nav
              className="flex justify-center space-x-2 mt-4"
              aria-label="Paginación de registros"
            >
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                Anterior
              </Button>
              <span className="px-3 py-1">{currentPage} / {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                Siguiente
              </Button>
            </nav>
          )}
        </>
      )}
    </Container>
  );
}
