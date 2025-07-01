// src/modules/incident-monitor/index.ts

// Puntos de entrada del módulo incident-monitor

export { IncidentDashboard } from './pages/IncidentDashboard';
export { IncidentContext, IncidentProvider } from './context/IncidentContext';

export * from './hooks/useIncidents';
export * from './hooks/useNotifyAuthorities';

export * from './services/incidentService';
export * from './types';
