import { describe, it, expect } from 'vitest';
import { NORMATIVE_CURVES } from '../data/normative-curves';
import { ALL_TEST_IDS } from '../data/tests-catalog';
import { AgeBracket } from '../types/radar-motor';

describe('3.2: Integridad y Reproducibilidad de Curvas Normativas (792 baremos)', () => {
  const AGE_BRACKETS: AgeBracket[] = [
    '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17',
    '18-20', '21-30', '31-40', '41-50', '51-60', '61-64', '65-69', '70-74', '75-79', '80+'
  ];
  const SEXES: Array<'M' | 'F'> = ['M', 'F'];

  it('existen exactamente 18 pruebas x 22 tramos de edad x 2 sexos = 792 curvas normativas', () => {
    let curveCount = 0;

    for (const testId of ALL_TEST_IDS) {
      expect(NORMATIVE_CURVES[testId]).toBeDefined();
      for (const bracket of AGE_BRACKETS) {
        expect(NORMATIVE_CURVES[testId][bracket]).toBeDefined();
        for (const sex of SEXES) {
          const curve = NORMATIVE_CURVES[testId][bracket][sex];
          expect(curve).toBeDefined();
          expect(typeof curve.p10).toBe('number');
          expect(typeof curve.p25).toBe('number');
          expect(typeof curve.zsm_min).toBe('number');
          expect(typeof curve.zsm_opt).toBe('number');
          expect(typeof curve.p95).toBe('number');
          curveCount++;
        }
      }
    }

    expect(curveCount).toBe(792);
  });

  it('todas las 792 curvas cumplen monotonicidad estricta (sin cruces de percentiles)', () => {
    for (const testId of ALL_TEST_IDS) {
      for (const bracket of AGE_BRACKETS) {
        for (const sex of SEXES) {
          const curve = NORMATIVE_CURVES[testId][bracket][sex];
          // Verificamos que o bien todos crecen estrictamente o decrecen estrictamente
          const isAscending = curve.p10 < curve.p25 && curve.p25 < curve.zsm_min && curve.zsm_min < curve.zsm_opt && curve.zsm_opt < curve.p95;
          const isDescending = curve.p10 > curve.p25 && curve.p25 > curve.zsm_min && curve.zsm_min > curve.zsm_opt && curve.zsm_opt > curve.p95;
          expect(isAscending || isDescending).toBe(true);
        }
      }
    }
  });
});
