// src/modules/explainability/index.ts

// Tipos y enums
export * from './types';

// Hooks de datos
export * from './hooks/useExplanation';
export * from './hooks/usePublicPortal';

// Componentes reutilizables
export { ExplanationViewer } from './components/ExplanationViewer';
export { SHAPChart } from './components/SHAPChart';

// Páginas
export { default as ExplainDashboard } from './pages/ExplainDashboard';
export { default as PublicExplainPage } from './pages/PublicExplainPage';
