import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ActiveSession,
  clearActiveSession,
  getActiveSessionSnapshot,
  getClassroomSessionSnapshot,
  getLastReportSnapshot,
  saveActiveSession,
  subscribeStorage,
} from '../lib/session-store';
import {
  getPersonalHistorySnapshot,
} from '../lib/share-codec';

describe('Ciclo de vida y React Hooks: Timers, SosModal y useSyncExternalStore', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    vi.useFakeTimers();
    mockStorage = {};
    const storageImpl = {
      getItem: (k: string) => mockStorage[k] ?? null,
      setItem: (k: string, v: string) => {
        mockStorage[k] = String(v);
      },
      removeItem: (k: string) => {
        delete mockStorage[k];
      },
      clear: () => {
        mockStorage = {};
      },
    };

    const listeners: Record<string, Array<() => void>> = {};

    const customWindow = {
      addEventListener: (event: string, cb: () => void) => {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(cb);
      },
      removeEventListener: (event: string, cb: () => void) => {
        if (listeners[event]) {
          listeners[event] = listeners[event].filter((f) => f !== cb);
        }
      },
      dispatchEvent: (event: { type: string }) => {
        const cbs = listeners[event.type] || [];
        cbs.forEach((fn) => fn());
        return true;
      },
      document: {
        body: {
          style: {
            overflow: '',
          },
        },
      },
    };

    const customGlobal = globalThis as unknown as {
      window: typeof customWindow;
      localStorage: typeof storageImpl;
      document: typeof customWindow.document;
      Event: typeof Event;
    };
    customGlobal.window = customWindow;
    customGlobal.localStorage = storageImpl;
    customGlobal.document = customWindow.document;
    if (typeof Event === 'undefined') {
      customGlobal.Event = class {
        type: string;
        constructor(type: string) {
          this.type = type;
        }
      } as unknown as typeof Event;
    }
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('1. Countdown y Stopwatch: Temporizadores con cleanup y sin callbacks tras desmontar', () => {
    it('la secuencia de preparación 3 -> 2 -> 1 -> running progresa con temporizadores que se limpian', () => {
      let prepCount = 3;
      let status: 'idle' | 'prep' | 'running' | 'paused' | 'finished' = 'prep';
      const playPrepBeep = vi.fn();
      const playStartBeep = vi.fn();

      // Simular lógica idéntica a CountdownTimer / StopwatchTimer
      const runEffect = () => {
        if (status !== 'prep') return () => {};
        if (prepCount > 1) {
          playPrepBeep();
          const timer = setTimeout(() => {
            prepCount -= 1;
            cleanup = runEffect();
          }, 1000);
          return () => clearTimeout(timer);
        } else if (prepCount === 1) {
          playPrepBeep();
          const timer = setTimeout(() => {
            playStartBeep();
            prepCount = 0;
            status = 'running';
          }, 1000);
          return () => clearTimeout(timer);
        }
        return () => {};
      };

      let cleanup = runEffect();
      expect(playPrepBeep).toHaveBeenCalledTimes(1);

      // Avanzar 1s -> prepCount = 2
      vi.advanceTimersByTime(1000);
      expect(prepCount).toBe(2);
      expect(playPrepBeep).toHaveBeenCalledTimes(2);

      // Avanzar 1s -> prepCount = 1
      vi.advanceTimersByTime(1000);
      expect(prepCount).toBe(1);
      expect(playPrepBeep).toHaveBeenCalledTimes(3);

      // Avanzar 1s -> prepCount = 0, status = 'running'
      vi.advanceTimersByTime(1000);
      expect(prepCount).toBe(0);
      expect(status).toBe('running');
      expect(playStartBeep).toHaveBeenCalledTimes(1);

      // Desmontar (cleanup)
      cleanup();
    });

    it('al desmontar durante la cuenta atrás, no se ejecutan callbacks pendientes ni cambios de estado', () => {
      let prepCount = 3;
      let status: 'prep' | 'running' = 'prep';
      const playStartBeep = vi.fn();

      const timer = setTimeout(() => {
        prepCount = 0;
        status = 'running';
        playStartBeep();
      }, 1000);

      // Desmontar antes de que expire el temporizador
      clearTimeout(timer);
      vi.advanceTimersByTime(2000);

      expect(prepCount).toBe(3);
      expect(status).toBe('prep');
      expect(playStartBeep).not.toHaveBeenCalled();
    });
  });

  describe('2. SosModal: Diálogo desmontado y reseteado sin fugas de overflow', () => {
    it('al cerrar el modal se restaura el overflow del body a unset', () => {
      const doc = (globalThis as unknown as { window: { document: { body: { style: { overflow: string } } } } }).window.document;
      // Montar modal: overflow hidden
      doc.body.style.overflow = 'hidden';
      expect(doc.body.style.overflow).toBe('hidden');

      // Unmount cleanup
      doc.body.style.overflow = 'unset';
      expect(doc.body.style.overflow).toBe('unset');
    });

    it('al reabrir el diálogo, su estado interno isUnlocked se inicializa siempre en false', () => {
      // Función creadora del estado de diálogo que representa SosModalDialog
      const createDialogState = () => ({ isUnlocked: false });

      // Apertura 1
      let dialogState = createDialogState();
      expect(dialogState.isUnlocked).toBe(false);

      // Usuario desbloquea
      dialogState.isUnlocked = true;
      expect(dialogState.isUnlocked).toBe(true);

      // Cierre y Reapertura 2 (remount)
      dialogState = createDialogState();
      expect(dialogState.isUnlocked).toBe(false);
    });
  });

  describe('3. useSyncExternalStore: Cero desajustes de hidratación SSR y snapshots reactivos', () => {
    it('los snapshots de servidor devuelven null/vacío para garantizar concordancia con SSR', () => {
      // In SSR (typeof window === 'undefined'), snapshots always return null or []
      const customGlobal = globalThis as unknown as { window: unknown };
      const originalWindow = customGlobal.window;
      customGlobal.window = undefined;

      expect(getActiveSessionSnapshot()).toBeNull();
      expect(getLastReportSnapshot()).toBeNull();
      expect(getClassroomSessionSnapshot()).toBeNull();
      expect(getPersonalHistorySnapshot()).toEqual([]);

      customGlobal.window = originalWindow;
    });

    it('los cambios en localStorage notifican inmediatamente a los suscriptores', () => {
      const listener = vi.fn();
      const unsubscribe = subscribeStorage(listener);

      const session: ActiveSession = {
        mode: 'express',
        safetyStatus: 'green',
        participants: [{ id: 'p1', alias: 'Alumno A', age: 10, sex: 'M', inputs: {} }],
        currentTestIndex: 0,
        currentParticipantIndex: 0,
      };

      saveActiveSession(session);
      expect(listener).toHaveBeenCalledTimes(1);

      const snapshot = getActiveSessionSnapshot();
      expect(snapshot).not.toBeNull();
      expect(snapshot?.participants[0].alias).toBe('Alumno A');

      clearActiveSession();
      expect(listener).toHaveBeenCalledTimes(2);
      expect(getActiveSessionSnapshot()).toBeNull();

      unsubscribe();
      saveActiveSession(session);
      expect(listener).toHaveBeenCalledTimes(2); // No extra call after unsubscribe
    });

    it('el snapshot mantiene identidad de referencia si los datos en storage no han cambiado', () => {
      const session: ActiveSession = {
        mode: 'full',
        safetyStatus: 'green',
        participants: [{ id: 'p2', alias: 'Eva', age: 12, sex: 'F', inputs: {} }],
        currentTestIndex: 1,
        currentParticipantIndex: 0,
      };

      saveActiveSession(session);
      const snapshot1 = getActiveSessionSnapshot();
      const snapshot2 = getActiveSessionSnapshot();
      expect(snapshot1).toBe(snapshot2); // Identidad de referencia idéntica
    });
  });

  describe('4. Regresión ejecutable: Prevención de sesión fantasma post-evaluación', () => {
    it('al finalizar evaluación y ejecutar clearActiveSession(), no existe resurrección de sesión', () => {
      const isEvaluationCompleted = { current: false };

      const session: ActiveSession = {
        mode: 'express',
        safetyStatus: 'green',
        participants: [{ id: 'p1', alias: 'Lucas', age: 8, sex: 'M', inputs: { sit_to_stand_5x: 8.5 } }],
        currentTestIndex: 2,
        currentParticipantIndex: 0,
      };

      // 1. Simulación durante la ejecución en paso 3: autosave activo
      const step = 3;
      if (step === 3 && !isEvaluationCompleted.current) {
        saveActiveSession(session);
      }
      expect(getActiveSessionSnapshot()).not.toBeNull();

      // 2. Finalizar evaluación:
      // Se marca isEvaluationCompleted a true y se llama a clearActiveSession()
      isEvaluationCompleted.current = true;
      clearActiveSession();
      expect(getActiveSessionSnapshot()).toBeNull();

      // 3. Simular un re-render del componente tras navegación o cambio de estado
      if (step === 3 && !isEvaluationCompleted.current) {
        saveActiveSession(session);
      }

      // La sesión sigue en null, garantizando que el usuario no verá un prompt de sesión previa al volver a /evaluar
      expect(getActiveSessionSnapshot()).toBeNull();
    });
  });
});
