'use client';

import React, { useState } from 'react';
import { Check, CheckCircle2, Minus, Plus, Ruler } from 'lucide-react';
import { VisualScaleOption } from '../../types/radar-motor';

interface ManualScaleInputProps {
  testName: string;
  visualScaleOptions: VisualScaleOption[];
  onFinish: (valueCm: number) => void;
  onCancel?: () => void;
}

export function ManualScaleInput({
  testName,
  visualScaleOptions,
  onFinish,
  onCancel,
}: ManualScaleInputProps) {
  // Inicializar en la opción intermedia o 0 cm
  const defaultOption = visualScaleOptions[2] || visualScaleOptions[0];
  const [selectedCm, setSelectedCm] = useState<number>(defaultOption?.valueCm ?? 0);
  const [activeOptionIndex, setActiveOptionIndex] = useState<number>(2);

  const handleSelectOption = (opt: VisualScaleOption, index: number) => {
    setSelectedCm(opt.valueCm);
    setActiveOptionIndex(index);
  };

  const handleAdjust = (delta: number) => {
    setSelectedCm((prev) => prev + delta);
    setActiveOptionIndex(-1); // Selección personalizada
  };

  return (
    <div className="w-full max-w-lg mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg p-6 sm:p-8 space-y-6">
      {/* Cabecera */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
          Escala Visual Anatómica (cm)
        </span>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
          {testName}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          No necesitas cinta métrica. Elige la referencia corporal que mejor describa tu alcance o ajusta los centímetros.
        </p>
      </div>

      {/* Tarjetas de Referencia Anatómica (5 opciones accesibles) */}
      <div className="space-y-2.5">
        {visualScaleOptions.map((opt, idx) => {
          const isSelected = activeOptionIndex === idx || selectedCm === opt.valueCm;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectOption(opt, idx)}
              className={`w-full min-h-[56px] p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                isSelected
                  ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/50 shadow-sm ring-2 ring-sky-400'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                    isSelected
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {idx + 1}
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    {opt.label}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {opt.anatomicalRef}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl ${
                  isSelected
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                {opt.valueCm > 0 ? `+${opt.valueCm}` : opt.valueCm} cm
              </span>
            </button>
          );
        })}
      </div>

      {/* Pantalla y Ajuste Fino en Centímetros */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Ruler className="h-4 w-4 text-sky-600" />
            <span className="text-xs font-semibold">Valor Registrado:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAdjust(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              aria-label="Restar 1 cm"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-mono font-black text-xl text-slate-900 dark:text-white min-w-[60px] text-center tabular-nums">
              {selectedCm > 0 ? `+${selectedCm}` : selectedCm} cm
            </span>
            <button
              type="button"
              onClick={() => handleAdjust(1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              aria-label="Sumar 1 cm"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Botón de Confirmación Gigante */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <button
          type="button"
          onClick={() => onFinish(selectedCm)}
          className="w-full min-h-[56px] px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-base transition-all shadow-md flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-emerald-300"
        >
          <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
          <span>Confirmar {selectedCm > 0 ? `+${selectedCm}` : selectedCm} cm</span>
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full text-center text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 py-2 font-medium"
          >
            Omitir prueba
          </button>
        )}
      </div>
    </div>
  );
}
