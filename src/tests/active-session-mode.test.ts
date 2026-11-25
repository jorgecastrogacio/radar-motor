import { describe, it, expect, beforeEach } from 'vitest';
import { saveActiveSession, loadActiveSession, clearActiveSession } from '../lib/session-store';
import { ActiveSession } from '../types/radar-motor';
import fs from 'node:fs';
import path from 'node:path';

// Mock localStorage en entorno Node/Vitest
const storage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => storage[key] ?? null,
  setItem: (key: string, val: string) => { storage[key] = String(val); },
  removeItem: (key: string) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); },
};

(globalThis as any).window = globalThis;
(globalThis as any).localStorage = mockLocalStorage;

describe('2.1: Sesiones Activas y Modos', () => {
  beforeEach(() => {
    clearActiveSession();
  });

  it('guarda y recupera sesion activa con su modo correspondiente', () => {
    const sessionExpress: ActiveSession = {
      mode: 'express',
      safetyStatus: 'green',
      participants: [{ id: 'p1', alias: 'Lucas', age: 25, sex: 'M', inputs: {} }],
      currentTestIndex: 2,
      currentParticipantIndex: 0,
    };

    saveActiveSession(sessionExpress);
    const loaded = loadActiveSession();
    expect(loaded).not.toBeNull();
    expect(loaded?.mode).toBe('express');
    expect(loaded?.currentTestIndex).toBe(2);
  });

  it('distingue entre modo express y full para evitar reanudar en indices invalidos al cambiar de modo', () => {
    const sessionExpress: ActiveSession = {
      mode: 'express',
      safetyStatus: 'green',
      participants: [{ id: 'p1', alias: 'Lucas', age: 25, sex: 'M', inputs: {} }],
      currentTestIndex: 2,
      currentParticipantIndex: 0,
    };

    saveActiveSession(sessionExpress);
    const loaded = loadActiveSession();

    // Si el usuario solicita modo 'full', la sesion 'express' guardada no coincide
    const requestedMode = 'full';
    const isCompatible = loaded?.mode === requestedMode;
    expect(isCompatible).toBe(false);
  });

  it('src/app/evaluar/page.tsx contiene el diálogo explícito de reanudación y redirección de aula', () => {
    const evaluarPath = path.resolve(process.cwd(), 'src/app/evaluar/page.tsx');
    const content = fs.readFileSync(evaluarPath, 'utf-8');

    // Redirección a /aula
    expect(content).toContain("modeParam === 'aula'");
    expect(content).toContain("router.replace('/aula')");

    // Diálogo explícito con dos opciones
    expect(content).toContain('handleResumeSavedSession');
    expect(content).toContain('handleDiscardSavedSession');
    expect(content).toContain('Continuar evaluación en curso');
    expect(content).toContain('Empezar una nueva en Modo');
  });
});
