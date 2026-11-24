'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  HeartHandshake,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { SAFETY_QUESTIONS, SafetyQuestion, SafetyTrafficLight } from '../../data/first-aid';

interface SafetyScreenerProps {
  onProceed?: (trafficLight: SafetyTrafficLight) => void;
}

export function SafetyScreener({ onProceed }: SafetyScreenerProps) {
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({
    red_stop: null,
    amber_cardiovascular: null,
    amber_joint: null,
  });

  const handleAnswer = (questionId: string, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleReset = () => {
    setAnswers({
      red_stop: null,
      amber_cardiovascular: null,
      amber_joint: null,
    });
  };

  const isAllAnswered = Object.values(answers).every((val) => val !== null);

  // Determinar color del semáforo
  let trafficLight: SafetyTrafficLight = 'green';
  if (answers.red_stop === true) {
    trafficLight = 'red';
  } else if (answers.amber_cardiovascular === true || answers.amber_joint === true) {
    trafficLight = 'amber';
  }

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md p-6 sm:p-8 space-y-8">
      {/* Encabezado del Semáforo */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 mb-3">
          <ShieldCheck className="h-4 w-4" />
          <span>Filtro de Seguridad Previo (PAR-Q+ Adaptado)</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Antes de empezar: Cuestionario de Seguridad
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
          Responde a estas 3 breves preguntas para garantizar que realizas las pruebas con total tranquilidad y bienestar adaptado a tu condición.
        </p>
      </div>

      {/* Lista de las 3 preguntas binarias */}
      <div className="space-y-6">
        {SAFETY_QUESTIONS.map((q, idx) => {
          const currentAnswer = answers[q.id];
          return (
            <div
              key={q.id}
              className={`p-5 rounded-2xl border transition-all ${
                currentAnswer === null
                  ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
                  : currentAnswer === true && q.level === 'red'
                  ? 'border-red-300 dark:border-red-800 bg-red-50/60 dark:bg-red-950/30'
                  : currentAnswer === true && q.level === 'amber'
                  ? 'border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30'
                  : 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1 space-y-1.5">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {q.question}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {q.description}
                  </p>
                </div>
              </div>

              {/* Botones de respuesta Sí / No accesibles (mínimo 44px de altura) */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => handleAnswer(q.id, true)}
                  className={`min-h-[44px] px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    currentAnswer === true
                      ? q.level === 'red'
                        ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-400'
                        : 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>Sí</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAnswer(q.id, false)}
                  className={`min-h-[44px] px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    currentAnswer === false
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>No</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resultado dinámico del Semáforo cuando se completan las 3 preguntas */}
      {isAllAnswered && (
        <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {trafficLight === 'red' && (
            <div className="rounded-3xl border-2 border-red-300 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/40 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white shadow-sm">
                  <AlertCircle className="h-7 w-7" />
                </span>
                <div>
                  <h4 className="text-lg font-black text-red-900 dark:text-red-200">
                    Semáforo Rojo: Aplazar la Evaluación
                  </h4>
                  <p className="text-xs text-red-800 dark:text-red-300">
                    Prioridad absoluta a tu salud y bienestar
                  </p>
                </div>
              </div>
              <p className="text-sm text-red-900 dark:text-red-200 leading-relaxed font-medium">
                Has indicado síntomas o molestias recientes importantes. Por precaución, no debes realizar las pruebas de esfuerzo hoy. Te recomendamos consultar con tu médico de cabecera antes de retomar la actividad motriz.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 font-semibold text-sm hover:bg-red-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Revisar respuestas</span>
                </button>
              </div>
            </div>
          )}

          {trafficLight === 'amber' && (
            <div className="rounded-3xl border-2 border-amber-300 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/40 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-sm">
                  <AlertTriangle className="h-7 w-7" />
                </span>
                <div>
                  <h4 className="text-lg font-black text-amber-950 dark:text-amber-200">
                    Semáforo Ámbar: Evaluación con Precaución
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Ritmo suave y sin prisas
                  </p>
                </div>
              </div>
              <p className="text-sm text-amber-950 dark:text-amber-200 leading-relaxed">
                Puedes realizar la autoevaluación adaptándola a tu sensación de comodidad. Mantén un ritmo pausado, descansa ampliamente entre ejercicios y no dudes en saltarte cualquier prueba que te incomode (o probar el <strong>Modo Express</strong> de solo 3 pruebas).
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onProceed?.('amber')}
                  className="flex-1 min-h-[48px] px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Continuar a ritmo suave</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="min-h-[48px] px-4 py-2.5 rounded-2xl border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-xs font-semibold transition-colors"
                >
                  Revisar
                </button>
              </div>
            </div>
          )}

          {trafficLight === 'green' && (
            <div className="rounded-3xl border-2 border-emerald-300 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/40 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
                  <CheckCircle className="h-7 w-7" />
                </span>
                <div>
                  <h4 className="text-lg font-black text-emerald-950 dark:text-emerald-200">
                    Semáforo Verde: Adelante con la Evaluación
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    Sin criterios restrictivos detectados
                  </p>
                </div>
              </div>
              <p className="text-sm text-emerald-950 dark:text-emerald-200 leading-relaxed">
                No has indicado ninguna limitación previa relevante. Recuerda disfrutar del movimiento, calzar calzado cómodo y no forzar si aparece cansancio.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onProceed?.('green')}
                  className="flex-1 min-h-[48px] px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Comenzar Autoevaluación Motriz</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="min-h-[48px] px-4 py-2.5 rounded-2xl border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs font-semibold transition-colors"
                >
                  Revisar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
