import { FIRST_AID_GUIDES, PAS_PROTOCOL, SAFETY_QUESTIONS } from '../src/data/first-aid';

console.log('======================================================================');
console.log('    RADAR MOTOR — VERIFICACIÓN AUTOMÁTICA DEL BLINDAJE MÉDICO (FASE 2)   ');
console.log('======================================================================\n');

let totalChecks = 0;
let passedChecks = 0;

function assert(condition: boolean, message: string) {
  totalChecks++;
  if (!condition) {
    console.error(`❌ FALLO: ${message}`);
    process.exit(1);
  }
  passedChecks++;
}

// 1. Verificación del Semáforo Médico / PAR-Q+
console.log('▶ [1/4] Verificando SAFETY_QUESTIONS (Semáforo Previo)...');
assert(SAFETY_QUESTIONS.length === 3, `Deben existir exactamente 3 preguntas de seguridad (hay ${SAFETY_QUESTIONS.length})`);

const redQuestions = SAFETY_QUESTIONS.filter((q) => q.level === 'red');
const amberQuestions = SAFETY_QUESTIONS.filter((q) => q.level === 'amber');

assert(redQuestions.length === 1, `Debe haber exactamente 1 pregunta de bloqueo rojo (hay ${redQuestions.length})`);
assert(amberQuestions.length === 2, `Deben haber exactamente 2 preguntas de precaución ámbar (hay ${amberQuestions.length})`);

for (const q of SAFETY_QUESTIONS) {
  assert(q.title.length > 0, `Título no vacío para ${q.id}`);
  assert(q.question.length > 15, `Pregunta estructurada para ${q.id}`);
  assert(q.description.length > 10, `Descripción clara para ${q.id}`);
  assert(q.recommendation.length > 15, `Recomendación definida para ${q.id}`);
}
console.log('  ✓ 3 preguntas validadas: 1 Bloque Rojo (Stop inmediato) y 2 Bloques Ámbar (Precaución)');

// 2. Verificación del Protocolo PAS
console.log('\n▶ [2/4] Verificando PAS_PROTOCOL (Proteger · Avisar · Socorrer)...');
assert(PAS_PROTOCOL.length === 3, `El protocolo PAS debe tener exactamente 3 pasos (hay ${PAS_PROTOCOL.length})`);
assert(PAS_PROTOCOL[0].step === 'P' && PAS_PROTOCOL[0].title === 'PROTEGER', 'Paso 1 es PROTEGER');
assert(PAS_PROTOCOL[1].step === 'A' && PAS_PROTOCOL[1].title === 'AVISAR', 'Paso 2 es AVISAR');
assert(PAS_PROTOCOL[2].step === 'S' && PAS_PROTOCOL[2].title === 'SOCORRER', 'Paso 3 es SOCORRER');
console.log('  ✓ Protocolo PAS validado: P (Proteger), A (Avisar), S (Socorrer)');

// 3. Verificación de las 4 Fichas de Primeros Auxilios
console.log('\n▶ [3/4] Verificando FIRST_AID_GUIDES (4 fichas visuales)...');
assert(FIRST_AID_GUIDES.length === 4, `Deben existir exactamente 4 fichas de primeros auxilios (hay ${FIRST_AID_GUIDES.length})`);

const expectedGuideIds = ['fainting', 'injury', 'chest_pain', 'choking_pls'];
for (const id of expectedGuideIds) {
  const guide = FIRST_AID_GUIDES.find((g) => g.id === id);
  assert(!!guide, `Ficha ${id} existe en el catálogo`);
  assert(guide!.title.length > 0, `Título definido para ficha ${id}`);
  assert(guide!.subtitle.length > 0, `Subtítulo definido para ficha ${id}`);
  assert(guide!.stepsToDo.length >= 3, `Al menos 3 pasos de qué HACER en ${id}`);
  assert(guide!.whatNotToDo.length >= 2, `Al menos 2 advertencias de qué NO hacer en ${id}`);
  assert(guide!.alarmSigns.length >= 3, `Al menos 3 señales de alarma para el 112 en ${id}`);
}
console.log('  ✓ 4 fichas validadas: fainting (lipotimia), injury (caídas/traumas), chest_pain (dolor torácico), choking_pls (OVACE/PLS)');

// 4. Verificación de Lenguaje No Estigmatizante / Prohibición de Diagnóstico Clínico
console.log('\n▶ [4/4] Verificando cumplimiento de lenguaje no diagnóstico...');
const forbiddenWords = ['patología', 'diagnóstico', 'enfermedad', 'retraso'];
const allFirstAidText = JSON.stringify(FIRST_AID_GUIDES) + JSON.stringify(SAFETY_QUESTIONS) + JSON.stringify(PAS_PROTOCOL);

for (const word of forbiddenWords) {
  const found = allFirstAidText.toLowerCase().includes(word.toLowerCase());
  assert(!found, `No debe usarse el término clínico prohibido "${word}" en textos visibles al usuario`);
}
console.log('  ✓ Cero términos diagnósticos o estigmatizantes ("patología", "diagnóstico", "enfermedad", "retraso")');

console.log('\n======================================================================');
console.log(`✓ VERIFICACIÓN DE SEGURIDAD MÉDICA SUPERADA: ${passedChecks}/${totalChecks} comprobaciones.`);
console.log('======================================================================\n');
