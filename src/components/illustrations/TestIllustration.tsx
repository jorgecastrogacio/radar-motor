'use client';

import React from 'react';
import { TestId } from '../../types/radar-motor';

interface TestIllustrationProps {
  testId: TestId;
  className?: string;
}

export function TestIllustration({ testId, className = '' }: TestIllustrationProps) {
  return (
    <div className={`w-full overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {/* Panel 1: Posición Inicial */}
        <div className="p-3 sm:p-4 flex flex-col items-center relative">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-600">
              1. Posición Inicial
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              Preparación
            </span>
          </div>
          <div className="w-full aspect-[240/140] flex items-center justify-center bg-slate-50 rounded-xl overflow-hidden p-1 relative">
            <span className="badge-provenance-tech absolute top-2 right-2 text-[9px] py-0.5 px-2">
              Técnica
            </span>
            {renderStartIllustration(testId)}
          </div>
        </div>

        {/* Panel 2: Movimiento y Posición Final */}
        <div className="p-3 sm:p-4 flex flex-col items-center relative">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-blue-700">
              2. Movimiento / Fin
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800">
              Ejecución
            </span>
          </div>
          <div className="w-full aspect-[240/140] flex items-center justify-center bg-slate-50 rounded-xl overflow-hidden p-1 relative">
            <span className="badge-provenance-tech absolute top-2 right-2 text-[9px] py-0.5 px-2">
              Dinámica
            </span>
            {renderFinishIllustration(testId)}
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Componentes SVG auxiliares comunes
// -----------------------------------------------------------------------------
function SvgBase({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 240 140"
      className="w-full h-full select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Línea de suelo sutil */}
      <line x1="20" y1="125" x2="220" y2="125" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" />
      {children}
    </svg>
  );
}

// -----------------------------------------------------------------------------
// Renderizado de las 18 ilustraciones de INICIO
// -----------------------------------------------------------------------------
function renderStartIllustration(testId: TestId): React.ReactNode {
  switch (testId) {
    case 'chair_stand_30s':
    case 'sit_to_stand_5x':
      return (
        <SvgBase>
          {/* Silla */}
          <rect x="75" y="75" width="40" height="8" rx="2" fill="#94a3b8" />
          <line x1="80" y1="83" x2="80" y2="125" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          <line x1="110" y1="83" x2="110" y2="125" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          <line x1="75" y1="75" x2="75" y2="35" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          {/* Pared izquierda */}
          <line x1="60" y1="20" x2="60" y2="125" stroke="#cbd5e1" strokeWidth="3" />
          {/* Persona sentada */}
          <circle cx="102" cy="42" r="9" fill="#0284c7" />
          <path d="M102 51 L102 82 L128 82 L128 125" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M100 62 L116 68 L104 74" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <text x="140" y="60" fill="#64748b" fontSize="10" fontWeight="bold">Brazos</text>
          <text x="140" y="72" fill="#64748b" fontSize="10">cruzados</text>
        </SvgBase>
      );

    case 'calf_raise_30s':
      return (
        <SvgBase>
          {/* Pared a la derecha */}
          <line x1="190" y1="20" x2="190" y2="125" stroke="#cbd5e1" strokeWidth="4" />
          {/* Persona de pie con talones apoyados */}
          <circle cx="120" cy="38" r="9" fill="#0284c7" />
          <line x1="120" y1="47" x2="120" y2="88" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          <line x1="120" y1="88" x2="116" y2="125" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          <line x1="120" y1="88" x2="126" y2="125" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          {/* Brazos hacia la pared */}
          <path d="M120 58 L155 60 L190 60" stroke="#0369a1" strokeWidth="3.5" strokeLinecap="round" />
          {/* Pies planos */}
          <line x1="110" y1="125" x2="132" y2="125" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
          <text x="35" y="65" fill="#64748b" fontSize="10">Talones en suelo</text>
        </SvgBase>
      );

    case 'glute_bridge_30s':
      return (
        <SvgBase>
          {/* Esterilla */}
          <rect x="30" y="122" width="180" height="4" rx="2" fill="#cbd5e1" />
          {/* Persona tumbada boca arriba con rodillas flexionadas */}
          <circle cx="55" cy="115" r="8" fill="#0284c7" />
          <line x1="63" y1="118" x2="120" y2="118" stroke="#0284c7" strokeWidth="6" strokeLinecap="round" />
          <path d="M120 118 L145 85 L165 124" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="75" y1="122" x2="115" y2="122" stroke="#0369a1" strokeWidth="3.5" strokeLinecap="round" />
          <text x="70" y="70" fill="#64748b" fontSize="10">Espalda en suelo</text>
        </SvgBase>
      );

    case 'wall_pushups_30s':
      return (
        <SvgBase>
          {/* Pared izquierda */}
          <line x1="50" y1="20" x2="50" y2="125" stroke="#94a3b8" strokeWidth="6" />
          {/* Persona erguida con brazos estirados a pared */}
          <circle cx="150" cy="38" r="9" fill="#0284c7" />
          <line x1="150" y1="47" x2="165" y2="125" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          {/* Brazo estirado a la pared */}
          <line x1="150" y1="58" x2="52" y2="58" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" />
          <text x="140" y="80" fill="#64748b" fontSize="10">Brazos extendidos</text>
        </SvgBase>
      );

    case 'arm_curl_1l_30s':
      return (
        <SvgBase>
          {/* Silla */}
          <rect x="70" y="75" width="40" height="8" rx="2" fill="#94a3b8" />
          <line x1="75" y1="83" x2="75" y2="125" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          <line x1="105" y1="83" x2="105" y2="125" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          <line x1="70" y1="75" x2="70" y2="35" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          {/* Persona sentada */}
          <circle cx="95" cy="42" r="9" fill="#0284c7" />
          <path d="M95 51 L95 82 L120 82 L120 125" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Brazo colgando con botella */}
          <line x1="98" y1="58" x2="115" y2="92" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" />
          <rect x="110" y="90" width="10" height="18" rx="2" fill="#f59e0b" />
          <rect x="113" y="87" width="4" height="4" fill="#0284c7" />
          <text x="135" y="100" fill="#64748b" fontSize="10">1 Litro (1 kg)</text>
        </SvgBase>
      );

    case 'monopodal_open':
      return (
        <SvgBase>
          {/* Persona con ambos pies juntos */}
          <circle cx="120" cy="36" r="9" fill="#0284c7" />
          <line x1="120" y1="45" x2="120" y2="85" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          {/* Brazos cruzados */}
          <path d="M112 56 L128 62 L116 68" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {/* 2 piernas en el suelo */}
          <line x1="117" y1="85" x2="117" y2="125" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="123" y1="85" x2="123" y2="125" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          <text x="40" y="60" fill="#64748b" fontSize="10">2 pies apoyados</text>
        </SvgBase>
      );

    case 'tandem_stance_open':
      return (
        <SvgBase>
          {/* Persona de pie */}
          <circle cx="120" cy="36" r="9" fill="#0284c7" />
          <line x1="120" y1="45" x2="120" y2="85" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          <path d="M112 56 L128 62 L116 68" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {/* Piernas separadas normales */}
          <line x1="116" y1="85" x2="112" y2="125" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="124" y1="85" x2="128" y2="125" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          <text x="35" y="65" fill="#64748b" fontSize="10">Posición natural</text>
        </SvgBase>
      );

    case 'tandem_walk_3m':
      return (
        <SvgBase>
          {/* Línea de salida */}
          <line x1="60" y1="115" x2="60" y2="135" stroke="#ef4444" strokeWidth="3" />
          <text x="45" y="110" fill="#ef4444" fontSize="9" fontWeight="bold">Salida</text>
          {/* Persona tras la línea */}
          <circle cx="60" cy="40" r="8" fill="#0284c7" />
          <line x1="60" y1="48" x2="60" y2="88" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="60" y1="88" x2="56" y2="125" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
          <line x1="60" y1="88" x2="64" y2="125" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
          {/* Camino de 3m */}
          <line x1="60" y1="125" x2="200" y2="125" stroke="#0284c7" strokeWidth="2" strokeDasharray="6 4" />
          <text x="110" y="80" fill="#64748b" fontSize="10">Tramo recto (3m)</text>
        </SvgBase>
      );

    case 'chair_sit_reach':
      return (
        <SvgBase>
          {/* Silla */}
          <rect x="50" y="75" width="40" height="8" rx="2" fill="#94a3b8" />
          <line x1="55" y1="83" x2="55" y2="125" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          <line x1="85" y1="83" x2="85" y2="125" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          {/* Persona en borde */}
          <circle cx="75" cy="42" r="8" fill="#0284c7" />
          <line x1="75" y1="50" x2="75" y2="80" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          {/* Pierna flexionada */}
          <path d="M75 80 L88 80 L88 125" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {/* Pierna estirada al frente con talón apoyado y pie 90° */}
          <line x1="75" y1="80" x2="145" y2="123" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="145" y1="123" x2="145" y2="112" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
          <text x="110" y="60" fill="#64748b" fontSize="10">Espalda erguida</text>
        </SvgBase>
      );

    case 'back_scratch':
      return (
        <SvgBase>
          {/* Persona vista de espaldas con brazos a los lados */}
          <circle cx="120" cy="36" r="9" fill="#0284c7" />
          <line x1="120" y1="45" x2="120" y2="85" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          <line x1="120" y1="85" x2="114" y2="125" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
          <line x1="120" y1="85" x2="126" y2="125" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
          {/* Brazos a los lados */}
          <line x1="116" y1="55" x2="105" y2="85" stroke="#0369a1" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="124" y1="55" x2="135" y2="85" stroke="#0369a1" strokeWidth="3.5" strokeLinecap="round" />
          <text x="35" y="65" fill="#64748b" fontSize="10">Brazos relajados</text>
        </SvgBase>
      );

    case 'knee_to_wall':
      return (
        <SvgBase>
          {/* Pared derecha */}
          <line x1="190" y1="20" x2="190" y2="125" stroke="#94a3b8" strokeWidth="6" />
          {/* Pie perpendicular a la pared */}
          <line x1="140" y1="124" x2="170" y2="124" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
          {/* Pierna casi recta antes de flexionar */}
          <line x1="145" y1="124" x2="155" y2="75" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="140" cy="35" r="8" fill="#0284c7" />
          <line x1="140" y1="43" x2="150" y2="75" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="170" y1="128" x2="190" y2="128" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
          <text x="40" y="65" fill="#64748b" fontSize="10">Talón plano al suelo</text>
        </SvgBase>
      );

    case 'wall_toss_30s':
      return (
        <SvgBase>
          {/* Pared izquierda */}
          <line x1="40" y1="20" x2="40" y2="125" stroke="#94a3b8" strokeWidth="6" />
          {/* Persona a 1,2 m */}
          <circle cx="160" cy="38" r="9" fill="#0284c7" />
          <line x1="160" y1="47" x2="160" y2="88" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          <line x1="160" y1="88" x2="155" y2="125" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="160" y1="88" x2="165" y2="125" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          {/* Brazo sosteniendo pelota */}
          <path d="M160 58 L140 70 L125 65" stroke="#0369a1" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="120" cy="63" r="5" fill="#f59e0b" />
          <text x="80" y="115" fill="#64748b" fontSize="10">A 1,2 m de distancia</text>
        </SvgBase>
      );

    case 'plate_tapping_25':
      return (
        <SvgBase>
          {/* Mesa */}
          <rect x="50" y="75" width="140" height="8" rx="2" fill="#94a3b8" />
          <line x1="65" y1="83" x2="65" y2="125" stroke="#64748b" strokeWidth="4" />
          <line x1="175" y1="83" x2="175" y2="125" stroke="#64748b" strokeWidth="4" />
          {/* 2 platos y rectángulo central */}
          <ellipse cx="80" cy="74" rx="12" ry="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
          <rect x="110" y="72" width="20" height="5" fill="#f8fafc" stroke="#475569" strokeWidth="1" />
          <ellipse cx="160" cy="74" rx="12" ry="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
          {/* Mano no dominante en el centro */}
          <circle cx="120" cy="73" r="3" fill="#0284c7" />
          {/* Mano dominante sobre plato izquierdo lista */}
          <circle cx="80" cy="72" r="4" fill="#f59e0b" />
          <text x="85" y="45" fill="#64748b" fontSize="10">Mano lista en plato 1</text>
        </SvgBase>
      );

    case 'side_step_20s':
      return (
        <SvgBase>
          {/* 3 líneas en el suelo */}
          <line x1="60" y1="120" x2="60" y2="130" stroke="#64748b" strokeWidth="3" />
          <line x1="120" y1="120" x2="120" y2="130" stroke="#0284c7" strokeWidth="4" />
          <line x1="180" y1="120" x2="180" y2="130" stroke="#64748b" strokeWidth="3" />
          {/* Persona en el centro */}
          <circle cx="120" cy="38" r="9" fill="#0284c7" />
          <line x1="120" y1="47" x2="120" y2="85" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          <path d="M120 85 L112 125" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M120 85 L128 125" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          <text x="85" y="25" fill="#64748b" fontSize="10">Posición central (1m)</text>
        </SvgBase>
      );

    case 'step_test_2min':
      return (
        <SvgBase>
          {/* Pared izquierda con marca de altura */}
          <line x1="60" y1="20" x2="60" y2="125" stroke="#cbd5e1" strokeWidth="4" />
          <line x1="55" y1="78" x2="75" y2="78" stroke="#f59e0b" strokeWidth="3" />
          <text x="25" y="75" fill="#f59e0b" fontSize="9" fontWeight="bold">Altura</text>
          {/* Persona de pie */}
          <circle cx="130" cy="38" r="9" fill="#0284c7" />
          <line x1="130" y1="47" x2="130" y2="88" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          <line x1="130" y1="88" x2="126" y2="125" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="130" y1="88" x2="134" y2="125" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          <text x="95" y="105" fill="#64748b" fontSize="10">Marca a medio muslo</text>
        </SvgBase>
      );

    case 'functional_reach':
      return (
        <SvgBase>
          {/* Pared izquierda con regla horizontal */}
          <line x1="40" y1="20" x2="40" y2="125" stroke="#cbd5e1" strokeWidth="4" />
          <line x1="40" y1="58" x2="200" y2="58" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
          {/* Persona erguida con puño cerrado en marca inicial */}
          <circle cx="150" cy="38" r="9" fill="#0284c7" />
          <line x1="150" y1="47" x2="150" y2="125" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          {/* Brazo horizontal a 90° */}
          <line x1="150" y1="58" x2="100" y2="58" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" />
          <circle cx="98" cy="58" r="4" fill="#f59e0b" />
          <text x="80" y="48" fill="#f59e0b" fontSize="9">Punto 0</text>
        </SvgBase>
      );

    case 'step_touch_arms_60s':
      return (
        <SvgBase>
          {/* Persona de pie con pies juntos y brazos bajados */}
          <circle cx="120" cy="38" r="9" fill="#0284c7" />
          <line x1="120" y1="47" x2="120" y2="88" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          <line x1="120" y1="88" x2="118" y2="125" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="120" y1="88" x2="122" y2="125" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="117" y1="55" x2="110" y2="85" stroke="#0369a1" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="123" y1="55" x2="130" y2="85" stroke="#0369a1" strokeWidth="3.5" strokeLinecap="round" />
          <text x="40" y="65" fill="#64748b" fontSize="10">Pies juntos, brazos abajo</text>
        </SvgBase>
      );
  }
}

// -----------------------------------------------------------------------------
// Renderizado de las 18 ilustraciones de FIN / MOVIMIENTO
// -----------------------------------------------------------------------------
function renderFinishIllustration(testId: TestId): React.ReactNode {
  switch (testId) {
    case 'chair_stand_30s':
    case 'sit_to_stand_5x':
      return (
        <SvgBase>
          {/* Silla vacía detrás */}
          <rect x="65" y="75" width="40" height="8" rx="2" fill="#94a3b8" />
          <line x1="70" y1="83" x2="70" y2="125" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          <line x1="100" y1="83" x2="100" y2="125" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          {/* Flecha de impulso vertical */}
          <path d="M125 90 L125 50 M121 55 L125 48 L129 55" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Persona completamente de pie */}
          <circle cx="150" cy="35" r="9" fill="#0284c7" />
          <line x1="150" y1="44" x2="150" y2="125" stroke="#0284c7" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M142 54 L158 60 L146 66" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <text x="135" y="20" fill="#0284c7" fontSize="10" fontWeight="bold">Extensión total</text>
        </SvgBase>
      );

    case 'calf_raise_30s':
      return (
        <SvgBase>
          {/* Pared derecha */}
          <line x1="190" y1="20" x2="190" y2="125" stroke="#cbd5e1" strokeWidth="4" />
          {/* Persona de puntillas */}
          <circle cx="120" cy="30" r="9" fill="#0284c7" />
          <line x1="120" y1="39" x2="120" y2="82" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          <line x1="120" y1="82" x2="120" y2="116" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          {/* Pies en puntas de pie */}
          <line x1="120" y1="116" x2="124" y2="125" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
          {/* Flecha hacia arriba en talón */}
          <path d="M106 122 L106 105 M103 110 L106 102 L109 110" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M120 50 L155 52 L190 52" stroke="#0369a1" strokeWidth="3.5" strokeLinecap="round" />
          <text x="30" y="60" fill="#0284c7" fontSize="10" fontWeight="bold">Talones al máximo</text>
        </SvgBase>
      );

    case 'glute_bridge_30s':
      return (
        <SvgBase>
          {/* Esterilla */}
          <rect x="30" y="122" width="180" height="4" rx="2" fill="#cbd5e1" />
          {/* Cabeza y hombros en suelo, cadera elevada en puente */}
          <circle cx="55" cy="115" r="8" fill="#0284c7" />
          {/* Línea recta diagonal de puente: hombros a rodillas */}
          <line x1="65" y1="115" x2="135" y2="78" stroke="#0284c7" strokeWidth="6" strokeLinecap="round" />
          {/* Piernas bajando al suelo */}
          <path d="M135 78 L155 124" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Flecha elevación pelvis */}
          <path d="M100 110 L100 85 M96 92 L100 82 L104 92" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="110" y="60" fill="#0284c7" fontSize="10" fontWeight="bold">Alineación recta</text>
        </SvgBase>
      );

    case 'wall_pushups_30s':
      return (
        <SvgBase>
          {/* Pared izquierda */}
          <line x1="50" y1="20" x2="50" y2="125" stroke="#94a3b8" strokeWidth="6" />
          {/* Persona inclinada cerca de la pared con codos flexionados */}
          <circle cx="85" cy="42" r="9" fill="#0284c7" />
          <line x1="85" y1="51" x2="165" y2="125" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          {/* Codo flexionado tocando pared */}
          <path d="M92 58 L70 70 L52 60" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <text x="110" y="50" fill="#0284c7" fontSize="10" fontWeight="bold">Flexión de codos</text>
        </SvgBase>
      );

    case 'arm_curl_1l_30s':
      return (
        <SvgBase>
          {/* Silla */}
          <rect x="70" y="75" width="40" height="8" rx="2" fill="#94a3b8" />
          <line x1="75" y1="83" x2="75" y2="125" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          <line x1="105" y1="83" x2="105" y2="125" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          {/* Persona sentada */}
          <circle cx="95" cy="42" r="9" fill="#0284c7" />
          <path d="M95 51 L95 82 L120 82 L120 125" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Codo doblado arriba junto al hombro */}
          <path d="M98 58 L110 75 L112 55" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="108" y="42" width="10" height="18" rx="2" fill="#f59e0b" />
          <rect x="111" y="39" width="4" height="4" fill="#0284c7" />
          <text x="130" y="55" fill="#0284c7" fontSize="10" fontWeight="bold">Flexión completa</text>
        </SvgBase>
      );

    case 'monopodal_open':
      return (
        <SvgBase>
          {/* Persona en equilibrio a 1 pierna */}
          <circle cx="120" cy="36" r="9" fill="#0284c7" />
          <line x1="120" y1="45" x2="120" y2="85" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          <path d="M112 56 L128 62 L116 68" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {/* Pierna izquierda de apoyo firme */}
          <line x1="120" y1="85" x2="120" y2="125" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          {/* Pierna derecha levantada en el aire */}
          <path d="M120 85 L140 95 L140 115" stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="145" y="80" fill="#0284c7" fontSize="10" fontWeight="bold">Pie en el aire</text>
          <text x="145" y="92" fill="#64748b" fontSize="9">(Máx 45s)</text>
        </SvgBase>
      );

    case 'tandem_stance_open':
      return (
        <SvgBase>
          {/* Persona en tándem estricto */}
          <circle cx="120" cy="36" r="9" fill="#0284c7" />
          <line x1="120" y1="45" x2="120" y2="85" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          <path d="M112 56 L128 62 L116 68" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {/* Pierna trasera y pierna delantera alineadas */}
          <line x1="120" y1="85" x2="114" y2="125" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="120" y1="85" x2="128" y2="125" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          {/* Detalle de pies: talón tocando punta */}
          <rect x="108" y="122" width="12" height="4" rx="2" fill="#0f172a" />
          <rect x="120" y="122" width="12" height="4" rx="2" fill="#0284c7" />
          <text x="35" y="65" fill="#0284c7" fontSize="10" fontWeight="bold">Talón toca punta</text>
        </SvgBase>
      );

    case 'tandem_walk_3m':
      return (
        <SvgBase>
          {/* Marchando en línea */}
          <circle cx="140" cy="38" r="8" fill="#0284c7" />
          <line x1="140" y1="46" x2="140" y2="86" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          {/* Brazos equilibrando */}
          <line x1="140" y1="58" x2="120" y2="65" stroke="#0369a1" strokeWidth="3" strokeLinecap="round" />
          <line x1="140" y1="58" x2="160" y2="65" stroke="#0369a1" strokeWidth="3" strokeLinecap="round" />
          {/* Pasos en tándem continuo */}
          <line x1="140" y1="86" x2="130" y2="125" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
          <line x1="140" y1="86" x2="152" y2="125" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
          <path d="M165 95 L185 95 M180 91 L186 95 L180 99" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="135" y="25" fill="#0284c7" fontSize="10" fontWeight="bold">Avance fluido</text>
        </SvgBase>
      );

    case 'chair_sit_reach':
      return (
        <SvgBase>
          {/* Silla */}
          <rect x="50" y="75" width="40" height="8" rx="2" fill="#94a3b8" />
          <line x1="55" y1="83" x2="55" y2="125" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          {/* Torso inclinado al frente alcanzando el pie */}
          <circle cx="105" cy="55" r="8" fill="#0284c7" />
          <line x1="75" y1="80" x2="115" y2="70" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          {/* Pierna estirada */}
          <line x1="75" y1="80" x2="145" y2="123" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="145" y1="123" x2="145" y2="112" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
          {/* Brazos superpuestos alcanzando punta del pie */}
          <line x1="108" y1="62" x2="148" y2="112" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" />
          <text x="120" y="45" fill="#0284c7" fontSize="10" fontWeight="bold">Alcance a los dedos</text>
        </SvgBase>
      );

    case 'back_scratch':
      return (
        <SvgBase>
          {/* Persona de espaldas con manos cruzadas */}
          <circle cx="120" cy="36" r="9" fill="#0284c7" />
          <line x1="120" y1="45" x2="120" y2="85" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          <line x1="120" y1="85" x2="114" y2="125" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
          <line x1="120" y1="85" x2="126" y2="125" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
          {/* Brazo superior bajando */}
          <path d="M120 48 L108 42 L116 68" stroke="#0369a1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Brazo inferior subiendo */}
          <path d="M120 75 L132 82 L120 68" stroke="#0369a1" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Punto de unión de dedos */}
          <circle cx="118" cy="68" r="3.5" fill="#f59e0b" />
          <text x="35" y="65" fill="#0284c7" fontSize="10" fontWeight="bold">Manos se aproximan</text>
        </SvgBase>
      );

    case 'knee_to_wall':
      return (
        <SvgBase>
          {/* Pared derecha */}
          <line x1="190" y1="20" x2="190" y2="125" stroke="#94a3b8" strokeWidth="6" />
          {/* Pie en el suelo con talón firme */}
          <line x1="140" y1="124" x2="170" y2="124" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
          {/* Rodilla tocando la pared */}
          <path d="M145 124 L190 90 L160 55" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="145" cy="30" r="8" fill="#0284c7" />
          {/* Punto de contacto de rodilla */}
          <circle cx="190" cy="90" r="4" fill="#f59e0b" />
          <text x="45" y="55" fill="#0284c7" fontSize="10" fontWeight="bold">Rodilla toca pared</text>
          <text x="45" y="68" fill="#64748b" fontSize="9">Talón sin levantarse</text>
        </SvgBase>
      );

    case 'wall_toss_30s':
      return (
        <SvgBase>
          {/* Pared izquierda */}
          <line x1="40" y1="20" x2="40" y2="125" stroke="#94a3b8" strokeWidth="6" />
          <circle cx="160" cy="38" r="9" fill="#0284c7" />
          <line x1="160" y1="47" x2="160" y2="88" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          <line x1="160" y1="88" x2="155" y2="125" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="160" y1="88" x2="165" y2="125" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          {/* Pelota rebotando en pared hacia la otra mano */}
          <path d="M140 70 L45 50 L140 75" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="45" cy="50" r="5" fill="#f59e0b" />
          <circle cx="140" cy="74" r="5" fill="#0284c7" />
          <text x="120" y="30" fill="#0284c7" fontSize="10" fontWeight="bold">Atrapa con mano contraria</text>
        </SvgBase>
      );

    case 'plate_tapping_25':
      return (
        <SvgBase>
          {/* Mesa */}
          <rect x="50" y="75" width="140" height="8" rx="2" fill="#94a3b8" />
          <line x1="65" y1="83" x2="65" y2="125" stroke="#64748b" strokeWidth="4" />
          <line x1="175" y1="83" x2="175" y2="125" stroke="#64748b" strokeWidth="4" />
          {/* Platos con flechas de vaivén rápido */}
          <ellipse cx="80" cy="74" rx="12" ry="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
          <rect x="110" y="72" width="20" height="5" fill="#f8fafc" stroke="#475569" strokeWidth="1" />
          <ellipse cx="160" cy="74" rx="12" ry="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
          {/* Arco dinámico de movimiento */}
          <path d="M80 65 Q120 40 160 65" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 3" />
          <circle cx="160" cy="72" r="4.5" fill="#f59e0b" />
          <text x="90" y="30" fill="#0284c7" fontSize="10" fontWeight="bold">25 ciclos rápidos</text>
        </SvgBase>
      );

    case 'side_step_20s':
      return (
        <SvgBase>
          {/* 3 líneas */}
          <line x1="60" y1="120" x2="60" y2="130" stroke="#ef4444" strokeWidth="3" />
          <line x1="120" y1="120" x2="120" y2="130" stroke="#94a3b8" strokeWidth="3" />
          <line x1="180" y1="120" x2="180" y2="130" stroke="#ef4444" strokeWidth="3" />
          {/* Persona desplazándose a línea derecha */}
          <circle cx="170" cy="38" r="9" fill="#0284c7" />
          <line x1="170" y1="47" x2="170" y2="85" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          <path d="M170 85 L160 125" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M170 85 L182 125" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          {/* Flecha lateral */}
          <path d="M125 70 L155 70 M150 66 L156 70 L150 74" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="110" y="25" fill="#0284c7" fontSize="10" fontWeight="bold">Toca marca lateral</text>
        </SvgBase>
      );

    case 'step_test_2min':
      return (
        <SvgBase>
          {/* Pared izquierda con marca */}
          <line x1="60" y1="20" x2="60" y2="125" stroke="#cbd5e1" strokeWidth="4" />
          <line x1="55" y1="78" x2="75" y2="78" stroke="#f59e0b" strokeWidth="3" />
          {/* Persona con rodilla derecha levantada a la altura */}
          <circle cx="130" cy="38" r="9" fill="#0284c7" />
          <line x1="130" y1="47" x2="130" y2="88" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          {/* Pierna izquierda en suelo */}
          <line x1="130" y1="88" x2="130" y2="125" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          {/* Pierna derecha doblada a 90° a la altura de la marca */}
          <path d="M130 88 L105 78 L105 105" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="105" cy="78" r="3.5" fill="#f59e0b" />
          <text x="90" y="30" fill="#0284c7" fontSize="10" fontWeight="bold">Rodilla a la marca</text>
        </SvgBase>
      );

    case 'functional_reach':
      return (
        <SvgBase>
          {/* Pared izquierda */}
          <line x1="40" y1="20" x2="40" y2="125" stroke="#cbd5e1" strokeWidth="4" />
          <line x1="40" y1="58" x2="200" y2="58" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
          {/* Torso inclinado al frente con brazo extendido */}
          <circle cx="125" cy="45" r="9" fill="#0284c7" />
          <line x1="150" y1="125" x2="135" y2="60" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          {/* Brazo proyectado al máximo hacia la pared */}
          <line x1="135" y1="60" x2="65" y2="58" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" />
          <circle cx="65" cy="58" r="4.5" fill="#f59e0b" />
          <text x="60" y="45" fill="#0284c7" fontSize="10" fontWeight="bold">Alcance máximo (cm)</text>
          <text x="120" y="115" fill="#64748b" fontSize="9">Talones sin despegar</text>
        </SvgBase>
      );

    case 'step_touch_arms_60s':
      return (
        <SvgBase>
          {/* Persona en paso lateral con brazos abiertos a 90° */}
          <circle cx="120" cy="38" r="9" fill="#0284c7" />
          <line x1="120" y1="47" x2="120" y2="88" stroke="#0284c7" strokeWidth="5" strokeLinecap="round" />
          {/* Piernas separadas en paso lateral */}
          <line x1="120" y1="88" x2="95" y2="125" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="120" y1="88" x2="145" y2="125" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
          {/* Brazos abiertos a 90° */}
          <line x1="80" y1="58" x2="160" y2="58" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" />
          <text x="80" y="30" fill="#0284c7" fontSize="10" fontWeight="bold">Brazos a 90° rítmicos</text>
        </SvgBase>
      );
  }
}
