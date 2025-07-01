// src/modules/hitl-bias/types.ts

/**
 * Posibles estados de una tarea de revisión humana (HITL).
 */
export enum ReviewStatus {
  /** Tarea aún no revisada */
  Pending = 'pending',
  /** Tarea aprobada por el revisor */
  Approved = 'approved',
  /** Tarea rechazada por el revisor */
  Rejected = 'rejected',
}

/**
 * Datos básicos de una tarea de revisión.
 */
export interface BaseReviewTask {
  /** Identificador único de la tarea */
  id: string;
  /** Identificador de la decisión IA asociada */
  decisionId: string;
  /** Identificador del modelo evaluado */
  modelId: string;
  /** Nivel de riesgo inicial calculado por el modelo */
  riskLevel: 'low' | 'medium' | 'high';
  /** Datos de entrada originales a revisar */
  input: Record<string, any>;
  /** Datos de salida generados por el modelo */
  output: Record<string, any>;
  /** ISO 8601 timestamp de creación o última actualización */
  timestamp: string;
}

/**
 * Representa una tarea de revisión humana completa,
 * incluyendo estado, asignación y comentarios.
 */
export interface ReviewTask extends BaseReviewTask {
  /** Usuario asignado para revisar (opcional) */
  assignedTo?: string;
  /** Estado actual de la revisión */
  status: ReviewStatus;
  /** Comentarios adicionales del revisor */
  comments?: string;
}

/**
 * Métricas de sesgo disponibles para análisis.
 */
export enum BiasMetricName {
  DisparateImpact     = 'DisparateImpact',
  StatisticalParity   = 'StatisticalParity',
  EqualOpportunity    = 'EqualOpportunity',
  PredictiveParity    = 'PredictiveParity',
  DemographicParity   = 'DemographicParity',
  FalsePositiveRate   = 'FalsePositiveRate',
  FalseNegativeRate   = 'FalseNegativeRate',
}

/**
 * Datos básicos de una métrica de sesgo.
 */
export interface BaseBiasMetric {
  /** Identificador único de la métrica */
  id: string;
  /** ID de la decisión IA a la que se aplica */
  decisionId: string;
  /** Nombre de la métrica de sesgo */
  metricName: BiasMetricName;
  /** Valor numérico calculado de la métrica */
  value: number;
  /** Umbral configurado para disparar alertas */
  threshold: number;
  /** ISO 8601 timestamp de cuando se calculó */
  timestamp: string;
}

/**
 * Métrica de sesgo lista para mostrar o exportar.
 */
export interface BiasMetric extends BaseBiasMetric {
  // En el futuro podría extenderse con más metadatos
}
