import { ARCHETYPES, determineArchetype } from '../src/data/archetypes';
import { MICRO_CHALLENGES, getRecommendedMicroChallenges } from '../src/data/micro-challenges';
import {
  encodeChallengePayload,
  decodeChallengePayload,
  buildChallengeUrl,
  generateNinetyDayReminderICS,
  ChallengePayload,
} from '../src/lib/share-codec';
import { AxisId, EvaluationReport, AxisResult } from '../src/types/radar-motor';
import { ALL_AXIS_IDS } from '../src/data/tests-catalog';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`❌ FAILED: ${message}`);
  }
}

console.log('--- INICIANDO VERIFICACIÓN FASE 5: REPORT VIRAL ---');

// 1. VERIFICACIÓN DE ARQUETIPOS
console.log('1. Verificando arquetipos motores (8 arquetipos)...');
const expectedArchetypeIds = [
  'radar_equilibrado',
  'resorte_explosivo',
  'nucleo_de_acero',
  'equilibrista_precision',
  'articulacion_elastica',
  'reflejo_veloz',
  'motor_diesel',
  'semilla_en_marcha',
];

assert(Object.keys(ARCHETYPES).length === 8, 'Deben existir exactamente 8 arquetipos definidos');

for (const id of expectedArchetypeIds) {
  const arch = ARCHETYPES[id];
  assert(Boolean(arch), `El arquetipo ${id} debe existir`);
  assert(arch.name.length > 0, `El arquetipo ${id} debe tener nombre`);
  assert(arch.badge.length > 0, `El arquetipo ${id} debe tener badge`);
  assert(arch.strengthsText.length > 0, `El arquetipo ${id} debe tener texto de fortalezas`);
  assert(arch.opportunityText.length > 0, `El arquetipo ${id} debe tener oportunidad de crecimiento`);
}

// 2. VERIFICACIÓN DE LÓGICA determineArchetype
console.log('2. Verificando lógica determineArchetype...');

const mockBaseReport = (globalAvg: number, axisScores: Record<AxisId, number>): EvaluationReport => {
  const axisResults: Partial<Record<AxisId, AxisResult>> = {};
  for (const [axisId, score] of Object.entries(axisScores)) {
    axisResults[axisId as AxisId] = {
      axisId: axisId as AxisId,
      name: axisId,
      score,
      level: 'Sólido',
      testResults: [
        {
          testId: 'sit_to_stand_5x',
          name: axisId,
          rawValue: 10,
          unit: 's',
          direction: 'lower_is_better',
          score,
          level: 'Sólido',
          zsmStatus: 'in_zsm',
          skipped: false,
          curve: { p10: 15, p25: 12, zsm_min: 9, zsm_opt: 7, p95: 5 },
        },
      ],
    };
  }
  return {
    age: 25,
    ageBracket: '21-30',
    sex: 'M',
    mode: 'full',
    globalScore: globalAvg * 6,
    globalAverage: globalAvg,
    completedCount: 18,
    totalTests: 18,
    axisResults,
    lowestAxes: ['mobility_flexibility'],
  };
};

// Caso Semilla en Marcha (< 35 pts)
const seedReport = mockBaseReport(28, {
  lower_body_strength: 30,
  core_upper_strength: 28,
  balance_posture: 25,
  mobility_flexibility: 26,
  coordination_agility: 32,
  aerobic_stability: 27,
});
assert(determineArchetype(seedReport).id === 'semilla_en_marcha', 'Media < 35 debe retornar semilla_en_marcha');

// Caso Radar Equilibrado (diferencia <= 14)
const balancedReport = mockBaseReport(65, {
  lower_body_strength: 65,
  core_upper_strength: 68,
  balance_posture: 62,
  mobility_flexibility: 64,
  coordination_agility: 66,
  aerobic_stability: 63,
});
assert(determineArchetype(balancedReport).id === 'radar_equilibrado', 'Puntuaciones homogéneas deben retornar radar_equilibrado');

// Caso Resorte Explosivo (dominante tren inferior)
const lowerReport = mockBaseReport(65, {
  lower_body_strength: 92,
  core_upper_strength: 55,
  balance_posture: 60,
  mobility_flexibility: 50,
  coordination_agility: 62,
  aerobic_stability: 58,
});
assert(determineArchetype(lowerReport).id === 'resorte_explosivo', 'Dominancia en tren inferior debe retornar resorte_explosivo');

// Caso Equilibrista (dominante balance_posture)
const balanceReport = mockBaseReport(60, {
  lower_body_strength: 50,
  core_upper_strength: 52,
  balance_posture: 90,
  mobility_flexibility: 48,
  coordination_agility: 55,
  aerobic_stability: 53,
});
assert(determineArchetype(balanceReport).id === 'equilibrista_precision', 'Dominancia en equilibrio debe retornar equilibrista_precision');

// 3. VERIFICACIÓN DE MICRO-RETOS (18 retos, 3 por cada uno de los 6 ejes)
console.log('3. Verificando catálogo de micro-retos domésticos (18 retos)...');

