'use client';

import React from 'react';
import { AxisId } from '../../types/radar-motor';
import { CATEGORY_THEMES } from '../../data/category-theme';

export interface RadarSeries {
  label: string;
  scores: Partial<Record<AxisId, number>>;
  color?: string;
  isComparison?: boolean;
}

interface RadarChartSvgProps {
  primarySeries: RadarSeries;
  comparisonSeries?: RadarSeries | null;
  size?: number; // default viewBox 420x380
  className?: string;
  themeVariant?: 'light' | 'map_dark';
}

interface AxisConfig {
  id: AxisId;
  label: string;
  shortLabel: string;
  angleDeg: number;
}

const RADAR_AXES: AxisConfig[] = [
  { id: 'lower_body_strength', label: 'Tren Inferior', shortLabel: '1 · Tren Inf.', angleDeg: -90 },
  { id: 'core_upper_strength', label: 'Core y Superior', shortLabel: '2 · Core/Sup.', angleDeg: -30 },
  { id: 'balance_posture', label: 'Equilibrio', shortLabel: '3 · Equilibrio', angleDeg: 30 },
  { id: 'mobility_flexibility', label: 'Movilidad', shortLabel: '4 · Movilidad', angleDeg: 90 },
  { id: 'coordination_agility', label: 'Agilidad', shortLabel: '5 · Agilidad', angleDeg: 150 },
  { id: 'aerobic_stability', label: 'Resistencia', shortLabel: '6 · Resistencia', angleDeg: 210 },
];

export const RadarChartSvg: React.FC<RadarChartSvgProps> = ({
  primarySeries,
  comparisonSeries,
  className = '',
  themeVariant = 'light',
}) => {
  const isDark = themeVariant === 'map_dark';
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
          <linearGradient id="primaryRadarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" stopOpacity={isDark ? '0.55' : '0.40'} />
            <stop offset="100%" stopColor="#0891B2" stopOpacity={isDark ? '0.35' : '0.20'} />
          </linearGradient>

          {/* Gradiente para serie de comparación */}
          <linearGradient id="compRadarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EA580C" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FACC15" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* 1. Fondo de cuadrícula concéntrica */}
        {[0.25, 0.5, 0.75, 1.0].map((level) => (
          <polygon
            key={`grid-${level}`}
            points={getHexagonPoints(level)}
            className={isDark ? 'stroke-slate-700/80 fill-transparent' : 'stroke-stone-300 fill-transparent'}
            strokeWidth="1"
            strokeDasharray={level < 1.0 ? '3 3' : 'none'}
          />
        ))}

        {/* 2. Sombra de la Zona Saludable Motriz (ZSM 45–75%) */}
        <polygon
          points={zsmOuterPoints}
          className={isDark ? 'fill-emerald-500/15 stroke-emerald-400/50' : 'fill-emerald-50 stroke-emerald-300'}
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />
        <polygon
          points={zsmInnerPoints}
          className={isDark ? 'fill-[#1E293B] stroke-emerald-500/40' : 'fill-white stroke-emerald-200'}
          strokeWidth="1"
        />

        {/* 3. Ejes radiales (del centro al vértice exterior) con color de categoría */}
        {RADAR_AXES.map((axis) => {
          const theme = CATEGORY_THEMES[axis.id];
          const { x, y } = polarToCartesian(axis.angleDeg, maxRadius);
          return (
            <line
              key={`axis-line-${axis.id}`}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(15, 23, 42, 0.12)'}
              strokeWidth="1.5"
            />
          );
        })}

        {/* 4. Polígono de la serie de comparación (si existe) */}
        {comparisonPolygon && (
          <>
            <polygon
              points={comparisonPolygon}
              fill="url(#compRadarGrad)"
              className="stroke-[#EA580C]"
              strokeWidth="2.5"
              strokeDasharray="4 3"
            />
            {comparisonPoints?.map((p) => (
              <circle
                key={`comp-dot-${p.axis.id}`}
                cx={p.x}
                cy={p.y}
                r="3.5"
                className="fill-[#EA580C] stroke-white"
                strokeWidth="1.5"
              />
            ))}
          </>
        )}

        {/* 5. Polígono de la serie principal */}
        <polygon
          points={primaryPolygon}
          fill="url(#primaryRadarGrad)"
          stroke="#2563EB"
          strokeWidth="2.5"
        />
        {primaryPoints.map((p) => {
          const theme = CATEGORY_THEMES[p.axis.id];
          return (
            <g key={`primary-dot-${p.axis.id}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r="5"
                fill={theme.color}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </g>
          );
        })}

        {/* 6. Etiquetas de los vértices (insignias cromáticas por categoría) */}
        {RADAR_AXES.map((axis) => {
          const theme = CATEGORY_THEMES[axis.id];
          const labelRadius = maxRadius + 28;
          const { x, y } = polarToCartesian(axis.angleDeg, labelRadius);
          const score = primarySeries.scores[axis.id] ?? 0;
          const compScore = comparisonSeries?.scores[axis.id];

          let textAnchor: 'middle' | 'start' | 'end' = 'middle';
          let xOffset = 0;
          if (axis.angleDeg === -90 || axis.angleDeg === 90) {
            textAnchor = 'middle';
          } else if (axis.angleDeg > -90 && axis.angleDeg < 90) {
            textAnchor = 'start';
            xOffset = 6;
          } else {
            textAnchor = 'end';
            xOffset = -6;
          }

          return (
            <g key={`label-${axis.id}`} transform={`translate(${x + xOffset}, ${y})`}>
              <text
                textAnchor={textAnchor}
                className="text-[12px] font-extrabold"
                fill={isDark ? '#F8FAFC' : '#0F172A'}
                dominantBaseline="central"
              >
                {axis.shortLabel}
              </text>
              <text
                y="15"
                textAnchor={textAnchor}
                className="text-[11px] font-extrabold tabular-nums"
                fill={theme.colorText}
                dominantBaseline="central"
              >
                {Math.round(score)} pts
                {compScore !== undefined && (
                  <tspan fill={isDark ? '#FDE047' : '#EA580C'} fontWeight="bold" fontSize="10px">
                    {' '}
                    vs {Math.round(compScore)}
                  </tspan>
                )}
              </text>
            </g>
          );
        })}

        {/* Centro del radar: Elemento central amarillo #FACC15 de la vista de mapa */}
        <circle cx={cx} cy={cy} r="5" fill="#FACC15" stroke="#0F172A" strokeWidth="1.5" />
      </svg>

      {/* Leyenda interactiva */}
      <div className={`flex flex-wrap items-center justify-center gap-4 text-xs mt-2 ${isDark ? 'text-slate-300' : 'text-stone-600'}`}>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#2563EB] border border-white shadow-xs" />
          <span className={`font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{primarySeries.label}</span>
        </div>

        {comparisonSeries && (
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#EA580C] border border-white shadow-xs border-dashed" />
            <span className="font-bold text-[#EA580C]">
              {comparisonSeries.label}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-2 bg-emerald-300 border border-emerald-500 rounded-xs" />
          <span>Zona Saludable (45–75 pts)</span>
        </div>
      </div>
    </div>
  );
};
