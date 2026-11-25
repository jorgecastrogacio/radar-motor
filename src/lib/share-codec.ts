import { AgeBracket, AxisId, EvaluationReport, Sex } from '../types/radar-motor';
import { determineArchetype } from '../data/archetypes';

export interface ChallengePayload {
  v?: number; // Versión de formato de reto (v2 añade globalAverage explícito)
  alias: string;
  age: number;
  ageBracket: AgeBracket;
  sex: Sex;
  globalScore: number;
  globalAverage?: number;
  archetypeId: string;
  axisScores: Partial<Record<AxisId, number>>;
  date: string;
}

export interface HistoryEntry {
  id: string;
  date: string;
  alias: string;
  age: number;
  ageBracket: AgeBracket;
  sex: Sex;
  globalScore: number;
  archetypeId: string;
  axisScores: Record<AxisId, number>;
  mode: 'full' | 'express';
}

const HISTORY_STORAGE_KEY = 'radar_motor_personal_history';

/**
 * Codifica de forma segura y URL-safe un reto motor en Base64 con soporte UTF-8.
 */
export function encodeChallengePayload(payload: ChallengePayload): string {
  try {
    const jsonStr = JSON.stringify(payload);
    if (typeof TextEncoder !== 'undefined') {
      const utf8Bytes = new TextEncoder().encode(jsonStr);
      let binary = '';
      for (let i = 0; i < utf8Bytes.length; i++) {
        binary += String.fromCharCode(utf8Bytes[i]);
      }
      const b64 = (typeof btoa !== 'undefined' ? btoa : (s: string) => Buffer.from(s, 'binary').toString('base64'))(binary);
      return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } else {
      const b64 = Buffer.from(jsonStr, 'utf-8').toString('base64');
      return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
  } catch (err) {
    console.error('Error al codificar reto:', err);
    return '';
  }
}

/**
 * Decodifica una cadena Base64 URL-safe devolviendo el objeto ChallengePayload.
 */
export function decodeChallengePayload(encoded: string): ChallengePayload | null {
  if (!encoded || typeof encoded !== 'string') return null;
  try {
    let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';

    if (typeof TextDecoder !== 'undefined') {
      const binary = (typeof atob !== 'undefined' ? atob : (s: string) => Buffer.from(s, 'base64').toString('binary'))(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const jsonStr = new TextDecoder().decode(bytes);
      return JSON.parse(jsonStr) as ChallengePayload;
    } else {
      const jsonStr = Buffer.from(b64, 'base64').toString('utf-8');
      return JSON.parse(jsonStr) as ChallengePayload;
    }
  } catch (err) {
    console.error('Error al decodificar reto:', err);
    return null;
  }
}

/**
 * Construye el payload a partir de un EvaluationReport y alias.
 */
export function createChallengePayloadFromReport(
  report: EvaluationReport,
  alias = 'Familiar'
): ChallengePayload {
  const archetype = determineArchetype(report);
  const axisScores: Partial<Record<AxisId, number>> = {};

  if (report.axisResults) {
    for (const [axisId, res] of Object.entries(report.axisResults)) {
      if (typeof res?.score === 'number') {
        axisScores[axisId as AxisId] = Math.round(res.score);
      }
    }
  }

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return {
    v: 2,
    alias,
    age: report.age,
    ageBracket: report.ageBracket,
    sex: report.sex,
    globalScore: Math.round(report.globalScore),
    globalAverage: Math.round(report.globalAverage),
    archetypeId: archetype ? archetype.id : (report.mode === 'express' ? 'parcial' : 'sin_datos'),
    axisScores,
    date: dateStr,
  };
}

/**
 * Genera la URL completa de desafío con el parámetro ?reto=...
 */
export function buildChallengeUrl(
  report: EvaluationReport,
  origin: string,
  alias = 'Familiar'
): string {
  const payload = createChallengePayloadFromReport(report, alias);
  const code = encodeChallengePayload(payload);
  const cleanOrigin = origin.replace(/\/+$/, '');
  return `${cleanOrigin}/evaluar?reto=${code}`;
}

/**
 * Genera el contenido de un archivo .ics para el recordatorio de reevaluación a los 90 días.
 */
export function generateNinetyDayReminderICS(
  alias = 'Tu Radar Motor',
  fromDate = new Date()
): string {
  const targetDate = new Date(fromDate.getTime() + 90 * 24 * 60 * 60 * 1000);
  targetDate.setHours(10, 0, 0, 0);

  const formatICSDate = (d: Date): string => {
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const minutes = String(d.getUTCMinutes()).padStart(2, '0');
    const seconds = String(d.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  };

  const endDate = new Date(targetDate.getTime() + 30 * 60 * 1000); // 30 minutos

  const nowStr = formatICSDate(new Date());
  const startStr = formatICSDate(targetDate);
  const endStr = formatICSDate(endDate);
  const uid = `radar-motor-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@radar-motor.vercel.app`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RADAR MOTOR//Autoevaluacion Motriz//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:Reevaluación de ${alias} en RADAR MOTOR (90 días)`,
    'DESCRIPTION:¡Han pasado 90 días desde tu última autoevaluación motriz! Es el momento perfecto para comprobar tus avances, ver cómo han respondido tus micro-retos y recalibrar tu Radar.',
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Recordatorio de Reevaluación RADAR MOTOR',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Descarga en el navegador el recordatorio en archivo .ics
 */
export function downloadNinetyDayReminderICS(alias = 'Tu Radar Motor'): void {
  if (typeof window === 'undefined') return;
  const icsContent = generateNinetyDayReminderICS(alias);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'radar-motor-recordatorio-90-dias.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Guarda un informe en el historial personal de este dispositivo (localStorage).
 */
export function saveReportToHistory(
  report: EvaluationReport,
  alias = 'Tú'
): HistoryEntry | null {
  if (typeof window === 'undefined') return null;
  try {
    const archetype = determineArchetype(report);
    const axisScores: Record<AxisId, number> = {
      lower_body_strength: 0,
      core_upper_strength: 0,
      balance_posture: 0,
      mobility_flexibility: 0,
      coordination_agility: 0,
      aerobic_stability: 0,
    };

    if (report.axisResults) {
      for (const [k, v] of Object.entries(report.axisResults)) {
        if (v && typeof v.score === 'number') {
          axisScores[k as AxisId] = Math.round(v.score);
        }
      }
    }

    const entry: HistoryEntry = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString(),
      alias,
      age: report.age,
      ageBracket: report.ageBracket,
      sex: report.sex,
      globalScore: Math.round(report.globalScore),
      archetypeId: archetype ? archetype.id : (report.mode === 'express' ? 'express_parcial' : 'sin_datos'),
      axisScores,
      mode: report.mode,
    };

    const existing = getPersonalHistory();
    // Guardar hasta 10 entradas históricas más recientes
    const updated = [entry, ...existing.filter((e) => e.date !== entry.date)].slice(0, 10);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return entry;
  } catch (err) {
    console.error('Error al guardar historial:', err);
    return null;
  }
}

/**
 * Obtiene el historial personal de evaluaciones guardadas en localStorage.
 */
export function getPersonalHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

/**
 * Limpia el historial personal.
 */
export function clearPersonalHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_STORAGE_KEY);
}
