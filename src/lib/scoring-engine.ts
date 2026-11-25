import {
  AgeBracket,
  AxisId,
  AxisResult,
  ConstructiveLevel,
  EvaluationReport,
  NormativeCurve,
  Sex,
  TestId,
  TestResult,
  ZsmStatus,
} from '../types/radar-motor';
import { ALL_AXIS_IDS, AXES_CONFIG, EXPRESS_TEST_IDS, TESTS_CATALOG } from '../data/tests-catalog';
import { NORMATIVE_CURVES } from '../data/normative-curves';

/** Determina si un eje ha sido efectivamente evaluado (cuenta con al menos una prueba no omitida con valor válido) */
export function isAxisEvaluated(axisResult?: AxisResult): boolean {
  return !!axisResult?.testResults && axisResult.testResults.some((tr) => !tr.skipped && tr.rawValue !== null);
}

/**
 * Mapea cualquier edad numérica a su corte exacto entre los 22 definidos.
 * Clamping: edades menores de 6 se evalúan con el baremo '6', y 80 o más con '80+'.
 */
export function getAgeBracket(age: number): AgeBracket {
  const roundedAge = Math.floor(age);
  if (roundedAge <= 6) return '6';
  if (roundedAge === 7) return '7';
  if (roundedAge === 8) return '8';
  if (roundedAge === 9) return '9';
  if (roundedAge === 10) return '10';
  if (roundedAge === 11) return '11';
  if (roundedAge === 12) return '12';
  if (roundedAge === 13) return '13';
  if (roundedAge === 14) return '14';
  if (roundedAge === 15) return '15';
  if (roundedAge === 16) return '16';
  if (roundedAge === 17) return '17';
  if (roundedAge >= 18 && roundedAge <= 20) return '18-20';
  if (roundedAge >= 21 && roundedAge <= 30) return '21-30';
  if (roundedAge >= 31 && roundedAge <= 40) return '31-40';
  if (roundedAge >= 41 && roundedAge <= 50) return '41-50';
  if (roundedAge >= 51 && roundedAge <= 60) return '51-60';
  if (roundedAge >= 61 && roundedAge <= 64) return '61-64';
  if (roundedAge >= 65 && roundedAge <= 69) return '65-69';
  if (roundedAge >= 70 && roundedAge <= 74) return '70-74';
  if (roundedAge >= 75 && roundedAge <= 79) return '75-79';
  return '80+';
}

/**
 * Obtiene la curva normativa correspondiente a una prueba, edad y sexo.
 * Si sex === 'N', devuelve el promedio aritmético exacto de M y F en sus 5 percentiles/anclajes.
 */
export function getCurve(testId: TestId, age: number, sex: Sex): NormativeCurve {
  const bracket = getAgeBracket(age);
  const testCurves = NORMATIVE_CURVES[testId][bracket];

  if (sex === 'M') return testCurves.M;
  if (sex === 'F') return testCurves.F;

  // Sexo 'N': promedio exacto de los anclajes masculinos y femeninos
  const round = (val: number) => Math.round(val * 10) / 10;
  return {
    p10: round((testCurves.M.p10 + testCurves.F.p10) / 2),
    p25: round((testCurves.M.p25 + testCurves.F.p25) / 2),
    zsm_min: round((testCurves.M.zsm_min + testCurves.F.zsm_min) / 2),
    zsm_opt: round((testCurves.M.zsm_opt + testCurves.F.zsm_opt) / 2),
    p95: round((testCurves.M.p95 + testCurves.F.p95) / 2),
  };
}

/**
 * Determina el nivel constructivo a partir de una puntuación (0 a 100).
 */
export function getConstructiveLevel(score: number): ConstructiveLevel {
  if (score >= 85) return 'Referente';
  if (score >= 55) return 'Sólido';
  if (score >= 25) return 'En Progreso';
  return 'Base';
}

/**
 * Calcula la puntuación (0-100) e indicadores de una prueba individual usando
 * interpolación lineal por tramos sobre la curva de 5 anclajes percentiles.
 */
