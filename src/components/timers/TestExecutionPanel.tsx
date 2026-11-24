'use client';

import React, { useState } from 'react';
import { ALL_TEST_IDS, TESTS_CATALOG } from '../../data/tests-catalog';
import { TestId } from '../../types/radar-motor';
import { TestIllustration } from '../illustrations/TestIllustration';
import { CountdownTimer } from './CountdownTimer';
import { StopwatchTimer } from './StopwatchTimer';
import { ManualScaleInput } from './ManualScaleInput';
import { CheckCircle2, ChevronRight, Info, ShieldAlert } from 'lucide-react';

interface TestExecutionPanelProps {
  initialTestId?: TestId;
  onSaveResult?: (testId: TestId, rawValue: number) => void;
}

export function TestExecutionPanel({
  initialTestId = 'chair_stand_30s',
  onSaveResult,
}: TestExecutionPanelProps) {
  const [selectedTestId, setSelectedTestId] = useState<TestId>(initialTestId);
  const [recordedResults, setRecordedResults] = useState<Partial<Record<TestId, number>>>({});

  const currentTest = TESTS_CATALOG[selectedTestId];

  const handleFinish = (val: number) => {
    setRecordedResults((prev) => ({ ...prev, [selectedTestId]: val }));
    if (onSaveResult) {
      onSaveResult(selectedTestId, val);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Selector de prueba para previsualizar y ejecutar cualquiera de las 18 */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <label htmlFor="test-selector" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
          Selecciona una prueba para ejecutar con su temporizador y ficha visual:
        </label>
        <div className="relative">
          <select
            id="test-selector"
            value={selectedTestId}
            onChange={(e) => setSelectedTestId(e.target.value as TestId)}
            className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            {ALL_TEST_IDS.map((tId) => {
              const t = TESTS_CATALOG[tId];
              const hasResult = recordedResults[tId] !== undefined;
              return (
                <option key={tId} value={tId}>
                  {t.order}. {t.name} ({t.unit}) {hasResult ? `✓ [${recordedResults[tId]} ${t.unit}]` : ''}
                </option>
              );
            })}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
            <ChevronRight className="h-5 w-5 rotate-90" />
          </div>
        </div>
      </div>

      {/* Ficha Visual Dual (Viñeta 1: Inicio -> Viñeta 2: Fin) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Demostración Visual Técnica
          </h3>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Prueba #{currentTest.order} de 18
          </span>
        </div>
        <TestIllustration testId={selectedTestId} />
      </div>

      {/* Protocolo y Safety Cue */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300 font-bold text-xs uppercase tracking-wide">
            <Info className="h-4 w-4" />
            <span>Protocolo de Ejecución</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            {currentTest.protocolSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="font-bold text-sky-600 dark:text-sky-400 mt-0.5">•</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs uppercase tracking-wide">
            <ShieldAlert className="h-4 w-4" />
            <span>Seguridad y Postura</span>
          </div>
          <p className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed font-medium">
            {currentTest.safetyCue}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-amber-200/60 dark:border-amber-800/60">
            <strong>Material:</strong> {currentTest.homeEquivalent}
          </p>
        </div>
      </div>

      {/* Temporizador / Modo de Entrada según la prueba */}
      <div className="pt-2">
        {currentTest.timerMode === 'countdown' && (
          <CountdownTimer
            durationSeconds={currentTest.durationSeconds || 30}
            testName={currentTest.name}
            unit={currentTest.unit}
            onFinish={handleFinish}
          />
        )}

        {currentTest.timerMode === 'stopwatch' && (
          <StopwatchTimer
            testName={currentTest.name}
            maxSeconds={currentTest.maxSeconds}
            direction={currentTest.direction}
            onFinish={handleFinish}
          />
        )}

        {currentTest.timerMode === 'manual_scale' && currentTest.visualScaleOptions && (
          <ManualScaleInput
            testName={currentTest.name}
            visualScaleOptions={currentTest.visualScaleOptions}
            onFinish={handleFinish}
          />
        )}
      </div>

      {/* Notificación si se ha registrado resultado */}
      {recordedResults[selectedTestId] !== undefined && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center animate-in fade-in duration-200">
          <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center justify-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>
              Resultado guardado con éxito: {recordedResults[selectedTestId]} {currentTest.unit}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
