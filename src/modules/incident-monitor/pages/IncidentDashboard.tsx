import React, { Suspense, lazy } from 'react';
import { IncidentProvider } from '../context/IncidentContext';
import { useIncidents } from '../hooks/useIncidents';
import { useNotifyAuthorities } from '../hooks/useNotifyAuthorities';
import { IncidentList } from '../components/IncidentList';
import { NotificationQueue } from '../components/NotificationQueue';
import { IncidentFilters } from '../components/IncidentFilters';
import { Pagination } from '../components/Pagination';
import { Spinner } from '@/components/Spinner';
import { ErrorBoundary } from '../components/ErrorBoundary';

const IncidentDetail = lazy(() => import('../components/IncidentDetail'));

export const IncidentDashboard: React.FC = () => (
  <IncidentProvider>
    <div className="container mx-auto py-8 space-y-6">
      <h2 className="text-2xl font-bold">📊 Monitor de Incidencias</h2>
      <IncidentFilters />
      <ErrorBoundary>
        <MainArea />
      </ErrorBoundary>
    </div>
  </IncidentProvider>
);

const MainArea: React.FC = () => {
  const { incidents, total, page, pageSize, hasNext, loadMore, isLoading, select, selected } = useIncidents();
  const { notify, retry } = useNotifyAuthorities();

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="col-span-2 bg-white p-4 rounded-lg shadow">
        <IncidentList incidents={incidents} isLoading={isLoading} hasNext={hasNext} loadMore={loadMore}/>
        <Pagination total={total} page={page} pageSize={pageSize} hasNext={hasNext} fetchNext={loadMore}/>
      </div>
      <div className="bg-white p-4 rounded-lg shadow h-[600px] overflow-auto">
        {selected ? (
          <Suspense fallback={<Spinner />}>
            <IncidentDetail incidentId={selected.incidentId} />
            <div className="mt-4">
              <h4 className="font-semibold mb-2">🔔 Cola de Notificaciones</h4>
              <NotificationQueue notifications={selected.notifications||[]} isRetrying={retry.isLoading} onRetry={retry.mutate}/>
              <button onClick={()=>notify.mutate({incidentId:selected.incidentId,authority:'CNBV',channel:'email'})} disabled={notify.isLoading} className="mt-3 btn btn-primary w-full">
                {notify.isLoading ? 'Encolando…' : 'Notificar Autoridad'}
              </button>
            </div>
          </Suspense>
        ) : (
          <p className="italic text-gray-500">Selecciona una incidencia para ver detalles.</p>
        )}
      </div>
    </div>
  );
};
