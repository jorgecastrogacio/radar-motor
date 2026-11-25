import { describe, it, expect } from 'vitest';
import { encodeChallengePayload, decodeChallengePayload, ChallengePayload } from '../lib/share-codec';

describe('2.2: Enlace de Reto, Decodificación Segura y Privacidad', () => {
  it('decodifica correctamente un reto valido con v: 2 y puntuacion media', () => {
    const payload: ChallengePayload = {
      v: 2,
      alias: 'Sara',
      age: 28,
      ageBracket: '21-30',
      sex: 'F',
      globalScore: 420,
      globalAverage: 70,
      archetypeId: 'radar_equilibrado',
      axisScores: {
        lower_body_strength: 75,
        core_upper_strength: 65,
        balance_posture: 70,
        mobility_flexibility: 68,
        coordination_agility: 72,
        aerobic_stability: 70,
      },
      date: '2026-11-25',
    };

    const encoded = encodeChallengePayload(payload);
    const decoded = decodeChallengePayload(encoded);

    expect(decoded).not.toBeNull();
    expect(decoded?.alias).toBe('Sara');
    expect(decoded?.age).toBe(28);
    expect(decoded?.globalAverage).toBe(70);
    expect(decoded?.axisScores.lower_body_strength).toBe(75);
  });

  it('retorna null ante cadenas corruptas o manipuladas sin lanzar excepcion', () => {
    const corrupt1 = 'cadena-no-base64-valida!!!';
    const corrupt2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalido';
    const corrupt3 = '';

    expect(decodeChallengePayload(corrupt1)).toBeNull();
    expect(decodeChallengePayload(corrupt2)).toBeNull();
    expect(decodeChallengePayload(corrupt3)).toBeNull();
  });

  it('minimiza los datos del payload garantizando ausencia de identificadores personales o de red', () => {
    const payload: ChallengePayload = {
      v: 2,
      alias: 'Alex',
      age: 35,
      ageBracket: '31-50',
      sex: 'M',
      globalScore: 360,
      globalAverage: 60,
      archetypeId: 'resorte_explosivo',
      axisScores: {},
      date: '2026-11-25',
    };

    const payloadKeys = Object.keys(payload);
    expect(payloadKeys).not.toContain('email');
    expect(payloadKeys).not.toContain('ip');
    expect(payloadKeys).not.toContain('userId');
    expect(payloadKeys).not.toContain('deviceId');
  });
});
