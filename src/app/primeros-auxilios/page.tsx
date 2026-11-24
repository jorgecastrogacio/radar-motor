'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  HeartHandshake,
  HeartPulse,
  LifeBuoy,
  PhoneCall,
  Shield,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import { FIRST_AID_GUIDES, FirstAidGuide, PAS_PROTOCOL } from '../../data/first-aid';

export default function PrimerosAuxiliosPage() {
  const [selectedGuideId, setSelectedGuideId] = useState<FirstAidGuide['id']>('fainting');

  const selectedGuide = FIRST_AID_GUIDES.find((g) => g.id === selectedGuideId) || FIRST_AID_GUIDES[0];

  const getGuideIcon = (id: FirstAidGuide['id']) => {
    switch (id) {
      case 'fainting':
        return <Activity className="h-5 w-5" />;
      case 'injury':
        return <ShieldAlert className="h-5 w-5" />;
      case 'chest_pain':
        return <HeartPulse className="h-5 w-5" />;
      case 'choking_pls':
        return <LifeBuoy className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F1EB] pb-16">
      {/* Barra de navegación superior de la página */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors btn-press"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a RADAR MOTOR</span>
          </Link>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Guía Formativa de Seguridad
          </span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-10">
        {/* Encabezado */}
        <section className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
            <HeartHandshake className="h-4 w-4" />
            <span>Basado en directrices del ERC (European Resuscitation Council) y Cruz Roja</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Primeros Auxilios en el Hogar y la Actividad Motriz
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            Pautas claras, serenas y seguras para actuar con eficacia ante cualquier imprevisto físico, adaptadas a todas las edades: niños, jóvenes y adultos mayores.
          </p>
        </section>

        {/* Sección 1: El Protocolo Universal PAS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Shield className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              <span>La Regla de Oro: Protocolo PAS (Proteger · Avisar · Socorrer)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PAS_PROTOCOL.map((pas) => (
              <div
                key={pas.step}
                className={`rounded-3xl p-6 border ${pas.colorBorder} ${pas.colorBg} flex flex-col justify-between space-y-4 shadow-xs`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl font-black text-lg shadow-sm ${pas.badgeBg}`}>
                      {pas.step}
                    </span>
                    <div>
                      <span className="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                        Paso {pas.step === 'P' ? '1' : pas.step === 'A' ? '2' : '3'}
                      </span>
                      <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                        {pas.title}
                      </h3>
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 mb-1.5">
                    {pas.action}
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {pas.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sección 2: Fichas Prácticas Visuales de Actuación */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <span>Fichas de Actuación según la Situación</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Selecciona una ficha para consultar qué hacer, los errores a evitar y cuándo llamar al 112.
            </p>
          </div>

          {/* Selector de Fichas (Tabs accesibles para móviles y desktop) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {FIRST_AID_GUIDES.map((g) => {
              const isSelected = g.id === selectedGuideId;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGuideId(g.id)}
                  className={`min-h-[56px] p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'border-sky-500 bg-white dark:bg-slate-900 shadow-md ring-2 ring-sky-400'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      isSelected
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {getGuideIcon(g.id)}
                  </span>
                  <div className="overflow-hidden">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-sky-950 dark:text-white' : ''}`}>
                      {g.title.split('(')[0]}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {g.id === 'fainting' ? 'Lipotimia y tensión' : g.id === 'injury' ? 'Caídas y torceduras' : g.id === 'chest_pain' ? 'Opresión y ahogo' : 'OVACE y PLS'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detalle de la Ficha Seleccionada */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                  {getGuideIcon(selectedGuide.id)}
                </span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {selectedGuide.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {selectedGuide.subtitle}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Columna Qué HACER */}
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 space-y-3.5">
                <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <h4 className="font-bold text-sm tracking-wide uppercase">
                    Qué SÍ hacer (Paso a paso)
                  </h4>
                </div>
                <ul className="space-y-3">
                  {selectedGuide.stepsToDo.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-[11px] mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Columna Lo que NO hacer */}
              <div className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20 p-5 space-y-3.5">
                <div className="flex items-center gap-2 text-red-900 dark:text-red-200">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                  <h4 className="font-bold text-sm tracking-wide uppercase">
                    Lo que NUNCA debes hacer
                  </h4>
                </div>
                <ul className="space-y-3">
                  {selectedGuide.whatNotToDo.map((warning, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-white font-bold text-[11px] mt-0.5">
                        ✕
                      </span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Señales de Alarma / Cuándo llamar al 112 */}
            <div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30 p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-950 dark:text-amber-200">
                <AlertOctagon className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <h4 className="font-bold text-sm tracking-wide uppercase">
                  Señales de Alarma Inmediata: Llama al 112
                </h4>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedGuide.alarmSigns.map((sign, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-amber-200/80 dark:border-amber-900 text-xs text-amber-950 dark:text-amber-100 font-medium leading-snug flex items-start gap-2"
                  >
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Tarjeta de Respaldo Telefónico 112 */}
        <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">
              Teléfono Gratuito Europeo de Emergencias
            </span>
            <h3 className="text-2xl font-black">
              112: Disponible 24 horas al día, 365 días al año
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Ante cualquier duda grave sobre el estado de una persona, no dudes en llamar. El personal médico orientará tus pasos por teléfono hasta la llegada del equipo asistencial.
            </p>
          </div>
          <a
            href="tel:112"
            className="shrink-0 flex items-center gap-2.5 min-h-[50px] px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base transition-all shadow-md active:scale-95"
          >
            <PhoneCall className="h-5 w-5" />
            <span>Llamar al 112</span>
          </a>
        </section>
      </main>
    </div>
  );
}
