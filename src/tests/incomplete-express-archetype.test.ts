import { describe, it, expect } from 'vitest';
import { determineArchetype, ARCHETYPES } from '../data/archetypes';
import { createChallengePayloadFromReport } from '../lib/share-codec';
import { calculateEvaluationReport } from '../lib/scoring-engine';
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

  it('determineArchetype retorna Semilla en Marcha solo si completedCount > 0 y globalAverage < 35 en modo full', () => {
    const seedReport: EvaluationReport = {
      age: 40,
      ageBracket: '31-50',
      sex: 'M',
      mode: 'full',
      globalScore: 120,
      globalAverage: 20,
      completedCount: 18,
      totalTests: 18,
      axisResults: {
        lower_body_strength: { axisId: 'lower_body_strength', name: 'Fuerza Piernas', score: 20, level: 'Base', testResults: [] },
        core_upper_strength: { axisId: 'core_upper_strength', name: 'Fuerza Core', score: 20, level: 'Base', testResults: [] },
        balance_posture: { axisId: 'balance_posture', name: 'Equilibrio', score: 20, level: 'Base', testResults: [] },
        mobility_flexibility: { axisId: 'mobility_flexibility', name: 'Movilidad', score: 20, level: 'Base', testResults: [] },
        coordination_agility: { axisId: 'coordination_agility', name: 'Coordinación', score: 20, level: 'Base', testResults: [] },
        aerobic_stability: { axisId: 'aerobic_stability', name: 'Resistencia', score: 20, level: 'Base', testResults: [] },
      },
      lowestAxes: ['lower_body_strength', 'core_upper_strength'],
    };

    const archetype = determineArchetype(seedReport);
    expect(archetype).not.toBeNull();
    expect(archetype?.id).toBe('semilla_en_marcha');
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
    // Modo exprés con 2 pruebas hechas y 1 omitida
    const expressWithOmission: EvaluationReport = {
      age: 20,
      ageBracket: '16-20',
      sex: 'M',
      mode: 'express',
      globalScore: 140,
      globalAverage: 46.7,
      completedCount: 2,
      totalTests: 3,
      axisResults: {
        lower_body_strength: {
          axisId: 'lower_body_strength',
          name: 'Fuerza Piernas',
          score: 70,
          level: 'Sólido',
          testResults: [{ testId: 'sit_to_stand_5x', name: 'Sentadillas 5x', rawValue: 10, unit: 's', score: 70, level: 'Sólido', zsmStatus: 'in_zsm', skipped: false }],
        },
        balance_posture: {
          axisId: 'balance_posture',
          name: 'Equilibrio',
          score: 70,
          level: 'Sólido',
          testResults: [{ testId: 'monopodal_open', name: 'Monopodal', rawValue: 35, unit: 's', score: 70, level: 'Sólido', zsmStatus: 'in_zsm', skipped: false }],
        },
        coordination_agility: {
          axisId: 'coordination_agility',
          name: 'Coordinación',
          score: 0,
          level: 'Base',
          testResults: [{ testId: 'wall_toss_30s', name: 'Lanzamiento', rawValue: null, unit: 'reps', score: 0, level: 'Base', zsmStatus: 'below_zsm', skipped: true }],
        },
        core_upper_strength: { axisId: 'core_upper_strength', name: 'Core', score: 0, level: 'Base', testResults: [] },
        mobility_flexibility: { axisId: 'mobility_flexibility', name: 'Movilidad', score: 0, level: 'Base', testResults: [] },
        aerobic_stability: { axisId: 'aerobic_stability', name: 'Resistencia', score: 0, level: 'Base', testResults: [] },
      },
      lowestAxes: ['coordination_agility', 'core_upper_strength'],
    };

    expect(determineArchetype(expressWithOmission)).toBeNull();
    expect(expressWithOmission.completedCount).toBe(2);

    const measuredAxes = Object.values(expressWithOmission.axisResults).filter(
      (ax) => ax.testResults?.some((t) => !t.skipped && t.rawValue !== null)
    ).length;
    expect(measuredAxes).toBe(2);
  });
});
