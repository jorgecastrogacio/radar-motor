import { describe, it, expect } from 'vitest';
import { determineArchetype } from '../data/archetypes';
import { createChallengePayloadFromReport, createHistoryEntryFromReport } from '../lib/share-codec';
import { evaluateFullReport, isAxisEvaluated } from '../lib/scoring-engine';
import { EvaluationReport } from '../types/radar-motor';

describe('1.3 y 1.4: Arquetipos, Sin Datos y Evaluación Parcial Exprés', () => {
  it('determineArchetype retorna null si completedCount === 0 (evita falso Resorte Explosivo)', () => {
    const zeroReport: EvaluationReport = {
      age: 30,
      ageBracket: '21-30',
      sex: 'M',
      mode: 'full',
      globalScore: 0,
      globalAverage: 0,
      completedCount: 0,
      totalTests: 18,
      axisResults: {
        lower_body_strength: { axisId: 'lower_body_strength', name: 'Fuerza Piernas', score: 0, level: 'Base', testResults: [] },
        core_upper_strength: { axisId: 'core_upper_strength', name: 'Fuerza Core', score: 0, level: 'Base', testResults: [] },
        balance_posture: { axisId: 'balance_posture', name: 'Equilibrio', score: 0, level: 'Base', testResults: [] },
        mobility_flexibility: { axisId: 'mobility_flexibility', name: 'Movilidad', score: 0, level: 'Base', testResults: [] },
        coordination_agility: { axisId: 'coordination_agility', name: 'Coordinación', score: 0, level: 'Base', testResults: [] },
        aerobic_stability: { axisId: 'aerobic_stability', name: 'Resistencia', score: 0, level: 'Base', testResults: [] },
      },
      lowestAxes: [],
    };

    const archetype = determineArchetype(zeroReport);
    expect(archetype).toBeNull();
  });

  it('determineArchetype retorna null en modo express (siempre evaluacion parcial)', () => {
    const expressReport: EvaluationReport = {
      age: 25,
      ageBracket: '21-30',
      sex: 'F',
      mode: 'express',
      globalScore: 210,
      globalAverage: 70,
      completedCount: 3,
      totalTests: 3,
      axisResults: {
        lower_body_strength: { axisId: 'lower_body_strength', name: 'Fuerza Piernas', score: 80, level: 'Sólido', testResults: [] },
        core_upper_strength: { axisId: 'core_upper_strength', name: 'Fuerza Core', score: 0, level: 'Base', testResults: [] },
        balance_posture: { axisId: 'balance_posture', name: 'Equilibrio', score: 65, level: 'Sólido', testResults: [] },
        mobility_flexibility: { axisId: 'mobility_flexibility', name: 'Movilidad', score: 0, level: 'Base', testResults: [] },
        coordination_agility: { axisId: 'coordination_agility', name: 'Coordinación', score: 65, level: 'Sólido', testResults: [] },
        aerobic_stability: { axisId: 'aerobic_stability', name: 'Resistencia', score: 0, level: 'Base', testResults: [] },
      },
      lowestAxes: ['balance_posture', 'coordination_agility'],
    };

    const archetype = determineArchetype(expressReport);
    expect(archetype).toBeNull();
  });

  it('determineArchetype retorna Semilla en Marcha si los 6 ejes están evaluados y globalAverage < 35 en modo full', () => {
    // Evaluación real completa a niveles mínimos (p10)
    const seedReport = evaluateFullReport(40, 'M', {
      chair_stand_30s: 5,
      sit_to_stand_5x: 25,
      calf_raise_30s: 5,
      glute_bridge_30s: 5,
      wall_pushups_30s: 2,
      arm_curl_1l_30s: 3,
      monopodal_open: 2,
      tandem_stance_open: 3,
      tandem_walk_3m: 25,
      chair_sit_reach: -20,
      back_scratch: -25,
      knee_to_wall: 1,
      wall_toss_30s: 2,
      plate_tapping_25: 35,
      side_step_20s: 4,
      step_test_2min: 15,
      functional_reach: 5,
      step_touch_arms_60s: 5,
    }, 'full');

    expect(seedReport.completedCount).toBe(18);
    expect(seedReport.globalAverage).toBeLessThan(35);

    const archetype = determineArchetype(seedReport);
    expect(archetype).not.toBeNull();
    expect(archetype?.id).toBe('semilla_en_marcha');
  });

  it('determineArchetype retorna null en modo full con solo 1 de 18 pruebas completadas (1/18)', () => {
    const report1of18 = evaluateFullReport(25, 'M', {
      sit_to_stand_5x: 9.5,
    }, 'full');

    expect(report1of18.completedCount).toBe(1);
    const archetype = determineArchetype(report1of18);
    expect(archetype).toBeNull();
  });

  it('determineArchetype retorna null en modo full si 1 de los 6 ejes queda completamente omitido (5 ejes evaluados)', () => {
    // 5 ejes evaluados (15 pruebas), omitiendo completamente el eje de aerobic_stability
    const report5Axes = evaluateFullReport(30, 'M', {
      chair_stand_30s: 20,
      sit_to_stand_5x: 8,
      calf_raise_30s: 25,
      glute_bridge_30s: 20,
      wall_pushups_30s: 25,
      arm_curl_1l_30s: 22,
      monopodal_open: 40,
      tandem_stance_open: 30,
      tandem_walk_3m: 8,
      chair_sit_reach: 5,
      back_scratch: 2,
      knee_to_wall: 12,
      wall_toss_30s: 25,
      plate_tapping_25: 12,
      side_step_20s: 30,
      // aerobic_stability (step_test_2min, functional_reach, step_touch_arms_60s) omitidas:
      step_test_2min: null,
      functional_reach: null,
      step_touch_arms_60s: null,
    }, 'full');

    expect(report5Axes.completedCount).toBe(15);
    const archetype = determineArchetype(report5Axes);
    expect(archetype).toBeNull();
  });

  it('isAxisEvaluated identifica correctamente ejes evaluados vs no evaluados u omitidos', () => {
    expect(isAxisEvaluated(undefined)).toBe(false);
    expect(isAxisEvaluated({ axisId: 'balance_posture', name: 'Equilibrio', score: 0, level: 'Base', testResults: [] })).toBe(false);

    // Con prueba omitida
    const dummyCurve = { p10: 10, p25: 20, zsm_min: 30, zsm_opt: 40, p95: 50 };
    const axisOmitted = {
      axisId: 'balance_posture' as const,
      name: 'Equilibrio',
      score: 0,
      level: 'Base' as const,
      testResults: [
        { testId: 'monopodal_open' as const, name: 'Monopodal', rawValue: null, unit: 's', direction: 'higher_is_better' as const, score: 0, level: 'Base' as const, zsmStatus: 'below_zsm' as const, skipped: true, curve: dummyCurve },
      ],
    };
    expect(isAxisEvaluated(axisOmitted)).toBe(false);

    // Con al menos una prueba válida
    const axisValid = {
      ...axisOmitted,
      testResults: [
        ...axisOmitted.testResults,
        { testId: 'tandem_stance_open' as const, name: 'Tándem', rawValue: 30, unit: 's', direction: 'higher_is_better' as const, score: 75, level: 'Sólido' as const, zsmStatus: 'in_zsm' as const, skipped: false, curve: dummyCurve },
      ],
    };
    expect(isAxisEvaluated(axisValid)).toBe(true);
  });

  it('Modo Exprés con 1 prueba perfecta (100 pts) y 2 omitidas (0 pts) da media exactamente 33.3', () => {
    // En modo express el divisor es fijo 3.
    const expressReport = evaluateFullReport(25, 'M', {
      sit_to_stand_5x: 3.5, // Muy rápido (< p95) -> score = 100
      monopodal_open: null, // omitida -> score = 0
      wall_toss_30s: null,  // omitida -> score = 0
    }, 'express');

    expect(expressReport.completedCount).toBe(1);
    expect(expressReport.axisResults.lower_body_strength.score).toBe(100);
    expect(expressReport.globalAverage).toBe(33.3);
  });

  it('createChallengePayloadFromReport y createHistoryEntryFromReport asignan incompleta en modo full incompleto', () => {
    const report1of18 = evaluateFullReport(25, 'M', {
      sit_to_stand_5x: 9.5,
    }, 'full');

    const payload = createChallengePayloadFromReport(report1of18, 'Incompleto');
    expect(payload.archetypeId).toBe('incompleta');
    expect(payload.mode).toBe('full');

    const historyEntry = createHistoryEntryFromReport(report1of18, 'Incompleto');
    expect(historyEntry.archetypeId).toBe('incompleta');
    expect(historyEntry.mode).toBe('full');
  });

  it('createChallengePayloadFromReport maneja correctamente archetype null en modo express sin fallar', () => {
    const expressReport: EvaluationReport = {
      age: 25,
      ageBracket: '21-30',
      sex: 'F',
      mode: 'express',
      globalScore: 210,
      globalAverage: 70,
      completedCount: 3,
      totalTests: 3,
      axisResults: {
        lower_body_strength: { axisId: 'lower_body_strength', name: 'Fuerza Piernas', score: 80, level: 'Sólido', testResults: [] },
        core_upper_strength: { axisId: 'core_upper_strength', name: 'Fuerza Core', score: 0, level: 'Base', testResults: [] },
        balance_posture: { axisId: 'balance_posture', name: 'Equilibrio', score: 65, level: 'Sólido', testResults: [] },
        mobility_flexibility: { axisId: 'mobility_flexibility', name: 'Movilidad', score: 0, level: 'Base', testResults: [] },
        coordination_agility: { axisId: 'coordination_agility', name: 'Coordinación', score: 65, level: 'Sólido', testResults: [] },
        aerobic_stability: { axisId: 'aerobic_stability', name: 'Resistencia', score: 0, level: 'Base', testResults: [] },
      },
      lowestAxes: [],
    };

    const payload = createChallengePayloadFromReport(expressReport, 'Retador');
    expect(payload.archetypeId).toBe('parcial');
    expect(payload.globalAverage).toBe(70);
  });

  it('evaluación incompleta y modo exprés omitido calculan correctamente los ejes medidos dinámicos', () => {
    // Modo exprés con 2 pruebas hechas y 1 omitida (usando motor real)
    const expressWithOmission = evaluateFullReport(20, 'M', {
      sit_to_stand_5x: 10,
      monopodal_open: 35,
      wall_toss_30s: null,
    }, 'express');

    expect(determineArchetype(expressWithOmission)).toBeNull();
    expect(expressWithOmission.completedCount).toBe(2);

    const measuredAxes = Object.values(expressWithOmission.axisResults).filter(
      (ax) => isAxisEvaluated(ax)
    ).length;
    expect(measuredAxes).toBe(2);
  });
});
