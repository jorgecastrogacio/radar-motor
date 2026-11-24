'use client';

import React from 'react';
import { AxisId } from '../../types/radar-motor';

export interface RadarSeries {
  label: string;
  scores: Partial<Record<AxisId, number>>;
  color?: string; // Tailwind or hex
  isComparison?: boolean;
}

interface RadarChartSvgProps {
  primarySeries: RadarSeries;
  comparisonSeries?: RadarSeries | null;
  size?: number; // default viewBox 420x380
  className?: string;
}

interface AxisConfig {
  id: AxisId;
  label: string;
  shortLabel: string;
  angleDeg: number; // 0 is top (-90 in math)
}

const RADAR_AXES: AxisConfig[] = [
  { id: 'lower_body_strength', label: 'Tren Inferior', shortLabel: 'Tren Inf.', angleDeg: -90 },
  { id: 'core_upper_strength', label: 'Core y Superior', shortLabel: 'Core / Sup.', angleDeg: -30 },
  { id: 'balance_posture', label: 'Equilibrio', shortLabel: 'Equilibrio', angleDeg: 30 },
  { id: 'mobility_flexibility', label: 'Movilidad', shortLabel: 'Movilidad', angleDeg: 90 },
  { id: 'coordination_agility', label: 'Agilidad', shortLabel: 'Agilidad', angleDeg: 150 },
  { id: 'aerobic_stability', label: 'Resistencia', shortLabel: 'Resistencia', angleDeg: 210 },
];

