'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Activity,
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronRight,
  Flame,
  Layers,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { ALL_AXIS_IDS, AXES_CONFIG, TESTS_CATALOG } from '../../data/tests-catalog';
import { loadLastReport, SavedReport } from '../../lib/session-store';

function InformeContent() {
  const searchParams = useSearchParams();
  const challengeParam = searchParams.get('reto');

  const [savedData, setSavedData] = useState<SavedReport | null>(null);
  const [selectedParticipantIdx, setSelectedParticipantIdx] = useState(0);

  useEffect(() => {
    const reportData = loadLastReport();
    setSavedData(reportData);
  }, []);

  if (!savedData || savedData.items.length === 0) {
    return (
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-16 text-center space-y-6">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-500">
          <Activity className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Aún no hay ningún informe generado
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Completa tu autoevaluación motriz (Reto Exprés o Chequeo Completo) para generar tu mapa funcional de salud.
          </p>
        </div>
        <Link
          href="/evaluar"
          className="inline-flex items-center gap-2 min-h-[48px] px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all"
        >
          <span>Comenzar evaluación ahora</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </main>
    );
  }

  const currentItem = savedData.items[selectedParticipantIdx] || savedData.items[0];
  const { participant, report } = currentItem;

  const isFamily = savedData.mode === 'family';
  const isExpress = savedData.mode === 'express';

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* Banner de Reto si se recibió ?reto= */}
      {challengeParam && (
        <div className="rounded-3xl border-2 border-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 p-5 shadow-sm flex items-center gap-3.5">
          <Sparkles className="h-6 w-6 text-indigo-600 shrink-0" />
          <div className="text-xs sm:text-sm text-indigo-950 dark:text-indigo-200">
            <span className="font-bold">¡Perfil registrado para el desafío!</span> En la Fase 5 se activará el renderizado SVG superpuesto para comparar ambos radares y exportar tu tarjeta de reto.
          </div>
        </div>
      )}

      {/* Selector de Miembros Familiares si es Modo Familia */}
      {isFamily && savedData.items.length > 1 && (
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Informes de la Familia ({savedData.items.length} participantes):
          </span>
          <div className="flex flex-wrap gap-2">
            {savedData.items.map((item, idx) => (
              <button
                key={item.participant.id}
                type="button"
                onClick={() => setSelectedParticipantIdx(idx)}
                className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  selectedParticipantIdx === idx
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>{item.participant.alias} ({item.participant.age}a)</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tarjeta de Resumen Global y Nivel Constructivo */}
      <section className="rounded-3xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white p-6 sm:p-8 space-y-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-sky-300 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Informe Oficial RADAR MOTOR</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              {participant.alias} ({participant.age} años)
            </h1>
            <p className="text-xs text-slate-400">
              Corte normativo: {report.ageBracket === '80+' ? '80+ años' : `${report.ageBracket} años`} · Modalidad: {isExpress ? 'Exprés (3 pruebas)' : 'Completo (18 pruebas)'}
            </p>
          </div>

          <div className="text-right sm:text-right">
            <span className="text-xs uppercase tracking-wider text-slate-400 block">
              Nivel Global
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 inline-block">
              {report.globalAverage >= 85
                ? 'Referente'
                : report.globalAverage >= 55
                ? 'Sólido'
                : report.globalAverage >= 25
                ? 'En Progreso'
                : 'Base'}
            </span>
          </div>
        </div>

        {/* Cifras Globales */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div className="space-y-1">
            <span className="text-xs text-slate-400">Media Global (0-100)</span>
            <p className="text-3xl sm:text-4xl font-mono font-black text-white tabular-nums">
              {report.globalAverage}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-400">Puntuación Total</span>
            <p className="text-3xl sm:text-4xl font-mono font-black text-sky-400 tabular-nums">
              {report.globalScore} <span className="text-base text-slate-400">/ {isExpress ? '300' : '600'}</span>
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1 space-y-1">
            <span className="text-xs text-slate-400">Pruebas Realizadas</span>
            <p className="text-3xl sm:text-4xl font-mono font-black text-emerald-400 tabular-nums">
              {report.completedCount} <span className="text-base text-slate-400">/ {report.totalTests}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Desglose por los 6 Ejes Funcionales */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-sky-600" />
          <span>Desglose por Ejes de Capacidad Motriz</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALL_AXIS_IDS.map((axisId) => {
            const ax = report.axisResults[axisId];
            if (!ax) return null;

            return (
              <div
                key={axisId}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {ax.name}
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Nivel: <strong className="text-slate-800 dark:text-slate-200">{ax.level}</strong>
                    </span>
                  </div>
                  <span className="text-xl font-mono font-black text-slate-900 dark:text-white tabular-nums">
                    {ax.score} <span className="text-xs font-normal text-slate-400">pts</span>
                  </span>
                </div>

                {/* Barra de nivel */}
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      ax.score >= 85
                        ? 'bg-indigo-600'
                        : ax.score >= 55
                        ? 'bg-emerald-500'
                        : ax.score >= 25
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                    style={{ width: `${Math.min(100, ax.score)}%` }}
                  />
                </div>

                {/* Pruebas dentro de este eje */}
                {ax.testResults.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    {ax.testResults.map((tr) => (
                      <div key={tr.testId} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                          {tr.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono">
                            {tr.skipped ? 'Saltada (0 pts)' : `${tr.rawValue} ${tr.unit}`}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              tr.zsmStatus === 'in_zsm' || tr.zsmStatus === 'above_zsm'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {tr.zsmStatus === 'in_zsm'
                              ? 'En ZSM'
                              : tr.zsmStatus === 'above_zsm'
                              ? 'Sobresaliente'
                              : 'Por debajo'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Llamada a la Acción si se hizo solo Exprés */}
      {isExpress && (
        <section className="rounded-3xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/60 dark:bg-indigo-950/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-indigo-950 dark:text-indigo-200">
              ¿Quieres descubrir tu perfil motor completo en los 6 ejes?
            </h3>
            <p className="text-xs text-indigo-900/80 dark:text-indigo-300">
              Has completado el Reto Exprés de 3 pruebas. Da el siguiente paso con las 18 pruebas universales.
            </p>
          </div>
          <Link
            href="/evaluar?mode=full"
            className="shrink-0 min-h-[46px] px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>Hacer Chequeo Completo (18 pruebas)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}

      {/* Acciones Finales */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <Link
          href="/evaluar"
          className="min-h-[46px] px-5 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Repetir o Nueva Evaluación</span>
        </Link>
        <Link
          href="/"
          className="min-h-[46px] px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
        >
          <span>Ir a la Portada</span>
        </Link>
      </div>
    </main>
  );
}

export default function InformePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Cargando informe...</div>}>
      <InformeContent />
    </Suspense>
  );
}
