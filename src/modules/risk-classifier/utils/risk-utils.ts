/** Lógica puros para score y clasificación, extraída para facilitar tests unitarios. */

import type { RiskLevel } from '../types';

/** Genera un score aleatorio entre 0 y 10 */
export function computeScore(): number {
  return Math.floor(Math.random() * 11);
}

/** Asigna un nivel de riesgo en función del score */
export function classify(score: number): RiskLevel {
  if (score >= 7) return RiskLevel.Alto;
  if (score >= 4) return RiskLevel.Medio;
  return RiskLevel.Bajo;
}