export const RadarChartSvg: React.FC<RadarChartSvgProps> = ({
  primarySeries,
  comparisonSeries,
  className = '',
}) => {
  const cx = 210;
  const cy = 185;
  const maxRadius = 120;

  // Convierte coordenadas polares (ángulo en grados y radio) a cartesianas (x, y)
  const polarToCartesian = (angleDeg: number, radius: number) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(angleRad),
      y: cy + radius * Math.sin(angleRad),
    };
  };

  // Genera el path SVG para un polígono concéntrico dado un ratio (0.0 a 1.0)
  const getHexagonPoints = (ratio: number) => {
    return RADAR_AXES.map((axis) => {
      const { x, y } = polarToCartesian(axis.angleDeg, maxRadius * ratio);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  };

  // Puntos de la banda ZSM (45 a 75)
  const zsmInnerPoints = getHexagonPoints(0.45);
  const zsmOuterPoints = getHexagonPoints(0.75);

  // Genera puntos para una serie de datos
  const getSeriesPoints = (scores: Partial<Record<AxisId, number>>) => {
    return RADAR_AXES.map((axis) => {
      const val = scores[axis.id] ?? 0;
      const clamped = Math.max(0, Math.min(100, val));
      const ratio = clamped / 100;
      const { x, y } = polarToCartesian(axis.angleDeg, maxRadius * ratio);
      return { x, y, val: clamped, axis };
    });
  };

  const primaryPoints = getSeriesPoints(primarySeries.scores);
  const primaryPolygon = primaryPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const comparisonPoints = comparisonSeries
    ? getSeriesPoints(comparisonSeries.scores)
    : null;
  const comparisonPolygon = comparisonPoints
    ? comparisonPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    : null;

  return (
    <div className={`w-full flex flex-col items-center ${className}`}>
      <svg
        viewBox="0 0 420 380"
        className="w-full max-w-[440px] h-auto overflow-visible select-none"
        aria-label="Gráfico de Radar Motor de 6 Ejes"
      >
        <defs>
          {/* Gradiente para la serie principal */}
          <linearGradient id="primaryRadarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
          </linearGradient>

          {/* Gradiente para serie de comparación */}
          <linearGradient id="compRadarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* 1. Fondo de cuadrícula concéntrica */}
        {[0.25, 0.5, 0.75, 1.0].map((level) => (
          <polygon
            key={`grid-${level}`}
            points={getHexagonPoints(level)}
            className="stroke-slate-200 fill-transparent"
            strokeWidth="1"
            strokeDasharray={level < 1.0 ? '3 3' : 'none'}
          />
        ))}

        {/* 2. Sombra de la Zona Saludable Motriz (ZSM 45–75%) */}
        <polygon
          points={zsmOuterPoints}
          className="fill-emerald-100/50 stroke-emerald-300"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <polygon
          points={zsmInnerPoints}
          className="fill-white stroke-emerald-200"
          strokeWidth="1"
        />

        {/* 3. Ejes radiales (del centro al vértice exterior) */}
        {RADAR_AXES.map((axis) => {
          const { x, y } = polarToCartesian(axis.angleDeg, maxRadius);
          return (
            <line
              key={`axis-line-${axis.id}`}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              className="stroke-slate-200"
              strokeWidth="1.2"
            />
          );
        })}

        {/* 4. Polígono de la serie de comparación (si existe) */}
        {comparisonPolygon && (
          <>
            <polygon
              points={comparisonPolygon}
              fill="url(#compRadarGradient)"
              className="stroke-amber-500"
              strokeWidth="2.5"
              strokeDasharray="4 3"
            />
            {comparisonPoints?.map((p) => (
              <circle
                key={`comp-dot-${p.axis.id}`}
                cx={p.x}
                cy={p.y}
                r="3.5"
                className="fill-amber-500 stroke-white"
                strokeWidth="1.5"
              />
            ))}
          </>
        )}

        {/* 5. Polígono de la serie principal */}
        <polygon
          points={primaryPolygon}
          fill="url(#primaryRadarGradient)"
          className="stroke-blue-600"
          strokeWidth="2.5"
        />
        {primaryPoints.map((p) => {
          const inZsm = p.val >= 45 && p.val <= 75;
          const aboveZsm = p.val > 75;
          const dotColor = aboveZsm
            ? 'fill-indigo-600'
            : inZsm
            ? 'fill-emerald-600'
            : 'fill-blue-600';

          return (
            <g key={`primary-dot-${p.axis.id}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                className={`${dotColor} stroke-white shadow-sm`}
                strokeWidth="2"
              />
            </g>
          );
        })}

        {/* 6. Etiquetas de los vértices (nombres y valores) */}
        {RADAR_AXES.map((axis) => {
          // Desplazamos la etiqueta un poco más allá del radio exterior
          const labelRadius = maxRadius + 26;
          const { x, y } = polarToCartesian(axis.angleDeg, labelRadius);
          const score = primarySeries.scores[axis.id] ?? 0;
          const compScore = comparisonSeries?.scores[axis.id];

          // Alineación de texto según posición horizontal
          let textAnchor: 'middle' | 'start' | 'end' = 'middle';
          let xOffset = 0;
          if (axis.angleDeg === -90 || axis.angleDeg === 90) {
            textAnchor = 'middle';
          } else if (axis.angleDeg > -90 && axis.angleDeg < 90) {
            textAnchor = 'start';
            xOffset = 4;
          } else {
            textAnchor = 'end';
            xOffset = -4;
          }

          return (
            <g key={`label-${axis.id}`} transform={`translate(${x + xOffset}, ${y})`}>
              <text
                textAnchor={textAnchor}
                className="text-[12px] font-bold fill-slate-800"
                dominantBaseline="central"
              >
                {axis.shortLabel}
              </text>
              <text
                y="15"
                textAnchor={textAnchor}
                className="text-[11px] font-extrabold fill-blue-700 tabular-nums"
                dominantBaseline="central"
              >
                {Math.round(score)} pts
                {compScore !== undefined && (
                  <tspan className="fill-amber-600 font-semibold text-[10px]">
                    {' '}
                    vs {Math.round(compScore)}
                  </tspan>
                )}
              </text>
            </g>
          );
        })}

        {/* Centro del radar */}
        <circle cx={cx} cy={cy} r="2.5" className="fill-slate-400" />
      </svg>

      {/* Leyenda interactiva */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs mt-1 text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-blue-600 border border-white shadow-xs" />
          <span className="font-semibold text-slate-800">{primarySeries.label}</span>
        </div>

        {comparisonSeries && (
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-white shadow-xs border-dashed" />
            <span className="font-semibold text-amber-800">
              {comparisonSeries.label}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-2 bg-emerald-200 border border-emerald-400 rounded-xs" />
          <span className="text-slate-500">Zona Saludable (45–75 pts)</span>
        </div>
      </div>
    </div>
  );
};
