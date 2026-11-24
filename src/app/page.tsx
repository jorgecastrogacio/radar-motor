'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Activity, BookOpen, CheckCircle, HeartHandshake, ShieldCheck } from 'lucide-react';
import { SafetyScreener } from '../components/safety/SafetyScreener';
import { SafetyTrafficLight } from '../data/first-aid';

export default function Home() {
  const [screenedStatus, setScreenedStatus] = useState<SafetyTrafficLight | null>(null);

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* Portada / Intro de Bienvenida */}
      <section className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <Activity className="h-3.5 w-3.5" />
          <span>Fase 2: Blindaje Médico y Semáforo de Seguridad Activo</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          RADAR MOTOR
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Autoevaluación motriz familiar y escolar 100% en tu navegador. Cero backend, máxima privacidad y seguridad preventiva integral.
        </p>
      </section>

      {/* Componente del Semáforo de Seguridad Previo */}
      <section>
        <SafetyScreener onProceed={(status) => setScreenedStatus(status)} />
      </section>

      {/* Notificación si ha procedido */}
      {screenedStatus && (
        <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-center animate-in fade-in duration-200">
          <p className="text-sm font-semibold text-sky-900 dark:text-sky-200">
            Filtro de seguridad completado (Semáforo: <span className="uppercase font-bold">{screenedStatus}</span>).
            Preparado para la Fase 3 (Flujo guiado de evaluación y cronómetros client-side).
          </p>
        </div>
      )}

      {/* Acceso Rápido Educativo */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <HeartHandshake className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              ¿Quieres consultar las pautas de actuación en emergencias?
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Protocolo PAS, mareos, torceduras, dolor torácico y posición lateral (PLS).
            </p>
          </div>
        </div>
        <Link
          href="/primeros-auxilios"
          className="shrink-0 inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-all shadow-sm"
        >
          <BookOpen className="h-4 w-4" />
          <span>Ver Primeros Auxilios</span>
        </Link>
      </section>
    </main>
  );
}
