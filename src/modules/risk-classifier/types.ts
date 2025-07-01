/** Posibles niveles de riesgo */
export enum RiskLevel {
  Bajo = 'Bajo',
  Medio = 'Medio',
  Alto = 'Alto',
}

/** Un modelo de IA registrado */
export interface Model {
  id: string;
  name: string;
  version: string;
  owner: string;
}

/** Resultado de una evaluación */
export interface Assessment {
  id: string;
  modelId: string;
  timestamp: string;  // ISO
  score: number;      // 0–10
  riskLevel: RiskLevel;
}
