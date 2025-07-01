// src/modules/explainability/types.ts

/**
 * Posibles estados de una explicación IA.
 */
export enum ExplanationStatus {
  /** La explicación está en cola de generación */
  Pending = 'pending',
  /** La explicación se generó correctamente */
  Published = 'published',
  /** Ocurrió un error al generar la explicación */
  Failed = 'failed',
}

/**
 * Estructura base común a todas las explicaciones.
 * Ideal para extender con metadatos extra en el futuro.
 */
export interface BaseExplanation {
  /** Identificador único de la explicación */
  id: string;
  /** Identificador del modelo IA que se explica */
  modelId: string;
  /** Datos de entrada utilizados para generar la explicación */
  input: Record<string, any>;
  /** Texto de la explicación en lenguaje natural */
  text: string;
  /** Arreglo de puntos para el gráfico SHAP */
  chartData: ChartData[];
  /** Timestamp ISO 8601 de creación */
  timestamp: string;
  /** Estado actual de la explicación */
  status?: ExplanationStatus;
  /** (Opcional) ID del revisor humano asignado */
  reviewerId?: string;
}

/**
 * Una explicación completa utilizada en la aplicación.
 * Actualmente extiende BaseExplanation sin añadir nuevos campos,
 * pero permite futuras extensiones sin romper compatibilidad.
 */
export interface Explanation extends BaseExplanation {}

/**
 * Punto de datos individual para el gráfico SHAP.
 */
export interface ChartData {
  /** Nombre de la característica (feature) */
  feature: string;
  /** Valor SHAP asociado (positivo o negativo) */
  value: number;
}
