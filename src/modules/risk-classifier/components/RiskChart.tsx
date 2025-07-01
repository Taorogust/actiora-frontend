// src/modules/risk-classifier/components/RiskChart.tsx
import React, { useState, useMemo, useRef } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  Cell,
  LabelList,
} from 'recharts';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import type { Assessment, RiskLevel } from '../types';

const COLORS: Record<RiskLevel, string> = {
  Bajo: '#047857',   // Emerald 700 – mejor contraste
  Medio: '#B45309',  // Amber 700
  Alto: '#B91C1C',   // Red 700
};

type Interval = 'week' | 'month' | 'all';

const INTERVAL_OPTIONS: Record<Interval, { label: string; days?: number }> = {
  week:  { label: 'Última semana', days: 7  },
  month: { label: 'Último mes',    days: 30 },
  all:   { label: 'Todo el período'         },
};

interface RiskChartProps {
  assessments: Assessment[];
}

export const RiskChart: React.FC<RiskChartProps> = ({ assessments }) => {
  const [interval, setInterval] = useState<Interval>('all');
  const chartRef = useRef<HTMLDivElement>(null);

  // Filtrar según intervalo
  const filtered = useMemo(() => {
    if (interval === 'all') return assessments;
    const days = INTERVAL_OPTIONS[interval].days!;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return assessments.filter(a => new Date(a.timestamp).getTime() >= cutoff);
  }, [assessments, interval]);

  // Preparar datos
  const data = useMemo(() => {
    const counts: Record<RiskLevel, number> = { Bajo: 0, Medio: 0, Alto: 0 };
    filtered.forEach(a => { counts[a.riskLevel]++; });
    return (Object.entries(counts) as [RiskLevel, number][])
      .map(([level, count]) => ({ level, count }));
  }, [filtered]);

  // Leyenda personalizada
  const legendPayload = (Object.keys(COLORS) as RiskLevel[]).map(level => ({
    value: `${level} (${data.find(d => d.level === level)?.count ?? 0})`,
    type: 'square',
    color: COLORS[level],
  }));

  // Descripción accesible
  const ariaDesc = useMemo(() => {
    const c = data.reduce<Record<RiskLevel, number>>((acc, { level, count }) => {
      acc[level] = count;
      return acc;
    }, { Bajo: 0, Medio: 0, Alto: 0 });
    return `Gráfico de barras que muestra ${c.Bajo} evaluaciones de nivel Bajo, ` +
           `${c.Medio} evaluaciones de nivel Medio y ${c.Alto} evaluaciones de nivel Alto.`;
  }, [data]);

  // Exportar a PNG
  const handleExport = async () => {
    if (!chartRef.current) return;
    try {
      const dataUrl = await toPng(chartRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `risk-chart-${interval}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error exporting chart:', err);
    }
  };

  return (
    <section className="bg-white rounded-lg shadow p-6">
      {/* Header y controles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-800">Distribución de Riesgos</h4>
        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          <select
            value={interval}
            onChange={e => setInterval(e.target.value as Interval)}
            className="border rounded px-2 py-1"
            aria-label="Seleccionar intervalo"
          >
            {Object.entries(INTERVAL_OPTIONS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            aria-label="Exportar gráfico como imagen"
          >
            Exportar imagen
          </Button>
        </div>
      </div>

      {/* Gráfico con descripción accesible */}
      <div
        ref={chartRef}
        className="w-full h-64"
        role="img"
        aria-label={ariaDesc}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="level" stroke="#444" />
            <YAxis allowDecimals={false} stroke="#444" />
            <RechartsTooltip
              formatter={(value: number) => [`${value}`, 'Cantidad']}
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              payload={legendPayload}
              iconType="square"
            />
            <Bar
              dataKey="count"
              animationDuration={800}
              animationEasing="ease-in-out"
            >
              {data.map((entry, idx) => (
                <Cell key={idx} fill={COLORS[entry.level]} />
              ))}
              <LabelList dataKey="count" position="top" fill="#333" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default RiskChart;
