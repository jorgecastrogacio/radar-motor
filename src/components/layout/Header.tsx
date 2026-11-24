'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Activity, HeartHandshake, PhoneCall } from 'lucide-react';
import { SosModal } from '../safety/SosModal';

export function Header() {
  const [isSosOpen, setIsSosOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-stone-200/90 bg-white/95 backdrop-blur-md transition-colors print:hidden shadow-xs">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          {/* Logo y Nombre Principal */}
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-2xl py-1 px-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600 btn-press"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-xs relative">
              <Activity className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#FACC15] border-2 border-white" />
            </span>
            <div className="flex flex-col">
              <span className="poster-title text-base sm:text-lg tracking-tight text-[#0F172A] leading-none">
                RADAR MOTOR
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-stone-500">
                Autoevaluación Familiar
              </span>
            </div>
          </Link>

          {/* Navegación y Píldora SOS */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Enlace directo a Primeros Auxilios */}
            <Link
              href="/primeros-auxilios"
              className="flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#0F172A] hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 btn-press"
            >
              <HeartHandshake className="h-4 w-4 text-[#059669]" />
              <span className="hidden xs:inline">Primeros Auxilios</span>
              <span className="xs:hidden">Auxilios</span>
            </Link>

            {/* Píldora Persistente SOS · 112 (Ámbar suave / Coral protector, NO rojo de pánico) */}
            <button
              type="button"
              onClick={() => setIsSosOpen(true)}
              aria-label="Abrir protocolo de emergencias y llamada directa al 112"
              className="flex items-center gap-2 min-h-[44px] px-3.5 sm:px-4 py-2 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 active:scale-[0.97] text-amber-950 transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500 btn-press cursor-pointer"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <PhoneCall className="h-4 w-4 text-amber-700" />
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
