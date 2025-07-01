// src/modules/explainability/pages/PublicExplainPage.tsx
import React, { Suspense } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Container } from '@/components/common/container';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { usePublicPortal } from '../hooks/usePublicPortal';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/common/breadcrumbs';

// Lazy-load de los componentes pesados
const ExplanationViewer = React.lazy(() => import('../components/ExplanationViewer'));
const SHAPChart         = React.lazy(() => import('../components/SHAPChart'));

export default function PublicExplainPage() {
  const { id } = useParams<{ id: string }>();
  const { explanation, isLoading, isError, refetch } = usePublicPortal(id);

  // Redirecciones tempranas
  if (!id) return <Navigate to="/" replace />;
  if (isLoading) {
    return (
      <Container className="py-6 text-center">
        <p>Cargando explicación pública…</p>
      </Container>
    );
  }
  if (isError || !explanation) {
    return (
      <Container className="py-6 text-center">
        <p className="text-red-600 mb-4">No se encontró la explicación.</p>
        <Button onClick={() => refetch()}>Reintentar</Button>
      </Container>
    );
  }

  // JSON-LD para SEO y cumplimiento AI Act Art.15
  const jsonLD = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    'identifier': explanation.id,
    'description': explanation.text,
    'dateCreated': explanation.timestamp,
    'creator': {
      '@type': 'Organization',
      'name': 'DataPort Wallet'
    }
  };

  return (
    <Container className="space-y-6 py-6">
      <Helmet>
        <title>Explicación {explanation.id.slice(0,8)} – Transparencia IA</title>
        <meta
          name="description"
          content={explanation.text.slice(0, 120)}
        />
        <script type="application/ld+json">
          {JSON.stringify(jsonLD)}
        </script>
      </Helmet>

      {/* Migas de pan accesibles */}
      <Breadcrumbs
        items={[
          { label: 'Inicio', to: '/' },
          { label: 'Explicaciones', to: '/explainability' },
          { label: explanation.id.slice(0,8), to: `/public/${explanation.id}` },
        ]}
        aria-label="Migas de pan"
      />

      <ErrorBoundary>
        {/* Explicación en texto */}
        <Suspense
          fallback={
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-48 rounded-lg" />
          }
        >
          <ExplanationViewer text={explanation.text} />
        </Suspense>

        {/* Gráfico SHAP */}
        <Suspense
          fallback={
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg mt-4" />
          }
        >
          <SHAPChart data={explanation.chartData} />
        </Suspense>
      </ErrorBoundary>
    </Container>
  );
}
