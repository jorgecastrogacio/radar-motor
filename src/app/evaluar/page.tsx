'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Layers,
  Plus,
  ShieldAlert,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  ALL_TEST_IDS,
  EXPRESS_TEST_IDS,
  TESTS_CATALOG,
} from '../../data/tests-catalog';
import { CATEGORY_THEMES } from '../../data/category-theme';
import { Sex, TestId } from '../../types/radar-motor';
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
import { decodeChallengePayload } from '../../lib/share-codec';

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

  // Desafío recibido (?reto=...)
  const { challengeData, isChallengeCorrupt } = React.useMemo(() => {
    if (!retoParam) return { challengeData: null, isChallengeCorrupt: false };
    const decoded = decodeChallengePayload(retoParam);
    if (decoded) return { challengeData: decoded, isChallengeCorrupt: false };
    return { challengeData: null, isChallengeCorrupt: true };
  }, [retoParam]);

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

  // Redirigir a /aula si se solicita ?mode=aula
  useEffect(() => {
    if (modeParam === 'aula') {
      router.replace('/aula');
    }
  }, [modeParam, router]);

  // Sesión previa guardada detectada (sin forzar salto a paso 3 ni descartar en silencio)
  const [savedSession, setSavedSession] = useState<ActiveSession | null>(null);
  const [hasResolvedSavedPrompt, setHasResolvedSavedPrompt] = useState(false);
  const isEvaluationCompleted = useRef(false);

  useEffect(() => {
    const saved = loadActiveSession();
    if (saved && saved.participants.length > 0) {
      queueMicrotask(() => {
        setSavedSession(saved);
      });
    }
  }, []);

  const handleResumeSavedSession = () => {
    if (!savedSession) return;
    if (savedSession.mode !== mode) {
      router.push(`/evaluar?mode=${savedSession.mode}`);
      return;
    }
    const validTestIndex = Math.min(Math.max(0, savedSession.currentTestIndex || 0), testSequence.length - 1);
    const validPartIndex = Math.min(Math.max(0, savedSession.currentParticipantIndex || 0), Math.max(0, savedSession.participants.length - 1));
    setSafetyStatus(savedSession.safetyStatus);
    setParticipants(savedSession.participants);
    setCurrentTestIndex(validTestIndex);
    setCurrentParticipantIndex(validPartIndex);
    setStep(3);
    setHasResolvedSavedPrompt(true);
  };

  const handleDiscardSavedSession = () => {
    clearActiveSession();
    setSavedSession(null);
    setHasResolvedSavedPrompt(true);
  };

  // Guardar sesión activa ante cualquier cambio durante la ejecución (paso 3)
  useEffect(() => {
    if (step === 3 && !isEvaluationCompleted.current) {
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
  const safeTestIndex = Math.min(Math.max(0, currentTestIndex), Math.max(0, testSequence.length - 1));
  const currentTestId = testSequence[safeTestIndex] || testSequence[0] || 'chair_stand_30s';
  const currentTest = TESTS_CATALOG[currentTestId] || TESTS_CATALOG['chair_stand_30s'];
  const safePartIndex = Math.min(Math.max(0, currentParticipantIndex), Math.max(0, participants.length - 1));
  const currentParticipant = participants[safePartIndex] || participants[0];

  const handleSaveScore = (rawValue: number | null) => {
    const updatedParticipants = participants.map((p, idx) => {
      if (idx !== currentParticipantIndex) return p;
      return {
        ...p,
        inputs: {
          ...p.inputs,
          [currentTestId]: rawValue,
        },
      };
    });

    setParticipants(updatedParticipants);

    // En modo familia: avanzar al siguiente participante en ESTA misma prueba
    if (mode === 'family' && currentParticipantIndex < participants.length - 1) {
      setCurrentParticipantIndex((prev) => prev + 1);
    } else {
      // Si todos los participantes hicieron la prueba actual, pasar a la siguiente prueba
      if (currentTestIndex < testSequence.length - 1) {
        setCurrentTestIndex((prev) => prev + 1);
        setCurrentParticipantIndex(0); // Reiniciar turno al primer participante en la nueva prueba
      } else {
        // Fin de la evaluación pasando explícitamente los participantes actualizados
        handleCompleteEvaluation(updatedParticipants);
      }
    }
  };

  const handleCompleteEvaluation = (finalParticipants?: Participant[]) => {
    isEvaluationCompleted.current = true;
    const participantsToEvaluate = finalParticipants || participants;
    // Calcular informes con scoring engine
    const evaluationMode = mode === 'express' ? 'express' : 'full';
    const reportItems = participantsToEvaluate.map((p) => {
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

  if (modeParam === 'aula') {
    return (
      <div className="flex-1 max-w-md mx-auto p-12 text-center text-slate-500 text-sm">
        Redirigiendo al Modo Aula (/aula)...
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-8">
      {/* Banner de Desafío Recibido (?reto=...) */}
      {challengeData && (
        <div className="rounded-3xl border-2 border-amber-400 bg-amber-50/90 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-200 text-amber-950 shrink-0">
              <Sparkles className="h-6 w-6 text-amber-800" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200/80 text-amber-900 mb-1">
                ¡Reto Motor Recibido!
              </div>
              <p className="font-extrabold text-amber-950 text-base">
                {challengeData.alias} ({challengeData.age} años) te ha desafiado
              </p>
              <p className="text-xs text-amber-800">
                Puntuación rival a batir:{' '}
                <strong className="tabular-nums font-bold">
                  {challengeData.globalAverage !== undefined
                    ? `${challengeData.globalAverage} pts (/ 100)`
                    : `${challengeData.globalScore} pts`}
                </strong>
                . Al terminar, tu radar se superpondrá directamente al suyo.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs font-bold text-amber-900 bg-white/80 px-3 py-1.5 rounded-xl border border-amber-300">
              {mode === 'express' ? 'Modo Exprés (3 pruebas)' : 'Modo Completo (18 pruebas)'}
            </span>
          </div>
        </div>
      )}

      {/* Aviso de Enlace de Reto Inválido */}
      {isChallengeCorrupt && (
        <div className="rounded-2xl border border-slate-300 bg-slate-100 p-4 text-slate-700 text-xs flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <span>El enlace de reto recibido no es válido o está dañado. Puedes continuar con tu evaluación de forma normal.</span>
        </div>
      )}

      {/* Diálogo de Elección de Sesión Activa Guardada */}
      {savedSession && !hasResolvedSavedPrompt && (
        <div className="rounded-3xl border-2 border-indigo-300 bg-indigo-50/90 p-5 shadow-sm space-y-3 animate-in fade-in duration-150">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-200 text-indigo-950 shrink-0">
              <Clock className="h-6 w-6 text-indigo-800" />
            </div>
            <div>
              <p className="font-extrabold text-indigo-950 text-sm sm:text-base">
                {savedSession.mode !== mode
                  ? `Tienes una evaluación en curso en Modo ${savedSession.mode === 'express' ? 'Exprés' : savedSession.mode === 'family' ? 'Familia' : 'Completo'}`
                  : `Tienes una evaluación en curso en este modo`}
              </p>
              <p className="text-xs text-indigo-900 mt-0.5">
                Progreso guardado: Prueba {savedSession.currentTestIndex + 1} ({savedSession.participants.map((p) => p.alias).join(', ')}). ¿Deseas continuar donde lo dejaste o empezar una nueva evaluación desde el principio?
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 pt-1 sm:pl-11">
            <button
              type="button"
              onClick={handleResumeSavedSession}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Continuar evaluación en curso ({savedSession.mode === 'express' ? 'Exprés' : savedSession.mode === 'family' ? 'Familia' : 'Completa'})
            </button>
            <button
              type="button"
              onClick={handleDiscardSavedSession}
              className="px-4 py-2.5 rounded-xl border border-indigo-300 bg-white hover:bg-indigo-100 text-indigo-950 text-xs font-bold transition-colors cursor-pointer"
            >
              Empezar una nueva en Modo {mode === 'express' ? 'Exprés' : mode === 'family' ? 'Familia' : 'Completo'}
            </button>
          </div>
        </div>
      )}
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
                        value={p.age === 0 ? '' : p.age}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : Math.max(0, Math.min(99, parseInt(e.target.value, 10) || 0));
                          handleUpdateParticipant(idx, 'age', val);
                        }}
                        onBlur={() => {
                          const clamped = Math.max(6, Math.min(99, p.age || 6));
                          handleUpdateParticipant(idx, 'age', clamped);
                        }}
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
              onClick={() => {
                if (currentTestIndex >= testSequence.length) {
                  setCurrentTestIndex(0);
                  setCurrentParticipantIndex(0);
                }
                setStep(3);
              }}
              className="min-h-[52px] px-8 py-3 rounded-2xl bg-[#047857] hover:bg-[#059669] text-white font-bold text-base transition-all shadow-md flex items-center gap-2 btn-press"
            >
              <span>¡Empezar pruebas!</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </section>
      )}

      {/* =========================================================================
          PASO 3: PANTALLA DE EJECUCIÓN (PRUEBA A PRUEBA) - SISTEMA DE CATEGORÍAS
      ========================================================================= */}
      {step === 3 && currentTest && currentParticipant && (() => {
        const theme = CATEGORY_THEMES[currentTest.axisId] || CATEGORY_THEMES['lower_body_strength'];
        return (
          <section className="space-y-6 animate-in fade-in duration-150">
            {/* Tarjeta de Categoría Oficial (Bloque 3/5) */}
            <div className="rounded-[22px] bg-white border border-slate-200 shadow-md overflow-hidden">
              {/* Cabecera sólida de la Categoría */}
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
                      Prueba {currentTestIndex + 1} de {testSequence.length} · {currentTest.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {safetyStatus === 'amber' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-300 text-amber-950 shadow-xs">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Modo Precaución</span>
                    </span>
                  )}
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-xs">
                    {mode === 'express' ? 'Modo Exprés (6)' : mode === 'family' ? 'Modo Familia' : 'Test Completo (18)'}
                  </span>
                </div>
              </div>

              {/* Tira de puntos (Dots Progress) inmediatamente bajo la cabecera */}
              <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto">
                {testSequence.map((tId, idx) => {
                  const isCurrent = idx === currentTestIndex;
                  const isDone = idx < currentTestIndex;
                  return (
                    <div
                      key={tId}
                      className={`h-2.5 rounded-full transition-all ${isCurrent ? 'w-6' : 'w-2.5'}`}
                      style={{
                        backgroundColor: isCurrent || isDone ? theme.color : '#CBD5E1',
                      }}
                    />
                  );
                })}
              </div>

              {/* Cuerpo de la tarjeta */}
              <div className="p-5 sm:p-6 space-y-6">
                {/* SELECTOR DE TURNOS PARA MODO FAMILIA */}
                {mode === 'family' && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
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
                            className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-1.5 btn-press ${
                              isCurrentTurn
                                ? 'border-2 shadow-sm font-bold bg-white'
                                : 'border-slate-200 bg-white/60 text-slate-700'
                            }`}
                            style={isCurrentTurn ? { borderColor: theme.colorText } : {}}
                          >
                            <div className="overflow-hidden">
                              <p className="text-xs truncate">{p.alias}</p>
                              <p className="text-[10px] text-slate-500">{p.age} años</p>
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

                {/* Título de la prueba con chip circular */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs"
                      style={{ backgroundColor: theme.colorText }}
                    >
                      {currentTest.order}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {currentTest.name}
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 pl-9">
                    {currentParticipant ? `Registrando para: ${currentParticipant.alias} (${currentParticipant.age} años) · ` : ''}
                    Unidad: <strong>{currentTest.unit}</strong>
                  </p>
                </div>

                {/* Ficha Visual Dual Técnica de la Prueba con Píldora de Procedencia */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Guía Técnica de Movimiento
                    </span>
                    <span className="badge-provenance-tech">
                      Referencia técnica vectorial
                    </span>
                  </div>
                  <TestIllustration testId={currentTestId} />
                </div>

                {/* Protocolo y Seguridad con Píldora de Nota */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5 space-y-2">
                    <p className="font-bold text-xs uppercase tracking-wide text-slate-900">
                      Cómo realizarla:
                    </p>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                      {currentTest.protocolSteps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="font-bold mt-0.5" style={{ color: theme.colorText }}>•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-4 sm:p-5 space-y-2.5">
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
                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
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
                    className="min-h-[46px] px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 disabled:opacity-30 btn-press"
                  >
                    <ChevronLeft className="h-4 w-4 inline mr-1" />
                    <span>Anterior</span>
                  </button>

                  {/* Botón Explícito de Ley Anti-Trampas */}
                  <button
                    type="button"
                    onClick={() => handleSaveScore(null)}
                    className="min-h-[46px] px-4 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold transition-colors btn-press"
                  >
                    <span>No realizada / Saltar (suma 0 pts)</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

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
