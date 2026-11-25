'use client';

import React from 'react';
import { EvaluationReport } from '../../types/radar-motor';
import { determineArchetype } from '../../data/archetypes';
import { Printer } from 'lucide-react';

export interface ParticipantReportEntry {
  alias: string;
  report: EvaluationReport;
}

interface FamilyPassportPrintProps {
  participants: ParticipantReportEntry[];
  currentDate?: string;
}

export const FamilyPassportPrint: React.FC<FamilyPassportPrintProps> = ({
  participants,
  currentDate,
}) => {
  const displayDate =
    currentDate ||
    new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const axisRows = [
    { id: 'lower_body_strength', name: '1. Tren Inferior' },
    { id: 'core_upper_strength', name: '2. Core y Superior' },
    { id: 'balance_posture', name: '3. Equilibrio' },
    { id: 'mobility_flexibility', name: '4. Movilidad' },
    { id: 'coordination_agility', name: '5. Agilidad' },
    { id: 'aerobic_stability', name: '6. Resistencia' },
  ] as const;

  return (
    <div className="w-full">
      {/* Botón visible solo en pantalla, oculto al imprimir */}
      <div className="print:hidden flex justify-end mb-4">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-xs transition-colors cursor-pointer text-sm"
        >
          <Printer className="w-4 h-4" />
          Imprimir Pasaporte Familiar (A4)
        </button>
      </div>

      {/* Contenedor del documento A4 optimizado para impresión */}
      <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 sm:p-8 print:p-0 print:border-none print:shadow-none print:w-full print:m-0">
        {/* Cabecera Oficial */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-blue-700">
                RADAR MOTOR
              </span>
              <span className="text-xs uppercase tracking-widest bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-sm">
                Pasaporte Familiar
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Registro biomotor y pedagógico para el hogar y la escuela
            </p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p className="font-semibold">{displayDate}</p>
            <p className="text-slate-500">Próxima reevaluación: +90 días</p>
          </div>
        </div>

        {/* Resumen de Miembros / Participantes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {participants.map((p, idx) => {
            const archetype = determineArchetype(p.report);
            return (
              <div
                key={`member-summary-${idx}`}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center"
              >
                <p className="font-bold text-sm text-slate-900 truncate">{p.alias}</p>
                <p className="text-xs text-slate-500">
                  {p.report.age} años · {p.report.sex === 'M' ? 'Masc.' : p.report.sex === 'F' ? 'Fem.' : 'Univ.'}
                </p>
                <div className="mt-1.5 flex items-baseline justify-center gap-1">
                  <span className="text-xl font-extrabold text-blue-600 tabular-nums">
                    {Math.round(p.report.globalAverage)}
                  </span>
                  <span className="text-[10px] text-slate-500">/100 (media)</span>
                </div>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 truncate max-w-full">
                  {archetype ? archetype.name : p.report.mode === 'express' ? 'Evaluación Parcial' : 'Sin Datos'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Tabla Comparativa de los 6 Ejes */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100 text-slate-700">
                <th className="py-2 px-3 font-bold">Capacidad Motriz</th>
                {participants.map((p, idx) => (
                  <th key={`th-${idx}`} className="py-2 px-3 font-bold text-center">
                    {p.alias}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {axisRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-medium text-slate-800">{row.name}</td>
                  {participants.map((p, pIdx) => {
                    const axisRes = p.report.axisResults?.[row.id];
                    const score = axisRes?.score ?? 0;
                    const inZsm = score >= 45 && score <= 75;
                    return (
                      <td key={`cell-${row.id}-${pIdx}`} className="py-2.5 px-3 text-center">
                        <span className="font-bold text-slate-900 tabular-nums">
                          {Math.round(score)} pts
                        </span>
                        <div className="text-[10px] text-slate-500">
                          {axisRes?.level || 'Base'}
                          {inZsm && (
                            <span className="ml-1 text-emerald-600 font-bold" title="Zona Saludable">
                              ✓
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Micro-Retos y Compromiso Familiar */}
        <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 mb-4 text-xs">
          <p className="font-bold text-blue-900 mb-1">
            🎯 Compromiso de Movimiento en Casa (30 segundos al día)
          </p>
          <p className="text-slate-600 leading-relaxed">
            Recordad que no se trata de competir entre miembros de la familia, sino de celebrar el
            movimiento compartido. Cada miembro elegirá un micro-reto diario de 2 minutos (levantarse sin
            manos, subir escaleras, equilibrio de cepillo). Nos vemos en la reevaluación dentro de 90 días.
          </p>
        </div>

        {/* Pie de Pasaporte y Cumplimiento RGPD */}
        <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[10px] text-slate-500">
          <div>
            <p className="font-semibold text-slate-700">
              RADAR MOTOR · Baremos Normativos Basados en Evidencia Científica
            </p>
            <p>100% en tu navegador · Cero servidores · Cero rastreo de datos personales</p>
          </div>
          <div className="text-right">
            <p className="font-mono font-bold text-slate-800">radar-motor.vercel.app</p>
            <p>Herramienta Educativa</p>
          </div>
        </div>
      </div>
    </div>
  );
};
