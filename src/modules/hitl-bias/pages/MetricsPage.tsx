// src/modules/hitl-bias/pages/MetricsPage.tsx
import React, { Suspense, useState, useMemo, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container } from '@/components/common/container';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useBiasMetrics } from '../hooks/useBiasMetrics';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { toPng } from 'html-to-image';
import { useDPToast } from '@/components/common/toaster';
import { Download, FileText } from 'lucide-react';
import type { BiasMetric } from '../types';

const BiasMetrics = React.lazy(() => import('../components/BiasMetrics'));

const INTERVALS = [
  { key: '24h', label: 'Últimas 24h', ms: 24 * 60 * 60 * 1000 },
  { key: '7d', label: 'Últimos 7 días', ms: 7 * 24 * 60 * 60 * 1000 },
  { key: '30d', label: 'Últimos 30 días', ms: 30 * 24 * 60 * 60 * 1000 },
  { key: 'all', label: 'Todo el período', ms: undefined },
];

export default function MetricsPage() {
  const toast = useDPToast();
  const { metrics, isLoading, isError, error, refetch } = useBiasMetrics();
  const [interval, setInterval] = useState<string>('all');
  const chartRef = useRef<HTMLDivElement>(null);

  // Filtrar métricas según intervalo
  const filtered = useMemo(() => {
    const opt = INTERVALS.find(i => i.key === interval);
    if (!opt || opt.ms === undefined) return metrics;
    const cutoff = Date.now() - opt.ms;
    return metrics.filter(m => new Date(m.timestamp).getTime() >= cutoff);
  }, [metrics, interval]);

  // Alertas si alguna métrica excede su umbral
  useMemo(() => {
    filtered.forEach(m => {
      if (m.value > m.threshold) {
        toast.warning(
          `¡${m.metricName} excede umbral (${m.value.toFixed(2)} > ${m.threshold})!`,
          { ariaLive: 'assertive' }
        );
      }
    });
  }, [filtered, toast]);

  // Exportar gráfico a PNG
  const handleExportImage = useCallback(async () => {
    if (!chartRef.current) return;
    try {
      const dataUrl = await toPng(chartRef.current, { cacheBust: true });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `bias-metrics-${interval}.png`;
      a.click();
    } catch {
      toast.error('Error al exportar imagen', { ariaLive: 'assertive' });
    }
  }, [interval, toast]);

  // Exportar métricas a CSV
  const handleExportCSV = useCallback(() => {
    const headers = ['id','metricName','value','threshold','timestamp'];
    const rows = filtered.map(m => [
      m.id,
      m.metricName,
      m.value.toFixed(2),
      m.threshold.toString(),
      m.timestamp,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bias-metrics-${interval}.csv`;
    a.click();
  }, [filtered, interval]);

  return (
    <Container className="space-y-6 py-6">
      <Helmet>
        <title>Métricas de Sesgo – DataPort Wallet™</title>
      </Helmet>

      {/* Controles: intervalo y export */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Select
          value={interval}
          onChange={e => setInterval(e.target.value)}
          aria-label="Seleccionar intervalo de tiempo"
        >
          {INTERVALS.map(opt => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </Select>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportImage}
            aria-label="Exportar gráfico como imagen"
          >
            <Download className="w-4 h-4 mr-1" /> Imagen
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            aria-label="Exportar métricas como CSV"
          >
            <FileText className="w-4 h-4 mr-1" /> CSV
          </Button>
        </div>
      </div>

      {/* Estado de carga / error */}
      {isError && (
        <div className="text-red-600">
          {error?.message}{' '}
          <Button variant="link" onClick={() => refetch()} aria-label="Reintentar carga">
            Reintentar
          </Button>
        </div>
      )}
      {isLoading && <p className="text-center text-gray-500">Cargando métricas…</p>}

      {/* CTA si no hay datos */}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-10">
          <p>No hay métricas para el intervalo seleccionado.</p>
          <Button onClick={() => refetch()}>Recargar</Button>
        </div>
      )}

      {/* Gráfico */}
      {!isLoading && filtered.length > 0 && (
        <ErrorBoundary>
          <div ref={chartRef}>
            <Suspense fallback={<p>Cargando gráfico…</p>}>
              <BiasMetrics metrics={filtered as BiasMetric[]} />
            </Suspense>
          </div>
        </ErrorBoundary>
      )}
    </Container>
  );
}
