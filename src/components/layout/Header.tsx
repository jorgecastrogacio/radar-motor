'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Activity, HeartHandshake, PhoneCall } from 'lucide-react';
import { SosModal } from '../safety/SosModal';

export function Header() {
  const [isSosOpen, setIsSosOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/95 transition-colors print:hidden">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          {/* Logo y Nombre Principal */}
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-xl py-1 px-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-sm">
              <Activity className="h-5 w-5" />
            </span>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-none">
                RADAR MOTOR
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                Autoevaluación Familiar
              </span>
            </div>
          </Link>

          {/* Navegación y Píldora SOS */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Enlace directo a Primeros Auxilios */}
            <Link
              href="/primeros-auxilios"
              className="flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <HeartHandshake className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span className="hidden xs:inline">Primeros Auxilios</span>
              <span className="xs:hidden">Auxilios</span>
            </Link>

            {/* Píldora Persistente SOS · 112 (Ámbar suave / Coral protector, NO rojo de pánico) */}
            <button
              type="button"
              onClick={() => setIsSosOpen(true)}
              aria-label="Abrir protocolo de emergencias y llamada directa al 112"
              className="flex items-center gap-2 min-h-[44px] px-3.5 sm:px-4 py-2 rounded-full border border-amber-300/80 bg-amber-50 hover:bg-amber-100/90 active:scale-95 text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 dark:text-amber-200 transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <PhoneCall className="h-4 w-4 text-amber-700 dark:text-amber-400" />
              <span className="text-xs sm:text-sm font-bold tracking-wide">
                SOS · 112
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Modal accesible de emergencias */}
      <SosModal isOpen={isSosOpen} onClose={() => setIsSosOpen(false)} />
    </>
  );
}
