// src/modules/explainability/utils/explain-utils.ts
import type { ChartData } from '../types';

/**
 * Genera un texto explicativo mock a partir del input.
 */
export function computeText(input: Record<string, any>): string {
  const keys = Object.keys(input);
  const top = keys
    .slice(0, 3)
    .map(k => `${k} (${String(input[k]).slice(0, 10)})`)
    .join(', ');
  return `El modelo priorizó: ${top}.`;
}

/**
 * Genera datos mock para un gráfico SHAP a partir del input.
 */
export function computeChartData(input: Record<string, any>): ChartData[] {
  return Object.entries(input)
    .slice(0, 5)
    .map(([feature, raw]) => {
      const magnitude =
        typeof raw === 'number'
          ? Math.abs(raw)
          : String(raw).length;
      const value = parseFloat(
        (magnitude * (Math.random() * 2 - 1)).toFixed(2)
      );
      return { feature, value };
    });
}