assert(MICRO_CHALLENGES.length === 18, 'Deben existir exactamente 18 micro-retos en total');

for (const axisId of ALL_AXIS_IDS) {
  const challengesForAxis = MICRO_CHALLENGES.filter((c) => c.axisId === axisId);
  assert(challengesForAxis.length === 3, `El eje ${axisId} debe tener exactamente 3 micro-retos (tiene ${challengesForAxis.length})`);
  for (const c of challengesForAxis) {
    assert(c.title.length > 0, `El reto ${c.id} debe tener título`);
    assert(c.instruction.length > 0, `El reto ${c.id} debe tener instrucción`);
    assert(c.homeTip.length > 0, `El reto ${c.id} debe tener consejo doméstico`);
    assert(c.durationMinutes >= 1 && c.durationMinutes <= 5, `El reto ${c.id} debe durar entre 1 y 5 min`);
  }
}

// Comprobación de getRecommendedMicroChallenges
const recs = getRecommendedMicroChallenges(lowerReport, 2);
assert(recs.length === 2, 'getRecommendedMicroChallenges debe devolver 2 micro-retos recomendados');
assert(recs[0].id !== recs[1].id, 'Los dos micro-retos no deben ser repetidos');

// Comprobación con puntuación flotante típica de modo exprés (ej. 73.5)
const expressFloatReport: EvaluationReport = {
  ...lowerReport,
  mode: 'express',
  globalScore: 73.5,
  globalAverage: 24.5,
};
const recsFloat = getRecommendedMicroChallenges(expressFloatReport, 2);
assert(recsFloat.length === 2, 'getRecommendedMicroChallenges con globalScore flotante debe devolver 2 micro-retos');
assert(recsFloat[0] !== undefined && recsFloat[1] !== undefined, 'Ningún micro-reto devuelto debe ser undefined');
assert(typeof recsFloat[0].durationMinutes === 'number', 'durationMinutes debe ser número');

// 4. VERIFICACIÓN DE CODEC DE RETO BASE64 URL-SAFE
console.log('4. Verificando codec de retos URL-safe con caracteres UTF-8 en español...');

const samplePayload: ChallengePayload = {
  alias: 'Papá Ramón (52 años) & Lucía',
  age: 52,
  ageBracket: '51-60',
  sex: 'M',
  globalScore: 74,
  archetypeId: 'resorte_explosivo',
  axisScores: {
    lower_body_strength: 88,
    core_upper_strength: 65,
    balance_posture: 72,
    mobility_flexibility: 58,
    coordination_agility: 70,
    aerobic_stability: 76,
  },
  date: '2026-11-24',
};

const encoded = encodeChallengePayload(samplePayload);
assert(encoded.length > 0, 'La cadena codificada no debe estar vacía');
assert(!encoded.includes('+') && !encoded.includes('/') && !encoded.includes('='), 'La cadena debe ser URL-safe (sin +, /, =)');

const decoded = decodeChallengePayload(encoded);
assert(decoded !== null, 'La decodificación no debe fallar');
assert(decoded?.alias === samplePayload.alias, `El alias decodificado '${decoded?.alias}' debe coincidir con el original '${samplePayload.alias}'`);
assert(decoded?.globalScore === samplePayload.globalScore, 'La puntuación decodificada debe coincidir');
assert(decoded?.axisScores.lower_body_strength === 88, 'Las puntuaciones de ejes deben preservarse');

const challengeUrl = buildChallengeUrl(lowerReport, 'https://radar-motor.vercel.app', 'Mamá Carmen');
assert(challengeUrl.startsWith('https://radar-motor.vercel.app/evaluar?reto='), 'La URL generada debe tener la ruta y query param correctos');

// 5. VERIFICACIÓN DEL GENERADOR .ICS (90 DÍAS)
console.log('5. Verificando generador de recordatorio iCalendar (.ics)...');

const icsText = generateNinetyDayReminderICS('Abuela Rosa');
assert(icsText.includes('BEGIN:VCALENDAR'), 'El .ics debe contener BEGIN:VCALENDAR');
assert(icsText.includes('END:VCALENDAR'), 'El .ics debe contener END:VCALENDAR');
assert(icsText.includes('BEGIN:VEVENT'), 'El .ics debe contener BEGIN:VEVENT');
assert(icsText.includes('SUMMARY:Reevaluación de Abuela Rosa en RADAR MOTOR (90 días)'), 'El .ics debe incluir el alias en el summary');
assert(icsText.includes('STATUS:CONFIRMED'), 'El .ics debe marcar status confirmed');

console.log('\n---------------------------------------------------------');
console.log(`TOTAL DE COMPROBACIONES: ${passed + failed}`);
console.log(`✅ APROBADAS: ${passed}`);
console.log(`❌ FALLIDAS: ${failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 FASE 5 VERIFICADA CON ÉXITO');
}
