// src/modules/risk-classifier/components/RiskCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Tooltip } from '@/components/ui/tooltip';
import { useModelInfo } from '../hooks/useModelInfo';
import { useAuth } from '@/providers/auth-provider';
import type { Assessment, RiskLevel } from '../types';

const COLOR: Record<RiskLevel, string> = {
  Bajo: 'text-green-600',
  Medio: 'text-yellow-600',
  Alto: 'text-red-600',
};

interface RiskCardProps {
  /** Si true, muestra un placeholder skeleton */
  loading?: boolean;
  /** Objeto de evaluación; omitir o undefined para skeleton */
  assessment?: Assessment;
}

export const RiskCard: React.FC<RiskCardProps> = ({ assessment, loading = false }) => {
  const { models } = useModelInfo();
  const { user } = useAuth();

  // Skeleton placeholder mientras carga
  if (loading || !assessment) {
    return (
      <article className="p-6 bg-white rounded-lg shadow animate-pulse" aria-busy="true">
        <Skeleton height={24} width={160} className="mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton height={16} width={80} />
          <Skeleton height={16} width={100} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Skeleton height={16} width={120} />
          <Skeleton height={16} width={100} />
        </div>
      </article>
    );
  }

  // Enlace al detalle de la evaluación
  const detailUrl = `/risk-classifier/${assessment.id}`;
  // Localizar metadata del modelo
  const model = models.find((m) => m.id === assessment.modelId);

  return (
    <Link
      to={detailUrl}
      aria-labelledby={`riskcard-title-${assessment.id}`}
      className="block focus:outline-none focus:ring-2 focus:ring-dp-blue rounded"
    >
      <article className="p-6 bg-white rounded-lg shadow hover:shadow-xl transition-shadow duration-200">
        <header className="flex items-center justify-between mb-4">
          <h3
            id={`riskcard-title-${assessment.id}`}
            className="text-xl font-bold text-gray-800"
          >
            Evaluación #{assessment.id.slice(0, 8)}
          </h3>
          <time
            dateTime={assessment.timestamp}
            className="text-sm text-gray-500"
          >
            {new Date(assessment.timestamp).toLocaleString()}
          </time>
        </header>

        <dl className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <dt className="font-medium text-gray-700">Score</dt>
            <dd className="mt-1 text-gray-900">{assessment.score}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-700">Nivel de riesgo</dt>
            <dd className={`mt-1 font-semibold ${COLOR[assessment.riskLevel]}`}>
              <Tooltip content={`Nivel ${assessment.riskLevel}`}>
                <span>{assessment.riskLevel}</span>
              </Tooltip>
            </dd>
          </div>
          {model && (
            <div>
              <dt className="font-medium text-gray-700">Modelo</dt>
              <dd className="mt-1">
                <Link
                  to={`/risk-classifier/models/${model.id}`}
                  className="text-dp-blue hover:underline"
                >
                  {model.name} v{model.version}
                </Link>
              </dd>
            </div>
          )}
          <div>
            <dt className="font-medium text-gray-700">Evaluado por</dt>
            <dd className="mt-1 text-gray-900">
              {user?.name ?? 'Sistema Automático'}
            </dd>
          </div>
        </dl>
      </article>
    </Link>
  );
};

export default RiskCard;
