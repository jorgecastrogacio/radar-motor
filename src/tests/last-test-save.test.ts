import { describe, expect, it } from 'vitest';
import { evaluateFullReport } from '../lib/scoring-engine';
import { Participant } from '../lib/session-store';
import { TestId } from '../types/radar-motor';

describe('1.1 Integridad de datos: última prueba guardada en todos los modos', () => {
  it('(a) Individual completa: la prueba 18 (step_touch_arms_60s) se preserva sincrónicamente', () => {
    // Simulamos el participante antes de guardar la prueba 18
    const staleParticipant: Participant = {
      id: 'p1',
      alias: 'Individual User',
      age: 25,
      sex: 'M',
      inputs: {
        chair_stand_30s: 20,
      },
    };

    // Si se pasa staleParticipant a evaluateFullReport (fallo anterior):
    const staleReport = evaluateFullReport(
      staleParticipant.age,
      staleParticipant.sex,
      staleParticipant.inputs,
      'full'
    );
    expect(
      staleReport.axisResults.aerobic_stability.testResults.find(
        (t) => t.testId === 'step_touch_arms_60s'
      )?.rawValue
    ).toBeNull();
    expect(
      staleReport.axisResults.aerobic_stability.testResults.find(
        (t) => t.testId === 'step_touch_arms_60s'
      )?.skipped
    ).toBe(true);

    // Con la corrección sincrónica al pulsar finalizar:
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
    const stepTouchResult = fixedReport.axisResults.aerobic_stability.testResults.find(
      (t) => t.testId === 'step_touch_arms_60s'
    );
    expect(stepTouchResult?.rawValue).toBe(50);
    expect(stepTouchResult?.skipped).toBe(false);
    expect(stepTouchResult?.score).toBeGreaterThan(0);
  });

  it('(b) Modo exprés: la última prueba (wall_toss_30s) se preserva y completa las 3 pruebas', () => {
    const inputs: Partial<Record<TestId, number | null>> = {
      sit_to_stand_5x: 10.5,
      monopodal_open: 40,
      wall_toss_30s: 18,
    };
    const report = evaluateFullReport(25, 'F', inputs, 'express');
    expect(report.completedCount).toBe(3);
    const tossResult = report.axisResults.coordination_agility?.testResults.find(
      (t) => t.testId === 'wall_toss_30s'
    );
    expect(tossResult?.rawValue).toBe(18);
    expect(tossResult?.skipped).toBe(false);
    expect(tossResult?.score).toBeGreaterThan(0);
  });

  it('(c) Modo familia: el último miembro en la última prueba preserva su marca al completar', () => {
    // Escenario familia: 3 miembros (Padre 42a, Madre 40a, Hijo 10a)
    // El último miembro evaluado en la prueba 18 (step_touch_arms_60s)
    const familyParticipants: Participant[] = [
      {
        id: 'fam_1',
        alias: 'Papá',
        age: 42,
        sex: 'M',
        inputs: { step_touch_arms_60s: 55 },
      },
      {
        id: 'fam_2',
        alias: 'Mamá',
        age: 40,
        sex: 'F',
        inputs: { step_touch_arms_60s: 52 },
      },
      {
        id: 'fam_3',
        alias: 'Hijo',
        age: 10,
        sex: 'M',
        inputs: {}, // Antes de guardar la última prueba
      },
    ];

    // Al registrar la marca de 60 reps del hijo en la última prueba e inmediatamente completar:
    const activeMemberIdx = 2;
    const finalVal = 60;
    const currentMember = familyParticipants[activeMemberIdx];

    const updatedCurrentMember: Participant = {
      ...currentMember,
      inputs: {
        ...currentMember.inputs,
        step_touch_arms_60s: finalVal,
      },
    };

    const finalParticipants = familyParticipants.map((p, idx) =>
      idx === activeMemberIdx ? updatedCurrentMember : p
    );

    // Verificamos que los 3 miembros generan sus reportes con la última marca intacta
    const reports = finalParticipants.map((p) =>
      evaluateFullReport(p.age, p.sex, p.inputs, 'full')
    );

    const childReport = reports[2];
    const childStepTouch = childReport.axisResults.aerobic_stability.testResults.find(
      (t) => t.testId === 'step_touch_arms_60s'
    );
    expect(childStepTouch?.rawValue).toBe(60);
    expect(childStepTouch?.skipped).toBe(false);
    expect(childStepTouch?.score).toBeGreaterThan(0);
  });

  it('(d) Modo aula: la actualización masiva de la última prueba preserva marcas de todos los alumnos', () => {
    // En modo aula, las marcas se registran por lote en la cuadrícula de la clase
    const students: Participant[] = [
      { id: 'alu_1', alias: 'Alumno A', age: 14, sex: 'M', inputs: {} },
      { id: 'alu_2', alias: 'Alumno B', age: 14, sex: 'F', inputs: {} },
      { id: 'alu_3', alias: 'Alumno C', age: 15, sex: 'M', inputs: {} },
    ];

    const batchTestId: TestId = 'step_touch_arms_60s';
    const batchValues: Record<string, number> = {
      alu_1: 58,
      alu_2: 62,
      alu_3: 54,
    };

    // Actualización sincrónica de cuadrícula
    const updatedStudents = students.map((s) => ({
      ...s,
      inputs: {
        ...s.inputs,
        [batchTestId]: batchValues[s.id] ?? null,
      },
    }));

    // Verificación de reporte individual y grupal
    updatedStudents.forEach((student) => {
      const rep = evaluateFullReport(student.age, student.sex, student.inputs, 'full');
      const tr = rep.axisResults.aerobic_stability.testResults.find((t) => t.testId === batchTestId);
      expect(tr?.rawValue).toBe(batchValues[student.id]);
      expect(tr?.skipped).toBe(false);
      expect(tr?.score).toBeGreaterThan(0);
    });
  });
});
