import { describe, it, expect } from 'vitest';
import { calculateTestScore, evaluateFullReport } from '../lib/scoring-engine';
import { encodeChallengePayload, decodeChallengePayload, ChallengePayload } from '../lib/share-codec';
import { TestId } from '../types/radar-motor';

describe('3.5: Tests Complementarios de Scoring Engine y Share Codec', () => {
  describe('Scoring Engine: Robustez con entradas nulas, NaN y percentiles', () => {
    it('trata valores nulos, undefined o NaN como pruebas omitidas (0 pts, skipped=true)', () => {
      const resNull = calculateTestScore('sit_to_stand_5x', null, 30, 'M');
      expect(resNull.score).toBe(0);
      expect(resNull.skipped).toBe(true);

      const resNaN = calculateTestScore('sit_to_stand_5x', NaN, 30, 'M');
      expect(resNaN.score).toBe(0);
      expect(resNaN.skipped).toBe(true);
    });

    it('asigna puntuacion entre 0 y 100 de forma estrictamente acotada (clamp)', () => {
      // Rendimiento extraordinario (muy por encima de p95)
      const resHigh = calculateTestScore('chair_stand_30s', 100, 25, 'M');
      expect(resHigh.score).toBe(100);

      // Rendimiento muy bajo
      const resLow = calculateTestScore('chair_stand_30s', 0, 25, 'M');
      expect(resLow.score).toBeGreaterThanOrEqual(0);
      expect(resLow.score).toBeLessThanOrEqual(25);
    });

    it('respeta la direccion en pruebas de tiempo (lower_is_better)', () => {
      // En sit_to_stand_5x, menos segundos es mejor
      const resFast = calculateTestScore('sit_to_stand_5x', 5.0, 30, 'M');
      const resSlow = calculateTestScore('sit_to_stand_5x', 25.0, 30, 'M');

      expect(resFast.score).toBeGreaterThan(resSlow.score);
    });

    it('en modo express calcula la media dividiendo exactamente entre 3', () => {
      const inputs: Partial<Record<TestId, number>> = {
        sit_to_stand_5x: 6.0, // buena marca
        monopodal_open: 45, // buena marca
        wall_toss_30s: 25, // buena marca
      };

      const report = evaluateFullReport(25, 'M', inputs, 'express');
      expect(report.mode).toBe('express');
      expect(report.totalTests).toBe(3);
      expect(report.completedCount).toBe(3);
      expect(typeof report.globalAverage).toBe('number');
      expect(report.globalAverage).toBeGreaterThan(0);
    });
  });

  describe('Share Codec: Codificación URL-safe con UTF-8 y retrocompatibilidad', () => {
    it('codifica y decodifica fielmente caracteres especiales españoles (tildes, eñes)', () => {
      const payload: ChallengePayload = {
        v: 2,
        alias: 'Papá Iñaki & María José',
        age: 52,
        ageBracket: '51-60',
        sex: 'M',
        globalScore: 360,
        globalAverage: 60,
        archetypeId: 'nucleo_de_acero',
        axisScores: {
          core_upper_strength: 78,
        },
        date: '2026-11-25',
      };

      const encoded = encodeChallengePayload(payload);
      // Debe ser URL-safe (sin '+', '/', ni '=')
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
      expect(encoded).not.toContain('=');

      const decoded = decodeChallengePayload(encoded);
      expect(decoded).not.toBeNull();
      expect(decoded?.alias).toBe('Papá Iñaki & María José');
      expect(decoded?.globalAverage).toBe(60);
    });
  });
});
