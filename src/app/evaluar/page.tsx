'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import {
  ALL_TEST_IDS,
  AXES_CONFIG,
  EXPRESS_TEST_IDS,
  TESTS_CATALOG,
} from '../../data/tests-catalog';
import { AgeBracket, Sex, TestId } from '../../types/radar-motor';
import { evaluateFullReport, getAgeBracket } from '../../lib/scoring-engine';
import {
  ActiveSession,
  clearActiveSession,
  loadActiveSession,
  Participant,
  saveActiveSession,
  saveLastReport,
} from '../../lib/session-store';
import { SafetyScreener } from '../../components/safety/SafetyScreener';
import { LivingRoomKit } from '../../components/kit/LivingRoomKit';
import { TestIllustration } from '../../components/illustrations/TestIllustration';
import { CountdownTimer } from '../../components/timers/CountdownTimer';
import { StopwatchTimer } from '../../components/timers/StopwatchTimer';
import { ManualScaleInput } from '../../components/timers/ManualScaleInput';
import { SafetyTrafficLight } from '../../data/first-aid';

function EvaluarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const modeParam = searchParams.get('mode');
  const retoParam = searchParams.get('reto');

  const mode: 'express' | 'full' | 'family' =
    modeParam === 'family' ? 'family' : modeParam === 'express' ? 'express' : 'full';

  // Flujo en 3 pasos: 1 = Semáforo, 2 = Perfil(es), 3 = Ejecución
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [safetyStatus, setSafetyStatus] = useState<SafetyTrafficLight>('green');
  const [isKitModalOpen, setIsKitModalOpen] = useState(false);

  // Participantes
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 'p1', alias: mode === 'family' ? 'Lucas' : 'Tú', age: 7, sex: 'M', inputs: {} },
    ...(mode === 'family'
      ? [{ id: 'p2', alias: 'Abuela', age: 74, sex: 'F' as Sex, inputs: {} }]
      : []),
  ]);

  // Progreso de pruebas
  const testSequence: TestId[] = mode === 'express' ? EXPRESS_TEST_IDS : ALL_TEST_IDS;
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [currentParticipantIndex, setCurrentParticipantIndex] = useState(0);

  // Cargar sesión guardada si existe
  useEffect(() => {
    const saved = loadActiveSession();
    if (saved && saved.participants.length > 0) {
      setSafetyStatus(saved.safetyStatus);
      setParticipants(saved.participants);
      setCurrentTestIndex(saved.currentTestIndex);
      setCurrentParticipantIndex(saved.currentParticipantIndex || 0);
      setStep(3); // Reanudar directamente en la ejecución
    }
  }, []);

  // Guardar sesión activa ante cualquier cambio
  useEffect(() => {
    if (step === 3) {
      saveActiveSession({
        mode,
        safetyStatus: safetyStatus === 'red' ? 'amber' : safetyStatus,
        participants,
        currentTestIndex,
        currentParticipantIndex,
      });
    }
  }, [step, mode, safetyStatus, participants, currentTestIndex, currentParticipantIndex]);

  // Manejo de paso 1: Semáforo
  const handleSafetyProceed = (status: SafetyTrafficLight) => {
    setSafetyStatus(status);
    setStep(2);
  };

  // Manejo de participantes
  const handleUpdateParticipant = (index: number, field: keyof Participant, value: unknown) => {
    setParticipants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddFamilyMember = () => {
    if (participants.length >= 4) return;
    const newIdx = participants.length + 1;
    setParticipants((prev) => [
      ...prev,
      {
        id: `p${newIdx}`,
        alias: `Familiar ${newIdx}`,
        age: 35,
        sex: 'N',
        inputs: {},
      },
    ]);
  };

  const handleRemoveFamilyMember = (index: number) => {
    if (participants.length <= 2) return;
    setParticipants((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Manejo de registro de marca en la prueba activa
  const currentTestId = testSequence[currentTestIndex];
  const currentTest = TESTS_CATALOG[currentTestId];
  const currentParticipant = participants[currentParticipantIndex];

  const handleSaveScore = (rawValue: number | null) => {
    setParticipants((prev) => {
      const copy = [...prev];
      const p = { ...copy[currentParticipantIndex] };
      p.inputs = { ...p.inputs, [currentTestId]: rawValue };
      copy[currentParticipantIndex] = p;
      return copy;
    });

    // En modo familia: avanzar al siguiente participante en ESTA misma prueba
    if (mode === 'family' && currentParticipantIndex < participants.length - 1) {
      setCurrentParticipantIndex((prev) => prev + 1);
    } else {
      // Si todos los participantes hicieron la prueba actual, pasar a la siguiente prueba
      if (currentTestIndex < testSequence.length - 1) {
        setCurrentTestIndex((prev) => prev + 1);
        setCurrentParticipantIndex(0); // Reiniciar turno al primer participante en la nueva prueba
      } else {
        // Fin de la evaluación
        handleCompleteEvaluation();
      }
    }
  };

  const handleCompleteEvaluation = () => {
    // Calcular informes con scoring engine
    const evaluationMode = mode === 'express' ? 'express' : 'full';
    const reportItems = participants.map((p) => {
      const report = evaluateFullReport(p.age, p.sex, p.inputs, evaluationMode);
      return { participant: p, report };
    });

    saveLastReport({
      timestamp: new Date().toISOString(),
      mode,
      items: reportItems,
    });

    clearActiveSession();

    // Redirigir a /informe preservando ?reto= si existe
    const targetUrl = retoParam
      ? `/informe?reto=${encodeURIComponent(retoParam)}`
      : '/informe';
    router.push(targetUrl);
  };

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-8">
      {/* =========================================================================
          PASO 1: SEMÁFORO MÉDICO
      ========================================================================= */}
      {step === 1 && (
        <section className="space-y-6 animate-in fade-in duration-150">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Paso 1 de 3 · Filtro Previo
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Semáforo de Seguridad Médica
            </h1>
          </div>
          <SafetyScreener onProceed={handleSafetyProceed} />
        </section>
      )}

      {/* =========================================================================
          PASO 2: CONFIGURACIÓN DE PERFILES Y PREPARACIÓN DEL SALÓN
      ========================================================================= */}
      {step === 2 && (
        <section className="space-y-8 animate-in fade-in duration-150">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Paso 2 de 3 · Configuración
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {mode === 'family' ? 'Participantes de la Familia' : 'Tu Perfil de Autoevaluación'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              {mode === 'family'
                ? 'Añade de 2 a 4 familiares. Realizaréis cada prueba por turnos juntos en el salón.'
                : 'Indica tu edad y sexo para aplicar las curvas normativas fisiológicamente exactas.'}
            </p>
          </div>

          {/* Formulario de Participantes */}
          <div className="space-y-4">
            {participants.map((p, idx) => {
              const assignedBracket = getAgeBracket(p.age);
              return (
                <div
                  key={p.id}
                  className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs">
                        {idx + 1}
                      </span>
                      <span>Participante {idx + 1}</span>
                    </span>
                    {mode === 'family' && participants.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFamilyMember(idx)}
                        className="text-xs text-red-500 hover:text-red-700 p-1 flex items-center gap-1"
                        aria-label="Eliminar familiar"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Quitar</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Alias / Nombre */}
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        Nombre o Alias
                      </label>
                      <input
                        type="text"
                        value={p.alias}
                        maxLength={18}
                        onChange={(e) => handleUpdateParticipant(idx, 'alias', e.target.value)}
                        placeholder="Ej: Lucía, Papá..."
                        className="w-full min-h-[46px] px-3.5 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    {/* Edad y corte asignado en vivo */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          Edad (6 a 99 años)
                        </label>
                        <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
                          Corte: {assignedBracket === '80+' ? '80+ años' : `${assignedBracket} años`}
                        </span>
                      </div>
                      <input
                        type="number"
                        min={6}
                        max={99}
                        value={p.age}
                        onChange={(e) =>
                          handleUpdateParticipant(idx, 'age', Math.max(6, Math.min(99, Number(e.target.value))))
                        }
                        className="w-full min-h-[46px] px-3.5 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 tabular-nums"
                      />
                    </div>

                    {/* Sexo biológico para baremación */}
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                        Baremo de Referencia
                      </label>
                      <select
                        value={p.sex}
                        onChange={(e) => handleUpdateParticipant(idx, 'sex', e.target.value as Sex)}
                        className="w-full min-h-[46px] px-3.5 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="M">Hombre / Niño (M)</option>
                        <option value="F">Mujer / Niña (F)</option>
                        <option value="N">Neutro / No indicar (N)</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Añadir miembro en Modo Familia */}
            {mode === 'family' && participants.length < 4 && (
              <button
                type="button"
                onClick={handleAddFamilyMember}
                className="w-full min-h-[50px] p-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-slate-600 dark:text-slate-300 font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" />
                <span>Añadir otro familiar (Hasta 4)</span>
              </button>
            )}
          </div>

          {/* Acceso al Kit de Salón */}
          <div className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Layers className="h-5 w-5 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-950 dark:text-amber-200 font-medium">
                ¿Tienes listo el material? Silla apoyada a la pared, botella de 1L y pelota o calcetines.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsKitModalOpen(true)}
              className="shrink-0 text-xs font-bold text-amber-700 dark:text-amber-300 underline"
            >
              Revisar Kit (30s)
            </button>
          </div>

          {/* Botón de Inicio */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="min-h-[48px] px-5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold"
            >
              Atrás
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="min-h-[52px] px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base transition-all shadow-md flex items-center gap-2"
            >
              <span>¡Empezar pruebas!</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </section>
      )}

      {/* =========================================================================
          PASO 3: PANTALLA DE EJECUCIÓN (PRUEBA A PRUEBA)
      ========================================================================= */}
      {step === 3 && (
        <section className="space-y-6 animate-in fade-in duration-150">
          {/* Barra de Progreso Superior */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Prueba {currentTestIndex + 1} de {testSequence.length} · {AXES_CONFIG[currentTest.axisId].name}
              </span>
              {safetyStatus === 'amber' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Modo Precaución</span>
                </span>
              )}
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-300"
                style={{ width: `${((currentTestIndex + 1) / testSequence.length) * 100}%` }}
              />
            </div>
          </div>

          {/* SELECTOR DE TURNOS PARA MODO FAMILIA */}
          {mode === 'family' && (
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Turno en esta prueba ({currentTest.shortName}):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {participants.map((p, idx) => {
                  const isCurrentTurn = currentParticipantIndex === idx;
                  const hasResultInThisTest = p.inputs[currentTestId] !== undefined;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setCurrentParticipantIndex(idx)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-1.5 ${
                        isCurrentTurn
                          ? 'border-sky-500 bg-white dark:bg-slate-900 shadow-sm ring-2 ring-sky-400 font-bold'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="text-xs truncate">{p.alias}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{p.age} años</p>
                      </div>
                      {hasResultInThisTest ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ficha Visual Dual Técnica de la Prueba */}
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {currentTest.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {currentParticipant ? `Registrando para: ${currentParticipant.alias} (${currentParticipant.age} años)` : ''}
            </p>
            <TestIllustration testId={currentTestId} />
          </div>

          {/* Protocolo y Seguridad */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <p className="font-bold text-slate-900 dark:text-white">Cómo realizarla:</p>
            <ul className="space-y-1">
              {currentTest.protocolSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-sky-600 font-bold">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Temporizador / Modo de entrada interactivo */}
          <div className="pt-2">
            {currentTest.timerMode === 'countdown' && (
              <CountdownTimer
                key={`${currentTestId}-${currentParticipant.id}`}
                durationSeconds={currentTest.durationSeconds || 30}
                testName={currentTest.shortName}
                unit={currentTest.unit}
                onFinish={(val) => handleSaveScore(val)}
              />
            )}

            {currentTest.timerMode === 'stopwatch' && (
              <StopwatchTimer
                key={`${currentTestId}-${currentParticipant.id}`}
                testName={currentTest.shortName}
                maxSeconds={currentTest.maxSeconds}
                direction={currentTest.direction}
                onFinish={(val) => handleSaveScore(val)}
              />
            )}

            {currentTest.timerMode === 'manual_scale' && currentTest.visualScaleOptions && (
              <ManualScaleInput
                key={`${currentTestId}-${currentParticipant.id}`}
                testName={currentTest.shortName}
                visualScaleOptions={currentTest.visualScaleOptions}
                onFinish={(val) => handleSaveScore(val)}
              />
            )}
          </div>

          {/* LEY ANTI-TRAMPAS VISIBLE: Botón para omitir */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={currentTestIndex === 0 && currentParticipantIndex === 0}
              onClick={() => {
                if (mode === 'family' && currentParticipantIndex > 0) {
                  setCurrentParticipantIndex((prev) => prev - 1);
                } else if (currentTestIndex > 0) {
                  setCurrentTestIndex((prev) => prev - 1);
                  if (mode === 'family') setCurrentParticipantIndex(participants.length - 1);
                }
              }}
              className="min-h-[46px] px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4 inline mr-1" />
              <span>Anterior</span>
            </button>

            {/* Botón Explícito de Ley Anti-Trampas */}
            <button
              type="button"
              onClick={() => handleSaveScore(null)}
              className="min-h-[46px] px-4 py-2 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs font-bold transition-colors"
            >
              <span>No realizada / Saltar (suma 0 pts)</span>
            </button>
          </div>
        </section>
      )}

      {/* Modal interactivo de LivingRoomKit */}
      {isKitModalOpen && (
        <LivingRoomKit
          isOpenModal={true}
          onCloseModal={() => setIsKitModalOpen(false)}
          onReady={() => setIsKitModalOpen(false)}
        />
      )}
    </div>
  );
}

export default function EvaluarPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Cargando evaluación...</div>}>
      <EvaluarContent />
    </Suspense>
  );
}