export function calculateTestScore(
  testId: TestId,
  rawValue: number | null,
  age: number,
  sex: Sex
): TestResult {
  const testDef = TESTS_CATALOG[testId];
  const curve = getCurve(testId, age, sex);

  if (rawValue === null || rawValue === undefined || isNaN(rawValue)) {
    return {
      testId,
      name: testDef.name,
      rawValue: null,
      unit: testDef.unit,
      direction: testDef.direction,
      score: 0,
      level: 'Base',
      zsmStatus: 'below_zsm',
      skipped: true,
      curve,
    };
  }

  let score: number;
  let zsmStatus: ZsmStatus;

  if (testDef.direction === 'higher_is_better') {
    const { p10, p25, zsm_min, zsm_opt, p95 } = curve;

    if (rawValue <= p10) {
      const slope = (25 - 10) / (p25 - p10);
      score = 10 + slope * (rawValue - p10);
    } else if (rawValue <= p25) {
      const slope = (25 - 10) / (p25 - p10);
      score = 10 + slope * (rawValue - p10);
    } else if (rawValue <= zsm_min) {
      const slope = (45 - 25) / (zsm_min - p25);
      score = 25 + slope * (rawValue - p25);
    } else if (rawValue <= zsm_opt) {
      const slope = (75 - 45) / (zsm_opt - zsm_min);
      score = 45 + slope * (rawValue - zsm_min);
    } else if (rawValue <= p95) {
      const slope = (95 - 75) / (p95 - zsm_opt);
      score = 75 + slope * (rawValue - zsm_opt);
    } else {
      const slope = (95 - 75) / (p95 - zsm_opt);
      score = 95 + slope * (rawValue - p95);
    }

    if (rawValue < zsm_min) {
      zsmStatus = 'below_zsm';
    } else if (rawValue <= zsm_opt) {
      zsmStatus = 'in_zsm';
    } else {
      zsmStatus = 'above_zsm';
    }
  } else {
    // lower_is_better: menor tiempo/distancia representa mejor desempeño
    // p10 > p25 > zsm_min > zsm_opt > p95
    const { p10, p25, zsm_min, zsm_opt, p95 } = curve;

    if (rawValue >= p10) {
      const slope = (25 - 10) / (p10 - p25);
      score = 10 - slope * (rawValue - p10);
    } else if (rawValue >= p25) {
      const slope = (25 - 10) / (p10 - p25);
      score = 25 - slope * (rawValue - p25);
    } else if (rawValue >= zsm_min) {
      const slope = (45 - 25) / (p25 - zsm_min);
      score = 45 - slope * (rawValue - zsm_min);
    } else if (rawValue >= zsm_opt) {
      const slope = (75 - 45) / (zsm_min - zsm_opt);
      score = 75 - slope * (rawValue - zsm_opt);
    } else if (rawValue >= p95) {
      const slope = (95 - 75) / (zsm_opt - p95);
      score = 95 - slope * (rawValue - p95);
    } else {
      const slope = (95 - 75) / (zsm_opt - p95);
      score = 95 + slope * (p95 - rawValue);
    }

    if (rawValue > zsm_min) {
      zsmStatus = 'below_zsm';
    } else if (rawValue >= zsm_opt) {
      zsmStatus = 'in_zsm';
    } else {
      zsmStatus = 'above_zsm';
    }
  }

  const clampedScore = Math.max(0, Math.min(100, Math.round(score * 10) / 10));
  const level = getConstructiveLevel(clampedScore);

  return {
    testId,
    name: testDef.name,
    rawValue,
    unit: testDef.unit,
    direction: testDef.direction,
    score: clampedScore,
    level,
    zsmStatus,
    skipped: false,
    curve,
  };
}

/**
 * Evalúa el informe completo de la persona usuaria en modo 'full' (18 pruebas)
 * o 'express' (3 pruebas cardinales).
 */
