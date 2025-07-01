// src/modules/norm-updater/pages/NormUpdaterPage.tsx
import React, { Suspense, useContext } from 'react';
import { NormProvider, NormContext } from '../context/NormContext';
import { useNormFetch } from '../hooks/useNormFetch';
import { Spinner } from '@/components/Spinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const VirtualVersionList = React.lazy(
  () => import('../components/VirtualVersionList')
);
const DiffWorkerViewer = React.lazy(
  () => import('../components/DiffWorkerViewer')
);
const AuditTaskManager = React.lazy(
  () => import('../components/AuditTaskManager')
);

export const NormUpdaterPage: React.FC = () => (
  <NormProvider>
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Actualizador Normativo</h1>
      <ErrorBoundary>
        <Main />
      </ErrorBoundary>
    </div>
  </NormProvider>
);

const Main: React.FC = () => {
  const {
    versions,
    isLoadingVersions,
    hasNext,       // boolean para infinite scroll
    loadMore,      // función para cargar más
    fetchLatest,   // mutación para descargar última versión
    isFetchingLatest,
    getContent,    // función para obtener contenido raw
  } = useNormFetch();

  const { selected } = useContext(NormContext);
  const [oldId, newId] = selected;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Sidebar: botón y listado de versiones */}
      <section className="col-span-1 space-y-4">
        <button
          onClick={() => fetchLatest()}
          disabled={isFetchingLatest}
          className="btn btn-primary w-full"
        >
          {isFetchingLatest ? 'Descargando…' : 'Obtener última versión'}
        </button>

        <Suspense fallback={<Spinner />}>
          <VirtualVersionList
            versions={versions}
            hasNext={hasNext}
            loadMore={loadMore}
          />
        </Suspense>
      </section>

      {/* Main: diff y scheduler */}
      <section className="col-span-2 space-y-4">
        {typeof oldId === 'number' && typeof newId === 'number' ? (
          <Suspense fallback={<Spinner />}>
            <DiffWorkerViewer
              oldId={oldId}
              newId={newId}
              loadContent={getContent}
            />
          </Suspense>
        ) : (
          <p className="italic text-gray-500">
            Selecciona dos versiones para ver las diferencias.
          </p>
        )}

        <Suspense fallback={<Spinner />}>
          <AuditTaskManager />
        </Suspense>
      </section>
    </div>
  );
};
