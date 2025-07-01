// src/modules/hitl-bias/components/AuditIntegration.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAuditRecords } from '@/modules/audit-log/services/auditService';
import { getAssessments } from '@/modules/risk-classifier/services/riskService';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { Button } from '@/components/ui/button';
import type { ReviewTask } from '../types';
import type { AuditRecord } from '@/modules/audit-log/types';
import type { Assessment } from '@/modules/risk-classifier/types';

interface AuditIntegrationProps {
  task: ReviewTask;
}

/**
 * Widget que muestra enlaces a:
 * - Registros de auditoría relacionados con la decisión
 * - Última evaluación de riesgo del modelo asociado
 */
export const AuditIntegration: React.FC<AuditIntegrationProps> = ({ task }) => {
  // Fetch audit logs for this decision
  const {
    data: logs = [],
    isLoading: logsLoading,
    isError: logsError,
  } = useQuery<AuditRecord[], Error>(
    ['auditLogs', task.decisionId],
    () => getAuditRecords(),
    {
      select: all => all.filter(r => r.entity === 'decision' && r.entityId === task.decisionId),
      staleTime: 5 * 60_000,
      retry: 1,
    }
  );

  // Fetch risk assessments for this model
  const {
    data: assessments = [],
    isLoading: asmtLoading,
    isError: asmtError,
  } = useQuery<Assessment[], Error>(
    ['assessments', task.modelId],
    () => getAssessments(),
    {
      select: all => all.filter(a => a.modelId === task.modelId),
      staleTime: 5 * 60_000,
      retry: 1,
    }
  );

  const latest = assessments[0];

  return (
    <ErrorBoundary>
      <motion.section
        role="region"
        aria-label={`Integración auditoría y riesgo para tarea ${task.id}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4"
      >
        <h3 className="text-lg font-semibold">Integraciones</h3>

        {/* Audit Logs */}
        <div>
          <h4 className="font-medium">Registros de Auditoría</h4>
          {logsLoading ? (
            <div className="space-y-2 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              ))}
            </div>
          ) : logsError ? (
            <p className="text-red-600">Error al cargar registros.</p>
          ) : logs.length === 0 ? (
            <p className="text-gray-500">No hay registros.</p>
          ) : (
            <ul className="space-y-1">
              {logs.map(log => (
                <li key={log.id} className="flex justify-between items-center">
                  <span className="font-mono truncate">{log.id.slice(0, 8)}</span>
                  <Link
                    to={`/audit-log/${log.id}`}
                    className="text-dp-blue hover:underline focus:outline-none focus:ring-2 focus:ring-dp-blue rounded"
                    aria-label={`Ver registro de auditoría ${log.id}`}
                  >
                    Ver
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Latest Risk Assessment */}
        <div>
          <h4 className="font-medium">Última Evaluación de Riesgo</h4>
          {asmtLoading ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
          ) : asmtError ? (
            <p className="text-red-600">Error al cargar evaluaciones.</p>
          ) : !latest ? (
            <p className="text-gray-500">No hay evaluaciones.</p>
          ) : (
            <div className="flex justify-between items-center">
              <span>
                Score: <strong>{latest.score}</strong> — Nivel: <strong>{latest.riskLevel}</strong>
              </span>
              <Link
                to={`/risk-classifier/assessments/${latest.id}`}
                className="text-dp-blue hover:underline focus:outline-none focus:ring-2 focus:ring-dp-blue rounded"
                aria-label={`Ver evaluación ${latest.id}`}
              >
                Ver
              </Link>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="flex gap-2">
          <Button
            as={Link}
            to={`/audit-log?filter=${task.decisionId}`}
            variant="outline"
            size="sm"
            aria-label="Ver todos los registros de esta decisión"
          >
            Ver todos los registros
          </Button>
          <Button
            as={Link}
            to={`/risk-classifier?model=${task.modelId}`}
            variant="outline"
            size="sm"
            aria-label="Ver historial de evaluaciones de este modelo"
          >
            Ver historial de riesgos
          </Button>
        </div>
      </motion.section>
    </ErrorBoundary>
  );
};

export default AuditIntegration;
