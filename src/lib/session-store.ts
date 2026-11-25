'use client';

import { EvaluationReport, Sex, TestId } from '../types/radar-motor';
import { ALL_AXIS_IDS, AXES_CONFIG, TESTS_CATALOG } from '../data/tests-catalog';

export interface Participant {
  id: string;
  alias: string;
  age: number;
  sex: Sex;
  inputs: Partial<Record<TestId, number | null>>;
}

export interface ActiveSession {
  mode: 'express' | 'full' | 'family';
  safetyStatus: 'green' | 'amber';
  participants: Participant[];
  currentTestIndex: number;
  currentParticipantIndex: number;
  completedAt?: string;
}

export interface SavedReport {
  timestamp: string;
  mode: 'express' | 'full' | 'family';
  items: Array<{
    participant: Participant;
    report: EvaluationReport;
  }>;
}

export interface ClassroomStudent {
  id: string;
  alias: string; // Ej: "Alumno #01" (RGPD estricto: sin nombres ni apellidos)
  age: number;
  sex: Sex;
  inputs: Partial<Record<TestId, number | null>>;
  report?: EvaluationReport;
}

export interface ClassroomSession {
  groupLabel: string;
  defaultAge: number;
  testMode: 'express' | 'full';
  students: ClassroomStudent[];
  updatedAt: string;
}

const ACTIVE_SESSION_KEY = 'radar_motor_active_session';
const LAST_REPORT_KEY = 'radar_motor_last_report';
const CLASSROOM_SESSION_KEY = 'radar_motor_classroom_session';

// -----------------------------------------------------------------------------
// Sesión Activa (Persistencia de progreso)
// -----------------------------------------------------------------------------
export function saveActiveSession(session: ActiveSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Error al guardar sesión activa en localStorage', e);
  }
}

export function loadActiveSession(): ActiveSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveSession;
  } catch (e) {
    console.error('Error al cargar sesión activa de localStorage', e);
    return null;
  }
}

export function clearActiveSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch (e) {
    console.error('Error al limpiar sesión activa de localStorage', e);
  }
}

// -----------------------------------------------------------------------------
// Último Informe Calculado
// -----------------------------------------------------------------------------
export function saveLastReport(report: SavedReport): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAST_REPORT_KEY, JSON.stringify(report));
  } catch (e) {
    console.error('Error al guardar último informe en localStorage', e);
  }
}

export function loadLastReport(): SavedReport | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LAST_REPORT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedReport;
  } catch (e) {
    console.error('Error al cargar último informe de localStorage', e);
    return null;
  }
}

export function clearLastReport(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LAST_REPORT_KEY);
  } catch (e) {
    console.error('Error al limpiar último informe de localStorage', e);
  }
}

// -----------------------------------------------------------------------------
// Sesión de Modo Aula Docente (Educación Física)
// -----------------------------------------------------------------------------
export function saveClassroomSession(session: ClassroomSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CLASSROOM_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Error al guardar sesión de aula en localStorage', e);
  }
}

export function loadClassroomSession(): ClassroomSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CLASSROOM_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ClassroomSession;
  } catch (e) {
    console.error('Error al cargar sesión de aula de localStorage', e);
    return null;
  }
}

export function clearClassroomSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CLASSROOM_SESSION_KEY);
  } catch (e) {
    console.error('Error al limpiar sesión de aula de localStorage', e);
  }
}

/**
 * Genera el contenido de texto CSV anónimo y compatible con Excel/Sheets con los resultados del aula.
 * RGPD Estricto: solo exporta alias numéricos, edad, sexo, puntuaciones globales y por eje.
 */
export function generateClassroomCSVContent(session: ClassroomSession): string {
  const headers = [
    'Alias',
    'Edad',
    'Sexo',
    'Puntuacion_Global_Suma_Ejes',
    'Media_Global_0_100',
    'Tren_Inferior',
    'Core_Superior',
    'Equilibrio',
    'Movilidad',
    'Coordinacion',
    'Resistencia',
    'Nivel_Global',
  ];

  const rows = session.students.map((student) => {
    const rep = student.report;
    const globalScore = rep ? rep.globalScore : 0;
    const globalAverage = rep ? rep.globalAverage : 0;
    const trenInf = rep?.axisResults?.lower_body_strength?.score ?? 0;
    const coreSup = rep?.axisResults?.core_upper_strength?.score ?? 0;
    const equilibrio = rep?.axisResults?.balance_posture?.score ?? 0;
    const movilidad = rep?.axisResults?.mobility_flexibility?.score ?? 0;
    const coord = rep?.axisResults?.coordination_agility?.score ?? 0;
    const resist = rep?.axisResults?.aerobic_stability?.score ?? 0;
    const nivel = rep ? getConstructiveLevelLabel(globalAverage) : 'Sin evaluar';

    return [
      `"${student.alias.replace(/"/g, '""')}"`,
      student.age,
      `"${student.sex}"`,
      globalScore,
      globalAverage,
      trenInf,
      coreSup,
      equilibrio,
      movilidad,
      coord,
      resist,
      `"${nivel}"`,
    ].join(',');
  });

  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

/**
 * Genera y descarga el archivo CSV anónimo en el navegador del cliente.
 */
export function exportClassroomCSV(session: ClassroomSession): void {
  if (typeof window === 'undefined') return;

  const csvContent = generateClassroomCSVContent(session);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const cleanLabel = (session.groupLabel || 'aula').replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `radar_motor_${cleanLabel}_${dateStr}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getConstructiveLevelLabel(score: number): string {
  if (score >= 85) return 'Referente';
  if (score >= 55) return 'Sólido';
  if (score >= 25) return 'En Progreso';
  return 'Base';
}
