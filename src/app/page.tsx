'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Armchair,
  BookOpen,
  CheckCircle2,
  HeartHandshake,
  ShieldCheck,
  Timer,
} from 'lucide-react';
import { SafetyScreener } from '../components/safety/SafetyScreener';
import { LivingRoomKit } from '../components/kit/LivingRoomKit';
import { TestExecutionPanel } from '../components/timers/TestExecutionPanel';
import { SafetyTrafficLight } from '../data/first-aid';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'screener' | 'kit' | 'timers'>('timers');
  const [screenedStatus, setScreenedStatus] = useState<SafetyTrafficLight | null>(null);

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* Portada / Intro de Bienvenida */}
      <section className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <Activity className="h-3.5 w-3.5" />
          <span>Fase 3: Sintetizador Web Audio, 18 Ilustraciones SVG y Temporizadores Activos</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          RADAR MOTOR
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Autoevaluación motriz familiar y escolar 100% client-side. Coste 0 €, cero backend, máxima privacidad y rigor biomecánico.
        </p>
      </section>

      {/* Selector de Sección Interactiva */}
      <section className="flex items-center justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 max-w-full overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('timers')}
            className={`min-h-[44px] px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'timers'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Timer className="h-4 w-4 text-sky-600" />
            <span>18 Pruebas & Temporizadores</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kit')}
            className={`min-h-[44px] px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'kit'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Armchair className="h-4 w-4 text-amber-600" />
            <span>Kit de Salón 30s</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('screener')}
            className={`min-h-[44px] px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'screener'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Semáforo PAR-Q+</span>
          </button>
        </div>
      </section>

      {/* Contenido según la pestaña activa */}
      {activeTab === 'timers' && (
        <section className="animate-in fade-in duration-150">
          <TestExecutionPanel />
        </section>
      )}

      {activeTab === 'kit' && (
        <section className="animate-in fade-in duration-150">
          <LivingRoomKit onReady={() => setActiveTab('timers')} />
        </section>
      )}

      {activeTab === 'screener' && (
        <section className="space-y-6 animate-in fade-in duration-150">
          <SafetyScreener onProceed={(status) => {
            setScreenedStatus(status);
            setActiveTab('timers');
          }} />

          {screenedStatus && (
            <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-center">
              <p className="text-sm font-semibold text-sky-900 dark:text-sky-200">
                Filtro de seguridad registrado: Semáforo <span className="uppercase font-bold">{screenedStatus}</span>.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Acceso Rápido a Primeros Auxilios */}
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
