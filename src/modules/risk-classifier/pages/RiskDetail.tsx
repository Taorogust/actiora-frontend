// src/modules/risk-classifier/pages/RiskDetail.tsx
import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAssessment } from '../hooks/useRiskMetrics';
import { RiskCard } from '../components/RiskCard';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';

export default function RiskDetail() {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    // Si no hay ID, redirige al dashboard del módulo
    return <Navigate to="/risk-classifier" replace />;
  }

  // Hook específico para detalle de evaluación
  const {
    data: assessment,
    isLoading,
    isError,
    error,
    refetch,
  } = useAssessment(id);

  // Estado de carga
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        Cargando detalles de la evaluación…
      </div>
    );
  }

  // Error al traer datos
  if (isError) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">
          {error?.message ?? 'Error al cargar la evaluación.'}
        </p>
        <Button onClick={() => refetch()}>Reintentar</Button>
      </div>
    );
  }

  // Si no existe la evaluación (p.ej. ID inválido)
  if (!assessment) {
    return <Navigate to="/risk-classifier" replace />;
  }

  // SEO y metadata
  const shortId = assessment.id.slice(0, 8);
  return (
    <>
      <Helmet>
        <title>Evaluación #{shortId} | DataPort Wallet™</title>
        <meta
          name="description"
          content={`Detalle de la evaluación de riesgo #${shortId}`}
        />
      </Helmet>

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="text-sm text-gray-500 mb-4 flex items-center space-x-2"
      >
        <Link to="/risk-classifier" className="hover:underline">
          Dashboard
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="font-medium">
          Evaluación #{shortId}
        </span>
      </nav>

      <article className="space-y-6 p-4">
        {/* Botón volver */}
        <Button as={Link} to="/risk-classifier" variant="outline">
          ← Volver al Dashboard
        </Button>

        {/* Tarjeta de evaluación con manejo de errores */}
        <ErrorBoundary>
          <RiskCard assessment={assessment} />
        </ErrorBoundary>
      </article>
    </>
  );
}
