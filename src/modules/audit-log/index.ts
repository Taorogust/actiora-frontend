// src/modules/audit-log/index.ts

/**
 * Barrel file for the Audit Log module.
 * Exports pages, hooks, services, components and types in a tree-shakeable way.
 */

// Pages
export { default as AuditList } from './pages/AuditList';
export { default as AuditDetail } from './pages/AuditDetail';

// Hooks
export * from './hooks/useAuditRecords';
export * from './hooks/useVerifyRecord';

// Services
export * from './services/auditService';

// Components
export { default as AuditTable } from './components/AuditTable';
export { default as AuditFilter } from './components/AuditFilter';
export { default as ExportButtons } from './components/ExportButtons';

// Types
export * from './types';
