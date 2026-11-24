'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  GraduationCap,
  HeartHandshake,
  Layers,
  Lock,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { LivingRoomKit } from '../components/kit/LivingRoomKit';

function HomeContent() {
  const searchParams = useSearchParams();
  const challengeParam = searchParams.get('reto');
  const [isKitModalOpen, setIsKitModalOpen] = useState(false);

  // Helper para preservar el parámetro ?reto= si existe
  const getEvaluarHref = (mode: 'express' | 'full' | 'family') => {
    if (challengeParam) {
      return `/evaluar?mode=${mode}&reto=${encodeURIComponent(challengeParam)}`;
    }
    return `/evaluar?mode=${mode}`;
  };

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-14 space-y-12">
      {/* Banner de Reto Entrante si existe ?reto= */}
      {challengeParam && (
        <div className="rounded-3xl border-2 border-indigo-400 bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-indigo-950/60 dark:to-sky-950/60 p-5 sm:p-6 shadow-md flex items-center gap-4 animate-in fade-in slide-in-from-top-3 duration-200">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
            <Sparkles className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              Desafío de Comparativa Recibido
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
              ¡Te han retado a comparar vuestro Radar Motor!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              Completa tu test ahora para superponer tu perfil motriz con el suyo y descubrir vuestros puntos fuertes compartidos.
            </p>
          </div>
        </div>
      )}

      {/* Hero Principal */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
          <ShieldCheck className="h-4 w-4" />
          <span>100% Client-Side · Cero Servidores · Máxima Privacidad RGPD</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
          RADAR MOTOR
        </h1>
        <p className="text-lg sm:text-2xl font-semibold text-slate-700 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Tu mapa de salud motriz en casa. 18 pruebas seguras, de 6 a 80+ años, 100% anónimo.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Evalúa fuerza, equilibrio, movilidad y coordinación sin aparatos costosos. Baremos normativos universales de 6 a 80+ años.
        </p>

        {/* Botón rápido para preparar el salón */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsKitModalOpen(true)}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
          >
            <Layers className="h-4 w-4 text-amber-600" />
            <span>Prepara tu salón en 30 segundos (Ver Kit casero)</span>
          </button>
        </div>
      </section>

      {/* Embudo de 4 Puertas de Entrada Claras */}
      <section className="space-y-4">
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Elige cómo deseas realizar tu evaluación motriz:
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Selecciona la modalidad que mejor se adapte a tu tiempo o al grupo participante.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Puerta 1: Reto Exprés */}
          <Link
            href={getEvaluarHref('express')}
            className="group relative rounded-3xl p-6 sm:p-7 border-2 border-sky-200 dark:border-sky-900/60 bg-white dark:bg-slate-900 hover:border-sky-500 dark:hover:border-sky-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                  <Zap className="h-3.5 w-3.5 fill-current" />
                  <span>Empieza aquí · Rápido</span>
                </span>
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> 2 minutos
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-sky-600 transition-colors">
                Reto Exprés (3 pruebas)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Descubre tus 3 pilares cardinales en tiempo récord: levantadas de silla (fuerza), apoyo a una pierna (equilibrio) y lanzamiento a pared (coordinación).
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between text-sky-600 dark:text-sky-400 font-bold text-sm">
              <span>Iniciar Reto Exprés</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Puerta 2: Chequeo Completo */}
          <Link
            href={getEvaluarHref('full')}
            className="group relative rounded-3xl p-6 sm:p-7 border-2 border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-900 hover:border-indigo-500 dark:hover:border-indigo-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  <Activity className="h-3.5 w-3.5" />
                  <span>Informe 360°</span>
                </span>
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> 20 minutos
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                Chequeo Completo (18 pruebas)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Evaluación exhaustiva de los 6 ejes funcionales: tren inferior, core/tren superior, equilibrio, flexibilidad articular, agilidad y resistencia submáxima.
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <span>Iniciar Chequeo Completo</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Puerta 3: Modo Familia */}
          <Link
            href={getEvaluarHref('family')}
            className="group relative rounded-3xl p-6 sm:p-7 border-2 border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900 hover:border-emerald-500 dark:hover:border-emerald-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <Users className="h-3.5 w-3.5" />
                  <span>2 a 4 Personas</span>
                </span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  Intergeneracional
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                Modo Familia en el Salón
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Haced las mismas pruebas juntos en el salón por turnos (nietos, padres y abuelos) y superponed vuestros radares para aprender juntos en familia.
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <span>Configurar Modo Familia</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Puerta 4: Modo Aula Docente */}
          <Link
            href="/aula"
            className="group relative rounded-3xl p-6 sm:p-7 border-2 border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900 hover:border-amber-500 dark:hover:border-amber-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Educación Física</span>
                </span>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  Grupos Escolares
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                Modo Aula Docente
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Evalúa a tu clase por número de lista o alias. Comprueba qué porcentaje alcanza la Zona de Salud Motriz (ZSM) y exporta informes en CSV anónimo al instante.
              </p>
            </div>
            <div className="pt-6 flex items-center justify-between text-amber-600 dark:text-amber-400 font-bold text-sm">
              <span>Acceder al Modo Aula</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* Banda de Privacidad y Respaldo Científico */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Privacidad Absoluta Garantizada por Arquitectura
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ningún dato viaja a internet. Todo se calcula en la memoria de tu propio dispositivo. Cumplimiento estricto del RGPD.
            </p>
          </div>
        </div>
        <Link
          href="/primeros-auxilios"
          className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
        >
          <HeartHandshake className="h-4 w-4" />
          <span>Ver protocolo de Primeros Auxilios</span>
        </Link>
      </section>

      {/* Modal interactivo de LivingRoomKit */}
      {isKitModalOpen && (
        <LivingRoomKit
          isOpenModal={true}
          onCloseModal={() => setIsKitModalOpen(false)}
          onReady={() => setIsKitModalOpen(false)}
        />
      )}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Cargando RADAR MOTOR...</div>}>
      <HomeContent />
    </Suspense>
  );
}
