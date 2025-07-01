import React, { Suspense } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Container } from '@/components/common/container';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useAuditRecords } from '../hooks/useAuditRecords';
import { useVerifyRecord } from '../hooks/useVerifyRecord';
import { Button } from '@/components/ui/button';

export default function AuditDetail() {
  const { id } = useParams<{ id: string }>();
  const { records, isLoading: listLoading } = useAuditRecords();
  const { result, isLoading: verLoading, isError: verError, refetch } = useVerifyRecord(id);
  const record = records.find(r => r.id === id);

  if (!id) return <Navigate to="/audit-log" replace />;
  if (listLoading) return <p>Cargando…</p>;
  if (!record)   return <Navigate to="/audit-log" replace />;

  return (
    <Container className="py-6 space-y-4">
      <Helmet><title>Detalle {record.id.slice(0,8)} – Audit Log</title></Helmet>
      <Button as={Link} to="/audit-log" variant="outline">← Volver</Button>

      <ErrorBoundary>
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <h1 className="text-2xl font-semibold">Registro {record.id}</h1>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {Object.entries({
              Entidad: record.entity,
              'ID Entidad': record.entityId,
              Usuario: record.userId,
              'Modelo v': record.modelVersion,
              Timestamp: new Date(record.timestamp).toLocaleString(),
              Hash: record.payloadHash,
              Firma: record.signature,
            }).map(([dt, dd]) => (
              <div key={dt}>
                <dt className="font-medium">{dt}</dt>
                <dd className="break-all">{dd}</dd>
              </div>
            ))}
          </dl>

          <section>
            <h2 className="text-lg font-semibold">Verificación</h2>
            {verLoading ? (
              <p>Cargando estado…</p>
            ) : verError ? (
              <p className="text-red-600">Error al verificar.</p>
            ) : (
              <p role="status" className={result === 'valid' ? 'text-green-600' : 'text-red-600'}>
                Estado: {result}
              </p>
            )}
            <Button onClick={refetch} variant="outline" size="sm">Reintentar</Button>
          </section>
        </article>
      </ErrorBoundary>
    </Container>
  );
}
