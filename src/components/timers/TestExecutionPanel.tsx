'use client';

import React, { useState } from 'react';
import { ALL_TEST_IDS, TESTS_CATALOG } from '../../data/tests-catalog';
import { TestId } from '../../types/radar-motor';
import { CATEGORY_THEMES } from '../../data/category-theme';
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
  const theme = CATEGORY_THEMES[currentTest.axisId];

  const handleFinish = (val: number) => {
    setRecordedResults((prev) => ({ ...prev, [selectedTestId]: val }));
    if (onSaveResult) {
      onSaveResult(selectedTestId, val);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Selector de prueba para previsualizar y ejecutar cualquiera de las 18 */}
      <div className="rounded-[20px] bg-white border border-slate-200 p-4 sm:p-5 shadow-xs">
        <label htmlFor="test-selector" className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
          Selecciona una prueba para ejecutar con su temporizador y ficha técnica:
        </label>
        <div className="relative">
          <select
            id="test-selector"
            value={selectedTestId}
            onChange={(e) => setSelectedTestId(e.target.value as TestId)}
            className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl border border-slate-300 bg-white text-slate-900 font-semibold text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-xs"
          >
            {ALL_TEST_IDS.map((tId) => {
              const t = TESTS_CATALOG[tId];
              const tTheme = CATEGORY_THEMES[t.axisId];
              const hasResult = recordedResults[tId] !== undefined;
              return (
                <option key={tId} value={tId}>
                  [Cat {tTheme.number}] #{t.order}. {t.name} ({t.unit}) {hasResult ? `✓ [${recordedResults[tId]} ${t.unit}]` : ''}
                </option>
              );
            })}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
            <ChevronRight className="h-5 w-5 rotate-90" />
          </div>
        </div>
      </div>

      {/* Tarjeta de Categoría Oficial (Bloque 3/5) */}
      <div className="rounded-[22px] bg-white border border-slate-200 shadow-md overflow-hidden">
        {/* Cabecera sólida de Categoría */}
        <div
          className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 text-white transition-colors duration-200"
          style={{ backgroundColor: theme.color }}
        >
          <div className="flex items-center gap-3">
            <span
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center font-black text-sm shadow-xs shrink-0"
              style={{ color: theme.colorText }}
            >
              {theme.number}
            </span>
            <div>
              <p className="text-white font-extrabold text-base tracking-tight leading-none">
                {theme.label}
              </p>
              <p className="text-white/85 text-xs font-medium pt-1">
                Eje #{theme.number} del Radar Motor
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-xs">
            Prueba #{currentTest.order} de 18
          </span>
        </div>

        {/* Tira de puntos (Dots Progress) bajo la cabecera */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto">
          {ALL_TEST_IDS.map((tId, idx) => {
            const isCurrent = tId === selectedTestId;
            const isCompleted = recordedResults[tId] !== undefined;
            return (
              <button
                key={tId}
                type="button"
                onClick={() => setSelectedTestId(tId)}
                title={`Prueba #${idx + 1}: ${TESTS_CATALOG[tId].name}`}
                className={`h-2.5 rounded-full transition-all ${
                  isCurrent
                    ? 'w-6'
                    : 'w-2.5 hover:opacity-80'
                }`}
                style={{
                  backgroundColor: isCurrent || isCompleted ? theme.color : '#CBD5E1',
                }}
              />
            );
          })}
        </div>

        {/* Cuerpo de la tarjeta */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Título de la prueba y ficha técnica */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
                style={{ backgroundColor: theme.colorText }}
              >
                {currentTest.order}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {currentTest.name}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 pl-8">
              Protocolo orientativo para hogar y escuela · Medición en <strong>{currentTest.unit}</strong>
            </p>
          </div>

          {/* Ficha Visual Dual con Píldora de Procedencia */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Guía de Movimiento y Ejecución Técnica
              </span>
              <span className="badge-provenance-tech">
                Referencia técnica vectorial
              </span>
            </div>
            <TestIllustration testId={selectedTestId} />
          </div>

          {/* Protocolo y Safety Cue con Píldora de Nota */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wide">
                <Info className="h-4 w-4" style={{ color: theme.colorText }} />
                <span>Protocolo de Ejecución</span>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {currentTest.protocolSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold mt-0.5" style={{ color: theme.colorText }}>•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wide">
                <ShieldAlert className="h-4 w-4 text-amber-700" />
                <span>Seguridad Postural</span>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed font-medium">
                {currentTest.safetyCue}
              </p>
              
              <div className="pt-2 border-t border-amber-200/70">
                <span className="pill-note text-[11px]">
                  Material: {currentTest.homeEquivalent}
                </span>
              </div>
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
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-center animate-in fade-in duration-200">
              <p className="text-sm font-bold text-emerald-900 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>
                  Resultado guardado con éxito: {recordedResults[selectedTestId]} {currentTest.unit}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
