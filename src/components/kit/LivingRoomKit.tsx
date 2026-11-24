'use client';

import React, { useState } from 'react';
import {
  Armchair,
  CheckCircle,
  CircleDot,
  Dumbbell,
  Layers,
  Sparkles,
  Square,
  X,
} from 'lucide-react';

interface KitItem {
  id: string;
  name: string;
  homeEquivalent: string;
  utility: string;
  icon: React.ReactNode;
}

const KIT_ITEMS: KitItem[] = [
  {
    id: 'chair',
    name: 'Silla firme sin reposabrazos',
    homeEquivalent: 'Cualquier silla de comedor estándar apoyada contra la pared',
    utility: 'Sentadillas 30s, levantadas de silla y flexibilidad sentada',
    icon: <Armchair className="h-6 w-6 text-sky-600" />,
  },
  {
    id: 'bottle',
    name: 'Botella de 1 litro de agua',
    homeEquivalent: 'Una botella de 1L cerrada o un paquete de 1 kg (legumbres/arroz)',
    utility: 'Flexión de bíceps (Arm Curl 1L)',
    icon: <Dumbbell className="h-6 w-6 text-amber-600" />,
  },
  {
    id: 'ball',
    name: 'Pelota de tenis o goma',
    homeEquivalent: 'Un par de calcetines enrollados bien apretados o pelota antiestrés',
    utility: 'Lanzamiento alterno a la pared (Wall Toss)',
    icon: <CircleDot className="h-6 w-6 text-emerald-600" />,
  },
  {
    id: 'mat',
    name: 'Superficie cómoda en suelo',
    homeEquivalent: 'Alfombra de casa o toalla grande doblada sobre el suelo',
    utility: 'Puente de glúteo y ejercicios de suelo',
    icon: <Layers className="h-6 w-6 text-indigo-600" />,
  },
  {
    id: 'coasters',
    name: '2 posavasos o folios',
    homeEquivalent: 'Dos posavasos de mesa, servilletas o dos hojas de papel',
    utility: 'Plate tapping casero y marcas de paso lateral',
    icon: <Square className="h-6 w-6 text-purple-600" />,
  },
  {
    id: 'wall',
    name: 'Tramo de pared despejado',
    homeEquivalent: 'Un pasillo o pared libre de cuadros o puertas',
    utility: 'Flexiones de pared, apoyo de seguridad y alcance funcional',
    icon: <Sparkles className="h-6 w-6 text-teal-600" />,
  },
];

interface LivingRoomKitProps {
  onReady?: () => void;
  isOpenModal?: boolean;
  onCloseModal?: () => void;
}

export function LivingRoomKit({ onReady, isOpenModal = false, onCloseModal }: LivingRoomKitProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    chair: true,
    bottle: true,
    ball: false,
    mat: true,
    coasters: false,
    wall: true,
  });

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allChecked = KIT_ITEMS.every((item) => checkedItems[item.id]);

  const content = (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Coste 0 € · Sin básculas ni cintas métricas</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          El Kit de Salón en 30 Segundos
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
          Reúne estos 6 elementos cotidianos que ya tienes por casa antes de empezar. Marca los que ya tengas listos:
        </p>
      </div>

      {/* Grid de los 6 elementos del kit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {KIT_ITEMS.map((item) => {
          const isChecked = checkedItems[item.id] ?? false;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleItem(item.id)}
              className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 min-h-[64px] ${
                isChecked
                  ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/30'
                  : 'border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40 opacity-80'
              }`}
            >
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs shrink-0 mt-0.5">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {item.name}
                  </h3>
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    isChecked ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                  }`}>
                    {isChecked ? '✓' : ''}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300 mt-0.5">
                  Casero: {item.homeEquivalent}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Para: {item.utility}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Botón de Confirmación */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onReady}
          className="w-full min-h-[52px] px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-base transition-all shadow-md flex items-center justify-center gap-2"
        >
          <CheckCircle className="h-5 w-5" />
          <span>
            {allChecked ? '¡Salón 100% Preparado! Continuar' : 'Continuar con el material listo'}
          </span>
        </button>
      </div>
    </div>
  );

  if (!isOpenModal) {
    return (
      <div className="w-full max-w-2xl mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md p-6 sm:p-8">
        {content}
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        {onCloseModal && (
          <button
            onClick={onCloseModal}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Cerrar ventana de preparación"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {content}
      </div>
    </div>
  );
}
