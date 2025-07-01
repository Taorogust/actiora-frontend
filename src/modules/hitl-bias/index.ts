// src/modules/hitl-bias/index.ts

// Pages
export { default as HITLDashboard } from './pages/HITLDashboard';
export { default as MetricsPage }   from './pages/MetricsPage';

// Components
export { HumanReviewPanel } from './components/HumanReviewPanel';
export { BiasMetrics }      from './components/BiasMetrics';

// Hooks
export * from './hooks/useReviewTasks';
export * from './hooks/useReviewAssignment';
export * from './hooks/useBiasMetrics';


// Services
export * from './services/hitlService';

// Types
export * from './types';
