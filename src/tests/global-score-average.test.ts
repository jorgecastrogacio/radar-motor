import { describe, expect, it } from 'vitest';
import { evaluateFullReport, getConstructiveLevel } from '../lib/scoring-engine';
import { decodeChallengePayload, encodeChallengePayload, ChallengePayload } from '../lib/share-codec';
import { generateClassroomCSVContent, ClassroomSession } from '../lib/session-store';

describe('1.2 Puntuación global vs Media 0-100', () => {
  it('confirma que globalAverage está acotado en 0-100 y coincide con el Nivel constructivo', () => {
    // Si la suma de 6 ejes es 342, la media es 342 / 6 = 57
    const inputs = {
      chair_stand_30s: 15,
      sit_to_stand_5x: 12,
      calf_raise_30s: 20,
    };
    const report = evaluateFullReport(25, 'M', inputs, 'full');
    expect(report.globalAverage).toBeLessThanOrEqual(100);
    expect(report.globalAverage).toBeGreaterThanOrEqual(0);
    
    const expectedLevel = getConstructiveLevel(report.globalAverage);
    // Verificamos que el nivel se basa en globalAverage
    if (report.globalAverage >= 55) {
      expect(['Sólido', 'Referente']).toContain(expectedLevel);
    } else if (report.globalAverage >= 25) {
      expect(expectedLevel).toBe('En Progreso');
    } else {
      expect(expectedLevel).toBe('Base');
    }
  });

  it('decodifica enlaces antiguos v1 manteniendo la semántica de globalScore y decodifica v2 con globalAverage', () => {
    // Enlace v1 (sin campo v ni globalAverage, representa enlaces antiguos reales del formato v1)
    const legacyPayload = {
      alias: 'Rival Antiguo',
      age: 30,
      ageBracket: '21-30',
      sex: 'M',
      globalScore: 342, // suma
      archetypeId: 'resorte_explosivo',
      axisScores: { lower_body_strength: 80 },
      date: '2026-11-20',
    } as unknown as ChallengePayload;

    const encodedV1 = encodeChallengePayload(legacyPayload);
    const decodedV1 = decodeChallengePayload(encodedV1);
    expect(decodedV1).not.toBeNull();
    expect(decodedV1?.globalScore).toBe(342); // mantiene su valor original
    expect(decodedV1?.globalAverage).toBeUndefined();

    // Enlace v2 (con v: 2 y globalAverage)
    const v2Payload: ChallengePayload = {
      v: 2,
      alias: 'Rival Nuevo',
      age: 30,
      ageBracket: '21-30',
      sex: 'M',
      globalScore: 342,
      globalAverage: 57,
      archetypeId: 'resorte_explosivo',
      axisScores: { lower_body_strength: 80 },
      date: '2026-11-25',
    };

    const encodedV2 = encodeChallengePayload(v2Payload);
    const decodedV2 = decodeChallengePayload(encodedV2);
    expect(decodedV2?.v).toBe(2);
    expect(decodedV2?.globalScore).toBe(342);
    expect(decodedV2?.globalAverage).toBe(57);
  });

  it('etiqueta las columnas del CSV de aula de forma inequívoca entre suma y media', () => {
    const dummySession: ClassroomSession = {
      groupLabel: '1A',
      defaultAge: 12,
      testMode: 'full',
      updatedAt: '2026-11-25',
      students: [
        {
          id: 's1',
          alias: 'Alumno #01',
          age: 12,
          sex: 'M',
          inputs: {},
          report: evaluateFullReport(12, 'M', {}, 'full'),
        },
      ],
    };

    const csv = generateClassroomCSVContent(dummySession);
    expect(csv).toContain('Puntuacion_Global_Suma_Ejes');
    expect(csv).toContain('Media_Global_0_100');
  });
});
