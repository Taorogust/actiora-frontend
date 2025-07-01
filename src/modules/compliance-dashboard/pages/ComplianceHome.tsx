// src/modules/compliance-dashboard/pages/ComplianceHome.tsx
import React, { Suspense } from 'react';
import { ComplianceProvider } from '../context/ComplianceContext';
import { useComplianceState } from '../hooks/useComplianceState';
import { useTasks } from '../hooks/useTasks';
import { TrafficLight } from '../components/TrafficLight';
import { MetricsChart } from '../components/MetricsChart';
import { TasksTable } from '../components/TasksTable';
import { Spinner } from '@/components/Spinner';
import { ErrorBoundary } from '../components/ErrorBoundary';

export const ComplianceHome: React.FC = () => (
  <ComplianceProvider>
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Panel de Cumplimiento MEGA-TOP</h1>

      <ErrorBoundary>
        <SectionStatus />
        <SectionMetrics />
        <SectionTasks />
      </ErrorBoundary>
    </div>
  </ComplianceProvider>
);

const SectionStatus: React.FC = () => {
  const { state, isLoading, compute, isComputing } = useComplianceState();
  if (isLoading) return <Spinner />;
  return (
    <div className="flex items-center justify-between">
      <TrafficLight />
      <button onClick={()=>compute()} disabled={isComputing} className="btn btn-primary">
        {isComputing?'Calculando…':'Recalcular Semáforo'}
      </button>
    </div>
  );
};

const SectionMetrics: React.FC = () => (
  <Suspense fallback={<Spinner />}>
    <div>
      <h2 className="text-xl font-semibold mb-2">Cumplimiento por Módulo</h2>
      <MetricsChart />
    </div>
  </Suspense>
);

const SectionTasks: React.FC = () => {
  const { tasks, isLoading, completeTask, isCompleting } = useTasks();
  if (isLoading) return <Spinner />;
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Tareas Pendientes</h2>
      <TasksTable tasks={tasks} complete={completeTask} isCompleting={isCompleting} />
    </div>
  );
};
