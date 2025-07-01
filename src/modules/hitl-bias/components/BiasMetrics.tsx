// src/modules/hitl-bias/components/BiasMetrics.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Download as DownloadIcon } from 'lucide-react';
import type { BiasMetric } from '../types';
import { useDPToast } from '@/components/common/toaster';
import { VisuallyHidden } from '@react-aria/utils';

/**
 * Visualiza métricas de sesgo:
 * - Selector de tipo de métrica
 * - Tabla accesible con destaque de umbrales excedidos
 * - Gráfico de líneas con umbral de referencia
 * - Export CSV/JSON
 * - Aviso aria-live de registros críticos
 */
export const BiasMetrics: React.FC<{ metrics: BiasMetric[] }> = ({ metrics }) => {
  const toast = useDPToast();
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const liveRef = useRef<HTMLDivElement>(null);

  const metricNames = useMemo(() => Array.from(new Set(metrics.map(m => m.metricName))), [metrics]);
  useEffect(() => {
    if (!selectedMetric && metricNames.length) {
      setSelectedMetric(metricNames[0]);
    }
  }, [metricNames, selectedMetric]);

  const data = useMemo(() => metrics.filter(m => m.metricName === selectedMetric), [metrics, selectedMetric]);

  const exceedCount = useMemo(() => data.filter(m => m.value > m.threshold).length, [data]);

  useEffect(() => {
    if (liveRef.current) {
      liveRef.current.textContent = `${exceedCount} métricas por encima del umbral en "${selectedMetric}"`;
    }
  }, [exceedCount, selectedMetric]);

  const exportCSV = () => {
    const headers = ['timestamp', 'value', 'threshold'];
    const rows = data.map(m => [m.timestamp, m.value.toFixed(2), m.threshold.toString()]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bias-${selectedMetric}-${Date.now()}.csv`;
    a.click();
    toast.success('CSV exportado', { ariaLive: 'polite' });
  };

  const exportJSON = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bias-${selectedMetric}-${Date.now()}.json`;
    a.click();
    toast.success('JSON exportado', { ariaLive: 'polite' });
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <label htmlFor="metric-select" className="font-medium">Métrica:</label>
        <select
          id="metric-select"
          value={selectedMetric}
          onChange={e => setSelectedMetric(e.target.value)}
          className="border rounded px-2 py-1"
          aria-label="Seleccionar métrica"
        >
          {metricNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={exportCSV} aria-label="Exportar tabla como CSV">
            <DownloadIcon className="w-4 h-4 mr-1" /> CSV
          </Button>
          <Button size="sm" variant="outline" onClick={exportJSON} aria-label="Exportar tabla como JSON">
            <DownloadIcon className="w-4 h-4 mr-1" /> JSON
          </Button>
        </div>
      </div>

      <VisuallyHidden role="status" aria-live="polite" ref={liveRef}>
        {exceedCount} métricas por encima del umbral en "{selectedMetric}"
      </VisuallyHidden>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table role="grid" aria-rowcount={data.length + 1} className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr role="row">
              <th role="columnheader" className="px-4 py-2 text-left">Fecha</th>
              <th role="columnheader" className="px-4 py-2 text-right">Valor</th>
              <th role="columnheader" className="px-4 py-2 text-right">Umbral</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m, idx) => (
              <tr
                key={m.id}
                role="row"
                tabIndex={0}
                className={`odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-900
                              focus:outline focus:outline-2 focus:outline-dp-blue`}
                aria-rowindex={idx + 2}
              >
                <td role="gridcell" className="px-4 py-2">
                  {new Date(m.timestamp).toLocaleDateString()}
                </td>
                <td
                  role="gridcell"
                  className={`px-4 py-2 text-right font-medium ${
                    m.value > m.threshold ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {m.value.toFixed(2)}
                </td>
                <td role="gridcell" className="px-4 py-2 text-right">
                  {m.threshold}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="w-full h-48 bg-white dark:bg-gray-800 rounded-lg shadow">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="timestamp"
              stroke="#666"
              tickFormatter={ts => new Date(ts).toLocaleDateString()}
            />
            <Tooltip labelFormatter={l => new Date(l).toLocaleString()} />
            {data[0] && (
              <ReferenceLine
                y={data[0].threshold}
                stroke="#f59e0b"
                label={{ position: 'right', value: 'Umbral', fill: '#f59e0b' }}
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2563EB"
              dot={{ r: 3 }}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
