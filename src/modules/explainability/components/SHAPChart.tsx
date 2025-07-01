// src/modules/explainability/components/SHAPChart.tsx
import React, { useCallback, useRef, useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
  LabelList,
  Legend,
} from 'recharts';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { VisuallyHidden } from '@react-aria/utils';
import type { ChartData } from '../types';

const POS_COLOR = '#1E40AF';  // Azul oscuro para mejor contraste
const NEG_COLOR = '#991B1B';  // Rojo oscuro para mejor contraste

type Interval = 'week' | 'month' | 'all';
const INTERVAL_OPTIONS: Record<Interval, { label: string; days?: number }> = {
  week:  { label: 'Última semana', days: 7 },
  month: { label: 'Último mes',    days: 30 },
  all:   { label: 'Todo el período' }
};

interface SHAPChartProps {
  data: ChartData[];
}

export const SHAPChart: React.FC<SHAPChartProps> = ({ data }) => {
  const [interval, setInterval] = useState<Interval>('all');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filtrar datos según intervalo
  const filtered = useMemo(() => {
    if (interval === 'all') return data;
    const cutoff = Date.now() - (INTERVAL_OPTIONS[interval].days! * 24 * 60 * 60 * 1000);
    return data.filter(d => new Date(d.timestamp).getTime() >= cutoff);
  }, [data, interval]);

  // Payload para leyenda
  const legendPayload = [
    { value: `Positivo (${filtered.filter(d => d.value >= 0).length})`, type: 'square', color: POS_COLOR },
    { value: `Negativo (${filtered.filter(d => d.value <  0).length})`, type: 'square', color: NEG_COLOR },
  ];

  // Exportar gráfico como PNG
  const handleExport = useCallback(async () => {
    if (!wrapperRef.current) return;
    try {
      const uri = await toPng(wrapperRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.href = uri;
      link.download = `shap-chart-${interval}.png`;
      link.click();
    } catch (err) {
      console.error('Error exportando gráfico:', err);
    }
  }, [interval]);

  return (
    <section className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
      <VisuallyHidden id="shap-chart-desc">
        Gráfico horizontal que muestra las contribuciones SHAP de cada característica filtradas por intervalo de tiempo.
      </VisuallyHidden>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Contribuciones SHAP
        </h4>

        <div className="flex items-center gap-3">
          <label htmlFor="shap-interval" className="sr-only">
            Seleccionar intervalo de visualización
          </label>
          <select
            id="shap-interval"
            value={interval}
            onChange={e => setInterval(e.target.value as Interval)}
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-dp-blue"
            aria-label="Seleccionar intervalo"
          >
            {Object.entries(INTERVAL_OPTIONS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          <button
            onClick={handleExport}
            aria-label="Exportar gráfico como imagen"
            className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-dp-blue hover:bg-gray-50"
          >
            Exportar
          </button>
        </div>
      </div>

      <div
        ref={wrapperRef}
        role="img"
        aria-labelledby="shap-chart-desc"
        className="w-full h-64"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={filtered}
            margin={{ top: 5, right: 20, bottom: 5, left: 100 }}
          >
            <XAxis type="number" stroke="#666" />
            <YAxis
              dataKey="feature"
              type="category"
              width={120}
              stroke="#666"
            />
            <RechartsTooltip
              formatter={(value: number) => [`${value}`, 'Valor SHAP']}
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              payload={legendPayload}
            />
            <Bar dataKey="value" animationDuration={800} animationEasing="ease-in-out">
              {filtered.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={entry.value >= 0 ? POS_COLOR : NEG_COLOR}
                />
              ))}
              <LabelList dataKey="value" position="right" fill="#333" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default SHAPChart;
