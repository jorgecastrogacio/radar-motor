import { describe, expect, it } from 'vitest';
import { evaluateFullReport } from '../lib/scoring-engine';
import { Participant } from '../lib/session-store';
import { TestId } from '../types/radar-motor';

describe('1.1 Integridad de datos: última prueba guardada', () => {
  it('reproduce el fallo si se evalúa con el estado anterior sin la prueba 18', () => {
    // Simulamos el participante antes de guardar la prueba 18
    const staleParticipant: Participant = {
      id: 'p1',
      alias: 'Test User',
      age: 25,
      sex: 'M',
      inputs: {
        chair_stand_30s: 20,
        // ... pruebas previas completadas, pero step_touch_arms_60s aún ausente
      },
    };

    // Si se pasa staleParticipant a evaluateFullReport:
    const staleReport = evaluateFullReport(
      staleParticipant.age,
      staleParticipant.sex,
      staleParticipant.inputs,
      'full'
    );
    expect(staleReport.axisResults.aerobic_stability.testResults.find(t => t.testId === 'step_touch_arms_60s')?.rawValue).toBeNull();
    expect(staleReport.axisResults.aerobic_stability.testResults.find(t => t.testId === 'step_touch_arms_60s')?.skipped).toBe(true);

    // Con el arreglo (actualización sincrónica pasada al completar):
    const updatedInputs: Partial<Record<TestId, number | null>> = {
      ...staleParticipant.inputs,
      step_touch_arms_60s: 50,
    };
    const fixedReport = evaluateFullReport(
      staleParticipant.age,
      staleParticipant.sex,
      updatedInputs,
      'full'
    );
    const stepTouchResult = fixedReport.axisResults.aerobic_stability.testResults.find(t => t.testId === 'step_touch_arms_60s');
    expect(stepTouchResult?.rawValue).toBe(50);
    expect(stepTouchResult?.skipped).toBe(false);
    expect(stepTouchResult?.score).toBeGreaterThan(0);
  });

  it('verifica que en modo exprés la última prueba (wall_toss_30s) se preserva', () => {
    const inputs: Partial<Record<TestId, number | null>> = {
      sit_to_stand_5x: 10.5,
      monopodal_open: 40,
      wall_toss_30s: 18,
    };
    const report = evaluateFullReport(25, 'F', inputs, 'express');
    expect(report.completedCount).toBe(3);
    const tossResult = report.axisResults.coordination_agility?.testResults.find(t => t.testId === 'wall_toss_30s');
    expect(tossResult?.rawValue).toBe(18);
    expect(tossResult?.skipped).toBe(false);
  });
});