export function evaluateFullReport(
  age: number,
  sex: Sex,
  inputs: Partial<Record<TestId, number | null>>,
  mode: 'full' | 'express' = 'full'
): EvaluationReport {
  const ageBracket = getAgeBracket(age);

  if (mode === 'express') {
    // Modo Express: 3 pruebas clave (1 de tren inferior, 1 de equilibrio, 1 de coordinación)
    const expressTestIds = EXPRESS_TEST_IDS;
    let completedCount = 0;
    const testResultsMap: Partial<Record<TestId, TestResult>> = {};

    for (const testId of expressTestIds) {
      const val = inputs[testId] ?? null;
      if (val !== null && !isNaN(val)) {
        completedCount++;
      }
      testResultsMap[testId] = calculateTestScore(testId, val, age, sex);
    }

    const axisResults: Partial<Record<AxisId, AxisResult>> = {};
    const expressAxes: AxisId[] = [];

    for (const axisId of ALL_AXIS_IDS) {
      const axisCfg = AXES_CONFIG[axisId];
      // Buscar si este eje tiene prueba express
      const expressTestForAxis = expressTestIds.find(
        (tId) => TESTS_CATALOG[tId].axisId === axisId
      );

      if (expressTestForAxis) {
        expressAxes.push(axisId);
        const tr = testResultsMap[expressTestForAxis]!;
        axisResults[axisId] = {
          axisId,
          name: axisCfg.name,
          score: tr.score,
          level: tr.level,
          testResults: [tr],
        };
      } else {
        axisResults[axisId] = {
          axisId,
          name: axisCfg.name,
          score: 0,
          level: 'Base',
          testResults: [],
        };
      }
    }

    // Puntuación global express: promedio de las 3 pruebas express
    const expressScores = expressAxes.map((ax) => axisResults[ax]!.score);
    const sumExpress = expressScores.reduce((acc, curr) => acc + curr, 0);
    const globalAverage = Math.round((sumExpress / 3) * 10) / 10;
    const globalScore = Math.round(sumExpress * 10) / 10;

    // Los 2 ejes más bajos entre los 3 evaluados
    const sortedExpressAxes = [...expressAxes].sort((a, b) => {
      const diff = axisResults[a]!.score - axisResults[b]!.score;
      if (diff !== 0) return diff;
      return AXES_CONFIG[a].order - AXES_CONFIG[b].order;
    });
    const lowestAxes = sortedExpressAxes.slice(0, 2);

    return {
      age,
      ageBracket,
      sex,
      mode: 'express',
      globalScore,
      globalAverage,
      completedCount,
      totalTests: 3,
      axisResults: axisResults as Record<AxisId, AxisResult>,
      lowestAxes,
    };
  }

  // Modo 'full': 18 pruebas organizadas en 6 ejes de 3 pruebas
  let completedCount = 0;
  const allTestsGroupedByAxis: Record<AxisId, TestResult[]> = {
    lower_body_strength: [],
    core_upper_strength: [],
    balance_posture: [],
    mobility_flexibility: [],
    coordination_agility: [],
    aerobic_stability: [],
  };

  const allTestDefs = Object.values(TESTS_CATALOG).sort((a, b) => a.order - b.order);

  for (const testDef of allTestDefs) {
    const val = inputs[testDef.id] ?? null;
    if (val !== null && !isNaN(val)) {
      completedCount++;
    }
    const result = calculateTestScore(testDef.id, val, age, sex);
    allTestsGroupedByAxis[testDef.axisId].push(result);
  }

  const axisResults: Partial<Record<AxisId, AxisResult>> = {};
  let globalScoreSum = 0;

  for (const axisId of ALL_AXIS_IDS) {
    const axisCfg = AXES_CONFIG[axisId];
    const tests = allTestsGroupedByAxis[axisId];

    // LEY ANTI-TRAMPAS: Denominador fijo siempre 3. Pruebas saltadas suman 0.
    const axisSum = tests.reduce((sum, t) => sum + t.score, 0);
    const axisScore = Math.round((axisSum / 3) * 10) / 10;
    const axisLevel = getConstructiveLevel(axisScore);

    axisResults[axisId] = {
      axisId,
      name: axisCfg.name,
      score: axisScore,
      level: axisLevel,
      testResults: tests,
    };

    globalScoreSum += axisScore;
  }

  const globalScore = Math.round(globalScoreSum * 10) / 10;
  const globalAverage = Math.round((globalScore / 6) * 10) / 10;

  // Los 2 ejes con menor puntuación (orden ascendente)
  const sortedAxes = [...ALL_AXIS_IDS].sort((a, b) => {
    const diff = axisResults[a]!.score - axisResults[b]!.score;
    if (diff !== 0) return diff;
    return AXES_CONFIG[a].order - AXES_CONFIG[b].order;
  });
  const lowestAxes = sortedAxes.slice(0, 2);

  return {
    age,
    ageBracket,
    sex,
    mode: 'full',
    globalScore,
    globalAverage,
    completedCount,
    totalTests: 18,
    axisResults: axisResults as Record<AxisId, AxisResult>,
    lowestAxes,
  };
}
