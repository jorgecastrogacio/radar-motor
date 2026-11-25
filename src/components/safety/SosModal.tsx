'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Lock,
  PhoneCall,
  Shield,
  Unlock,
  X,
} from 'lucide-react';
import { PAS_PROTOCOL } from '../../data/first-aid';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SosModal({ isOpen, onClose }: SosModalProps) {
  if (!isOpen) return null;
  return <SosModalDialog onClose={onClose} />;
}

function SosModalDialog({ onClose }: { onClose: () => void }) {
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Escuchar tecla Escape para accesibilidad
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Bloquear scroll de fondo cuando el modal esté abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col">
        {/* Encabezado del modal */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-amber-50/70 dark:bg-amber-950/30">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white font-bold text-lg shadow-sm">
              112
            </span>
            <div>
              <h2 id="sos-modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Emergencias y Seguridad
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Asistencia inmediata y protocolo de actuación
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar ventana de emergencia"
            className="flex h-11 w-11 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Contenido scrolleable con diseño senior-friendly */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Bloque 1: Llamada Segura al 112 con doble confirmación anti-toques involuntarios */}
          <section className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <PhoneCall className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                  Teléfono Europeo de Emergencias: 112
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Gratuito desde cualquier móvil o fijo, incluso sin cobertura de tu operador.
                </p>
              </div>
            </div>

            {/* Mecanismo de doble confirmación o desbloqueo */}
            {!isUnlocked ? (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-amber-500" />
                  Control de seguridad: desbloquea para activar la marcación.
                </p>
                <button
                  type="button"
                  onClick={() => setIsUnlocked(true)}
                  className="w-full flex items-center justify-center gap-2.5 min-h-[48px] px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                  <Unlock className="h-5 w-5" />
                  <span>Desbloquear llamada al 112</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-2 animate-in fade-in zoom-in-95 duration-150">
                <a
                  href="tel:112"
                  className="w-full flex items-center justify-center gap-3 min-h-[52px] px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-bold text-base transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-red-400"
                >
                  <PhoneCall className="h-6 w-6 animate-pulse" />
                  <span>Llamar ahora al 112</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsUnlocked(false)}
                  className="w-full text-xs text-center text-slate-500 hover:text-slate-700 dark:text-slate-400 py-1 flex items-center justify-center gap-1"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Bloquear marcación de nuevo</span>
                </button>
              </div>
            )}
          </section>

          {/* Bloque 2: Resumen Visual del Protocolo PAS (Proteger, Avisar, Socorrer) */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-wide uppercase">
                Protocolo Universal PAS
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PAS_PROTOCOL.map((pas) => (
                <div
                  key={pas.step}
                  className={`rounded-2xl p-3.5 border ${pas.colorBorder} ${pas.colorBg} flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-black text-sm shadow-xs ${pas.badgeBg}`}>
                        {pas.step}
                      </span>
                      <span className="font-bold text-xs tracking-wider uppercase text-slate-900 dark:text-slate-100">
                        {pas.title}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">
                      {pas.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bloque 3: Acceso a la Guía Educativa de Primeros Auxilios */}
          <section className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/primeros-auxilios"
              onClick={onClose}
              className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                  <BookOpen className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Guía Rápida de Primeros Auxilios
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Mareos, caídas, dolor torácico y posición lateral (PLS)
                  </p>
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            </Link>
          </section>
        </div>

        {/* Pie del modal */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px]">
            RADAR MOTOR promueve la actividad física segura en el entorno familiar y escolar.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
