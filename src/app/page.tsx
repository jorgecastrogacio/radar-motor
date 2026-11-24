'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Activity,
  ArrowRight,
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
import { CATEGORY_THEMES } from '../data/category-theme';
import { ALL_AXIS_IDS } from '../data/tests-catalog';

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
        <div className="rounded-[22px] border-2 border-[#2563EB] bg-white p-5 sm:p-6 card-sport-shadow flex items-center gap-4 animate-in fade-in slide-in-from-top-3 duration-200">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-xs">
            <Sparkles className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <span className="text-xs font-black uppercase tracking-wider text-[#1D4ED8]">
              Desafío de Comparativa Recibido
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A] leading-tight">
              ¡Te han retado a comparar vuestro Radar Motor!
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Completa tu test ahora para superponer tu perfil motriz con el suyo y descubrir vuestros puntos fuertes compartidos.
            </p>
          </div>
        </div>
      )}

      {/* Hero Principal Tipo Cartel Deportivo */}
      <section className="text-center space-y-5">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-white text-[#1D4ED8] border border-blue-200 shadow-xs">
          <ShieldCheck className="h-4 w-4 text-[#059669]" />
          <span>100% Client-Side · Cero Servidores · Máxima Privacidad RGPD</span>
        </div>

        <div className="space-y-2">
          <h1 className="poster-title text-4xl sm:text-6xl text-[#0F172A] tracking-tight">
            RADAR MOTOR
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="h-1.5 w-12 rounded-full bg-[#2563EB]" />
            <span className="h-2 w-2 rounded-full bg-[#FACC15]" />
            <span className="h-1.5 w-12 rounded-full bg-[#059669]" />
          </div>
        </div>

        <p className="text-lg sm:text-2xl font-semibold text-[#0F172A] max-w-3xl mx-auto leading-relaxed">
          Tu mapa de salud motriz en casa. 18 pruebas seguras, de 6 a 80+ años, 100% anónimo.
        </p>
        <p className="text-sm text-stone-600 max-w-xl mx-auto">
          Evalúa fuerza, equilibrio, movilidad y coordinación sin aparatos costosos. Baremos normativos universales de 6 a 80+ años.
        </p>

        {/* Botón rápido para preparar el salón */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsKitModalOpen(true)}
            className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-2xl bg-white hover:bg-stone-50 border border-stone-300 text-[#0F172A] text-xs font-bold transition-all shadow-xs btn-press cursor-pointer"
          >
            <Layers className="h-4 w-4 text-[#EA580C]" />
            <span>Prepara tu salón en 30 segundos (Ver Kit casero)</span>
          </button>
        </div>
      </section>

      {/* Embudo de 4 Puertas de Entrada Claras */}
      <section className="space-y-4">
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-extrabold text-[#0F172A]">
            Elige cómo deseas realizar tu evaluación motriz:
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Selecciona la modalidad que mejor se adapte a tu tiempo o al grupo participante.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Puerta 1: Reto Exprés (Categoría 1 · Azul) */}
          <Link
            href={getEvaluarHref('express')}
            className="group relative rounded-[22px] overflow-hidden border-2 border-blue-200 bg-white hover:border-[#2563EB] card-sport-shadow transition-all flex flex-col justify-between btn-press"
          >
            {/* Cabecera Sólida de Categoría */}
            <div className="bg-[#2563EB] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1D4ED8] font-black text-sm">
                  1
                </span>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-blue-100 block">
                    Modalidad Rápida
                  </span>
                  <h3 className="text-lg font-extrabold text-white leading-tight">
                    Reto Exprés (3 pruebas)
                  </h3>
                </div>
              </div>
              <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full text-white flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> 2 min
              </span>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Descubre tus 3 pilares cardinales en tiempo récord: levantadas de silla (fuerza), apoyo a una pierna (equilibrio) y lanzamiento a pared (coordinación).
              </p>
              <div className="pt-2 flex items-center justify-between text-[#1D4ED8] font-extrabold text-sm">
                <span>Iniciar Reto Exprés</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Puerta 2: Chequeo Completo (Categoría 4 · Morado) */}
          <Link
            href={getEvaluarHref('full')}
            className="group relative rounded-[22px] overflow-hidden border-2 border-purple-200 bg-white hover:border-[#9333EA] card-sport-shadow transition-all flex flex-col justify-between btn-press"
          >
            {/* Cabecera Sólida de Categoría */}
            <div className="bg-[#9333EA] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#7E22CE] font-black text-sm">
                  2
                </span>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-purple-100 block">
                    Evaluación 360°
                  </span>
                  <h3 className="text-lg font-extrabold text-white leading-tight">
                    Chequeo Completo (18 pruebas)
                  </h3>
                </div>
              </div>
              <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full text-white flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> 20 min
              </span>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Evaluación exhaustiva de los 6 ejes funcionales: tren inferior, core/tren superior, equilibrio, flexibilidad articular, agilidad y resistencia submáxima.
              </p>
              <div className="pt-2 flex items-center justify-between text-[#7E22CE] font-extrabold text-sm">
                <span>Iniciar Chequeo Completo</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Puerta 3: Modo Familia (Categoría 2 · Verde) */}
          <Link
            href={getEvaluarHref('family')}
            className="group relative rounded-[22px] overflow-hidden border-2 border-emerald-200 bg-white hover:border-[#059669] card-sport-shadow transition-all flex flex-col justify-between btn-press"
          >
            {/* Cabecera Sólida de Categoría */}
            <div className="bg-[#059669] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#047857] font-black text-sm">
                  3
                </span>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-100 block">
                    2 a 4 Personas
                  </span>
                  <h3 className="text-lg font-extrabold text-white leading-tight">
                    Modo Familia en el Salón
                  </h3>
                </div>
              </div>
              <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full text-white flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> Por turnos
              </span>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Haced las mismas pruebas juntos en el salón por turnos (nietos, padres y abuelos) y superponed vuestros radares para aprender juntos en familia.
              </p>
              <div className="pt-2 flex items-center justify-between text-[#047857] font-extrabold text-sm">
                <span>Configurar Modo Familia</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Puerta 4: Modo Aula Docente (Categoría 3 · Naranja) */}
          <Link
            href="/aula"
            className="group relative rounded-[22px] overflow-hidden border-2 border-orange-200 bg-white hover:border-[#EA580C] card-sport-shadow transition-all flex flex-col justify-between btn-press"
          >
            {/* Cabecera Sólida de Categoría */}
            <div className="bg-[#EA580C] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#C2410C] font-black text-sm">
                  4
                </span>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-orange-100 block">
                    Educación Física
                  </span>
                  <h3 className="text-lg font-extrabold text-white leading-tight">
                    Modo Aula Docente
                  </h3>
                </div>
              </div>
              <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full text-white flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5" /> Grupos
              </span>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Evalúa a tu clase por número de lista o alias. Comprueba qué porcentaje alcanza la Zona de Salud Motriz (ZSM) y exporta informes en CSV anónimo al instante.
              </p>
              <div className="pt-2 flex items-center justify-between text-[#C2410C] font-extrabold text-sm">
                <span>Acceder al Modo Aula</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Los 6 Ejes del Sistema Visual (Vista Didáctica por Categorías) */}
      <section className="space-y-4">
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-extrabold text-[#0F172A]">
            El Mapa Biomotor de las 6 Capacidades:
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Cada eje cuenta con su código cromático y baremos normativos estandarizados de 6 a 80+ años.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ALL_AXIS_IDS.map((axisId) => {
            const theme = CATEGORY_THEMES[axisId];
            return (
              <div
                key={axisId}
                className="bg-white rounded-[20px] p-3.5 border border-stone-200 card-sport-shadow text-center space-y-2 flex flex-col justify-between"
              >
                <div className="flex items-center justify-center">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white font-black text-xs shadow-xs"
                    style={{ backgroundColor: theme.color }}
                  >
                    {theme.number}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: theme.colorText }}>
                    Eje #{theme.number}
                  </span>
                  <h4 className="text-xs font-extrabold text-[#0F172A] leading-snug">
                    {theme.label}
                  </h4>
                </div>
                <div
                  className="h-1.5 w-full rounded-full"
                  style={{ backgroundColor: theme.color }}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* Banda de Privacidad y Respaldo Científico */}
      <section className="rounded-[22px] border border-stone-300 bg-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left card-sport-shadow">
        <div className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-[#0F172A]">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <h4 className="text-sm font-extrabold text-[#0F172A]">
              Privacidad Absoluta Garantizada por Arquitectura
            </h4>
            <p className="text-xs text-stone-600">
              Ningún dato viaja a internet. Todo se calcula en la memoria de tu propio dispositivo. Cumplimiento estricto del RGPD.
            </p>
          </div>
        </div>
        <Link
          href="/primeros-auxilios"
          className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-[#1D4ED8] hover:underline"
        >
          <HeartHandshake className="h-4 w-4 text-[#059669]" />
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
    <Suspense fallback={<div className="p-12 text-center text-sm text-stone-500">Cargando RADAR MOTOR...</div>}>
      <HomeContent />
    </Suspense>
  );
}
