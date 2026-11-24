import { AxisId } from '../types/radar-motor';

export interface CategoryTheme {
  number: number;
  letter: string;
  label: string;
  shortLabel: string;
  color: string; // Color de marca saturado (cabeceras, badges grandes, gráficos)
  colorText: string; // Variante oscura con contraste >4.5:1 sobre blanco (botones y texto normal)
  bgLight: string;
  borderLight: string;
  badgeBg: string;
}

export const CATEGORY_THEMES: Record<AxisId, CategoryTheme> = {
  lower_body_strength: {
    number: 1,
    letter: 'A',
    label: 'Fuerza de Tren Inferior',
    shortLabel: 'Cat 1 · Tren Inferior',
    color: '#2563EB',
    colorText: '#1D4ED8',
    bgLight: '#EFF6FF',
    borderLight: '#BFDBFE',
    badgeBg: '#DBEAFE',
  },
  core_upper_strength: {
    number: 2,
    letter: 'B',
    label: 'Core y Tren Superior',
    shortLabel: 'Cat 2 · Core / Superior',
    color: '#059669',
    colorText: '#047857',
    bgLight: '#ECFDF5',
    borderLight: '#A7F3D0',
    badgeBg: '#D1FAE5',
  },
  balance_posture: {
    number: 3,
    letter: 'C',
    label: 'Equilibrio y Control Postural',
    shortLabel: 'Cat 3 · Equilibrio',
    color: '#EA580C',
    colorText: '#C2410C',
    bgLight: '#FFF7ED',
    borderLight: '#FED7AA',
    badgeBg: '#FFEDD5',
  },
  mobility_flexibility: {
    number: 4,
    letter: 'D',
    label: 'Movilidad y Flexibilidad',
    shortLabel: 'Cat 4 · Movilidad',
    color: '#9333EA',
    colorText: '#7E22CE',
    bgLight: '#FAF5FF',
    borderLight: '#E9D5FF',
    badgeBg: '#F3E8FF',
  },
  coordination_agility: {
    number: 5,
    letter: 'E',
    label: 'Coordinación y Agilidad',
    shortLabel: 'Cat 5 · Agilidad',
    color: '#0891B2',
    colorText: '#0E7490',
    bgLight: '#ECFEFF',
    borderLight: '#A5F3FC',
    badgeBg: '#CFFAFE',
  },
  aerobic_stability: {
    number: 6,
    letter: 'F',
    label: 'Resistencia y Marcha Aeróbica',
    shortLabel: 'Cat 6 · Resistencia',
    color: '#DC2626',
    colorText: '#B91C1C',
    bgLight: '#FEF2F2',
    borderLight: '#FECACA',
    badgeBg: '#FEE2E2',
  },
};

export const BRAND_COLORS = {
  acento: '#FACC15',
  bgDark: '#0F172A',
  surfaceDark: '#1E293B',
  bgLight: '#F2F1EB',
  surfaceLight: '#FFFFFF',
  textDark: '#0F172A',
  textMutedDark: '#CBD5E1',
};
