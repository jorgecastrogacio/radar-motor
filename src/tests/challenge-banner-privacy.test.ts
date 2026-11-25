import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  encodeChallengePayload,
  decodeChallengePayload,
  createChallengePayloadFromReport,
  ChallengePayload,
} from '../lib/share-codec';
import { EvaluationReport } from '../types/radar-motor';

describe('2.2: Enlace de Reto, Decodificación Segura y Privacidad', () => {
  it('minimiza estrictamente el payload a los datos requeridos por el receptor', () => {
    const mockReport: EvaluationReport = {
      age: 28,
      ageBracket: '21-30',
      sex: 'F',
      mode: 'full',
      globalScore: 420,
      globalAverage: 70,
      completedCount: 18,
      totalTests: 18,
      axisResults: {
        lower_body_strength: { axisId: 'lower_body_strength', name: 'Fuerza Tren Inferior', score: 75, level: 'Sólido', testResults: [] },
        core_upper_strength: { axisId: 'core_upper_strength', name: 'Fuerza Core y Superior', score: 65, level: 'Sólido', testResults: [] },
        balance_posture: { axisId: 'balance_posture', name: 'Equilibrio Postural', score: 70, level: 'Sólido', testResults: [] },
        mobility_flexibility: { axisId: 'mobility_flexibility', name: 'Movilidad y Flexibilidad', score: 68, level: 'Sólido', testResults: [] },
        coordination_agility: { axisId: 'coordination_agility', name: 'Coordinación y Agilidad', score: 72, level: 'Sólido', testResults: [] },
        aerobic_stability: { axisId: 'aerobic_stability', name: 'Resistencia Aeróbica', score: 70, level: 'Sólido', testResults: [] },
      },
      lowestAxes: ['core_upper_strength', 'mobility_flexibility'],
    };

    const payload = createChallengePayloadFromReport(mockReport, 'Sara');
    const keys = Object.keys(payload);

    // Campos permitidos
    expect(keys).toContain('v');
    expect(keys).toContain('alias');
    expect(keys).toContain('age');
    expect(keys).toContain('globalAverage');
    expect(keys).toContain('axisScores');
    expect(keys).toContain('archetypeId');
    expect(keys).toContain('mode');

    // Campos excluidos por minimización
    expect(keys).not.toContain('sex');
    expect(keys).not.toContain('ageBracket');
    expect(keys).not.toContain('date');
    expect(keys).not.toContain('globalScore');
    expect(keys).not.toContain('email');
    expect(keys).not.toContain('ip');
    expect(keys).not.toContain('userId');
  });

  it('decodifica correctamente payloads v2 minimizados', () => {
    const payload: ChallengePayload = {
      v: 2,
      mode: 'full',
      alias: 'Sara',
      age: 28,
      globalAverage: 70,
      archetypeId: 'radar_equilibrado',
      axisScores: {
        lower_body_strength: 75,
        core_upper_strength: 65,
      },
    };

    const encoded = encodeChallengePayload(payload);
    const decoded = decodeChallengePayload(encoded);

    expect(decoded).not.toBeNull();
    expect(decoded?.alias).toBe('Sara');
    expect(decoded?.age).toBe(28);
    expect(decoded?.globalAverage).toBe(70);
    expect(decoded?.mode).toBe('full');
    expect(decoded?.axisScores.lower_body_strength).toBe(75);
  });

  it('mantiene retrocompatibilidad decodificando enlaces heredados v1 con globalScore', () => {
    const legacyPayload = {
      alias: 'Pablo',
      age: 14,
      ageBracket: '13-15',
      sex: 'M',
      globalScore: 360,
      archetypeId: 'resorte_explosivo',
      axisScores: {
        lower_body_strength: 60,
        core_upper_strength: 60,
        balance_posture: 60,
        mobility_flexibility: 60,
        coordination_agility: 60,
        aerobic_stability: 60,
      },
      date: '2026-11-20',
    };

    const encoded = Buffer.from(JSON.stringify(legacyPayload)).toString('base64');
    const decoded = decodeChallengePayload(encoded);

    expect(decoded).not.toBeNull();
    expect(decoded?.alias).toBe('Pablo');
    expect(decoded?.globalScore).toBe(360);
  });

  it('retorna null ante cadenas corruptas o manipuladas sin lanzar excepcion', () => {
    const corrupt1 = 'cadena-no-base64-valida!!!';
    const corrupt2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalido';
    const corrupt3 = '';

    expect(decodeChallengePayload(corrupt1)).toBeNull();
    expect(decodeChallengePayload(corrupt2)).toBeNull();
    expect(decodeChallengePayload(corrupt3)).toBeNull();
  });

  it('el aviso de privacidad en app/informe/page.tsx cumple todos los requisitos exigidos', () => {
    const informePath = path.resolve(process.cwd(), 'src/app/informe/page.tsx');
    const content = fs.readFileSync(informePath, 'utf-8');

    // Debe enumerar los datos que viajan en la URL
    expect(content).toContain('alias');
    expect(content).toContain('edad');
    expect(content).toContain('puntuación media global');
    expect(content).toContain('puntuaciones por eje');
    expect(content).toContain('identificador de arquetipo');
    expect(content).toContain('modo de evaluación');

    // Debe advertir que Base64 no es cifrado
    expect(content).toMatch(/Base64.*no constituye un cifrado/i);

    // Debe recomendar no usar nombres ni apellidos reales de menores
    expect(content).toMatch(/no utilizar nombres reales ni apellidos de menores/i);

    // NO debe afirmar que "no contiene datos personales" ni "es anónimo"
    expect(content).not.toContain('No incluye datos de contacto ni identificadores personales');
    expect(content).not.toContain('anónimo');
  });
});
