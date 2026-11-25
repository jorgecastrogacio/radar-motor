import { ALL_AXIS_IDS, EXPRESS_TEST_IDS, TESTS_CATALOG } from '../src/data/tests-catalog';
import { NORMATIVE_CURVES } from '../src/data/normative-curves';
import { evaluateFullReport, getCurve } from '../src/lib/scoring-engine';
import { AgeBracket, AxisId, NormativeCurve, TestId } from '../src/types/radar-motor';

const AGE_BRACKETS: AgeBracket[] = [
  '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17',
  '18-20', '21-30', '31-40', '41-50', '51-60', '61-64', '65-69', '70-74', '75-79', '80+'
];

console.log('======================================================================');
console.log('       RADAR MOTOR — VERIFICACIÓN AUTOMÁTICA DEL MOTOR CENTRAL       ');
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

// -----------------------------------------------------------------------------
// VERIFICACIÓN 1: Catálogo de pruebas
// -----------------------------------------------------------------------------
console.log('▶ [1/5] Verificando catálogo de pruebas (tests-catalog.ts)...');
const testEntries = Object.values(TESTS_CATALOG);
assert(testEntries.length === 18, `Debe haber exactamente 18 pruebas (hay ${testEntries.length})`);

// 3 pruebas por cada uno de los 6 ejes
const testsPerAxis: Record<AxisId, number> = {
  lower_body_strength: 0,
  core_upper_strength: 0,
  balance_posture: 0,
  mobility_flexibility: 0,
  coordination_agility: 0,
  aerobic_stability: 0,
};

for (const t of testEntries) {
  assert(t.id in TESTS_CATALOG, `ID válido: ${t.id}`);
  assert(t.order >= 1 && t.order <= 18, `Orden 1-18 válido para ${t.id}`);
  assert(t.name.length > 0, `Nombre definido para ${t.id}`);
  assert(t.shortName.length > 0, `Nombre corto definido para ${t.id}`);
  assert(t.scientificRef.length > 0, `Referencia científica para ${t.id}`);
  assert(t.protocolSteps.length >= 3, `Protocolo de al menos 3 pasos para ${t.id}`);
  assert(t.safetyCue.length > 0, `Safety cue definido para ${t.id}`);
  assert(t.homeEquivalent.length > 0, `Equivalente doméstico para ${t.id}`);

  if (t.timerMode === 'manual_scale') {
    assert(
      Array.isArray(t.visualScaleOptions) && t.visualScaleOptions.length === 5,
      `La prueba manual_scale ${t.id} debe tener exactamente 5 opciones de escala visual`
    );
  }

  testsPerAxis[t.axisId]++;
}

for (const axisId of ALL_AXIS_IDS) {
  assert(testsPerAxis[axisId] === 3, `El eje ${axisId} debe tener exactamente 3 pruebas (tiene ${testsPerAxis[axisId]})`);
}

const expressTests = testEntries.filter((t) => t.isExpressTest);
assert(expressTests.length === 3, `Deben existir exactamente 3 pruebas express (hay ${expressTests.length})`);
assert(
  EXPRESS_TEST_IDS.includes('sit_to_stand_5x') &&
  EXPRESS_TEST_IDS.includes('monopodal_open') &&
  EXPRESS_TEST_IDS.includes('wall_toss_30s'),
  'Las 3 pruebas express deben ser sit_to_stand_5x, monopodal_open y wall_toss_30s'
);
console.log(`  ✓ 18 pruebas validadas: 3 por eje en 6 ejes, 3 express (${EXPRESS_TEST_IDS.join(', ')})`);

// -----------------------------------------------------------------------------
// VERIFICACIÓN 2: Recuento de curvas y nulidad (normative-curves.ts)
// -----------------------------------------------------------------------------
console.log('\n▶ [2/5] Verificando conteo de curvas y ausencia de nulos (normative-curves.ts)...');
let curveCount = 0;
let nanCount = 0;

for (const testId of Object.keys(TESTS_CATALOG) as TestId[]) {
  const ageObj = NORMATIVE_CURVES[testId];
  assert(!!ageObj, `Objeto de curvas existe para prueba ${testId}`);

  for (const bracket of AGE_BRACKETS) {
    const sexObj = ageObj[bracket];
    assert(!!sexObj, `Baremos existen para prueba ${testId} en corte ${bracket}`);

    for (const sex of ['M', 'F'] as const) {
      const curve: NormativeCurve = sexObj[sex];
      assert(!!curve, `Curva existe para ${testId} - ${bracket} - ${sex}`);

      const points = [curve.p10, curve.p25, curve.zsm_min, curve.zsm_opt, curve.p95];
      for (const p of points) {
        if (p === null || p === undefined || Number.isNaN(p)) {
          nanCount++;
        }
      }
      curveCount++;
    }
  }
}

assert(curveCount === 792, `Debe haber exactamente 792 curvas (18 x 22 x 2). Contadas: ${curveCount}`);
assert(nanCount === 0, `No debe haber valores NaN, null o undefined en las curvas. Encontrados: ${nanCount}`);
console.log(`  ✓ 792/792 curvas verificadas íntegras (0 valores NaN, null o undefined)`);

// -----------------------------------------------------------------------------
// VERIFICACIÓN 3: Monotonicidad estricta en las 792 curvas
// -----------------------------------------------------------------------------
console.log('\n▶ [3/5] Verificando monotonicidad estricta en las 792 curvas...');
let monotonicityErrors = 0;

for (const testId of Object.keys(TESTS_CATALOG) as TestId[]) {
  const testDef = TESTS_CATALOG[testId];
  const higherIsBetter = testDef.direction === 'higher_is_better';

  for (const bracket of AGE_BRACKETS) {
    for (const sex of ['M', 'F'] as const) {
      const c = NORMATIVE_CURVES[testId][bracket][sex];

      if (higherIsBetter) {
        const isMono = c.p10 < c.p25 && c.p25 < c.zsm_min && c.zsm_min < c.zsm_opt && c.zsm_opt < c.p95;
        if (!isMono) {
          console.error(`Error de monotonicidad (higher_is_better): ${testId} ${bracket} ${sex}`, c);
          monotonicityErrors++;
        }
      } else {
        const isMono = c.p10 > c.p25 && c.p25 > c.zsm_min && c.zsm_min > c.zsm_opt && c.zsm_opt > c.p95;
        if (!isMono) {
          console.error(`Error de monotonicidad (lower_is_better): ${testId} ${bracket} ${sex}`, c);
          monotonicityErrors++;
        }
      }
    }
  }
}

assert(monotonicityErrors === 0, `Monotonicidad estricta violada en ${monotonicityErrors} curvas`);
console.log(`  ✓ Monotonicidad estricta confirmada al 100% en las 792 curvas.`);

// -----------------------------------------------------------------------------
// VERIFICACIÓN 4: Simulación de 4 casos reales
// -----------------------------------------------------------------------------
console.log('\n▶ [4/5] Ejecutando simulación de los 4 casos clínicos-motrices requeridos...\n');

// CASO A: Niña de 7 años (18/18 pruebas realizadas)
console.log('----------------------------------------------------------------------');
console.log('CASO A: Niña de 7 años (sex: "F", 18/18 pruebas completas)');
console.log('----------------------------------------------------------------------');
const inputsCasoA: Partial<Record<TestId, number | null>> = {
  chair_stand_30s: 17,
  sit_to_stand_5x: 8.5,
  calf_raise_30s: 21,
  glute_bridge_30s: 18,
  wall_pushups_30s: 18,
  arm_curl_1l_30s: 19,
  monopodal_open: 24,
  tandem_stance_open: 30,
  tandem_walk_3m: 7.0,
  chair_sit_reach: 5,
  back_scratch: 6,
  knee_to_wall: 9.5,
  wall_toss_30s: 14,
  plate_tapping_25: 15.2,
  side_step_20s: 22,
  step_test_2min: 75,
  functional_reach: 24,
  step_touch_arms_60s: 50,
};

const reportA = evaluateFullReport(7, 'F', inputsCasoA, 'full');
assert(reportA.completedCount === 18, 'Caso A debe tener 18 pruebas completadas');
assert(reportA.totalTests === 18, 'Caso A debe tener 18 pruebas totales');
assert(reportA.ageBracket === '7', 'Caso A debe mapear a corte "7"');

console.log(`Edad: ${reportA.age} años | Corte: ${reportA.ageBracket} | Sexo: ${reportA.sex}`);
console.log(`Pruebas completadas: ${reportA.completedCount}/${reportA.totalTests}`);
console.log(`Puntuación Global (0-600): ${reportA.globalScore} | Media Global (0-100): ${reportA.globalAverage}`);
console.log('Resultados por Eje:');
for (const axisId of ALL_AXIS_IDS) {
  const ax = reportA.axisResults[axisId];
  console.log(`  - ${ax.name}: ${ax.score} pts [${ax.level}]`);
}
console.log(`Ejes con menor puntuación (foco de micro-retos): ${reportA.lowestAxes.join(', ')}`);

// CASO B: Niño de 7 años con 1 prueba saltada (null)
console.log('\n----------------------------------------------------------------------');
console.log('CASO B: Niño de 7 años (sex: "M", 1 prueba saltada = null - Ley Anti-trampas)');
console.log('----------------------------------------------------------------------');
const inputsCasoB: Partial<Record<TestId, number | null>> = {
  ...inputsCasoA,
  sit_to_stand_5x: null, // Prueba saltada
};

const reportB = evaluateFullReport(7, 'M', inputsCasoB, 'full');
const skippedTestResult = reportB.axisResults.lower_body_strength.testResults.find(
  (t) => t.testId === 'sit_to_stand_5x'
);

assert(reportB.completedCount === 17, 'Caso B debe registrar 17 pruebas completadas');
assert(skippedTestResult?.skipped === true, 'sit_to_stand_5x debe estar marcada como skipped: true');
assert(skippedTestResult?.score === 0, 'sit_to_stand_5x debe puntuar 0 puntos');

// Comprobar la Ley Anti-trampas en el eje lower_body_strength
const [t1, t2, t3] = reportB.axisResults.lower_body_strength.testResults;
const expectedAxisScore = Math.round(((t1.score + 0 + t3.score) / 3) * 10) / 10;
assert(
  reportB.axisResults.lower_body_strength.score === expectedAxisScore,
  `El eje tren inferior debe calcularse con denominador fijo 3 (${expectedAxisScore})`
);

console.log(`Edad: ${reportB.age} años | Corte: ${reportB.ageBracket} | Sexo: ${reportB.sex}`);
console.log(`Pruebas completadas: ${reportB.completedCount}/${reportB.totalTests} (1 saltada)`);
console.log(`Prueba saltada sit_to_stand_5x: score = ${skippedTestResult?.score} pts, skipped = ${skippedTestResult?.skipped}`);
console.log(
  `Eje Tren Inferior: (${t1.score} + ${t2.score} + ${t3.score}) / 3 = ${reportB.axisResults.lower_body_strength.score} pts [${reportB.axisResults.lower_body_strength.level}]`
);
console.log(`Puntuación Global: ${reportB.globalScore}/600 | Media Global: ${reportB.globalAverage}/100`);
console.log('✓ Ley Anti-trampas confirmada: la prueba saltada computó 0 y redujo el eje por división fija entre 3.');

// CASO C: Adulta de 42 años con sex: 'N' (promedio neutral exacto)
console.log('\n----------------------------------------------------------------------');
console.log('CASO C: Adulta de 42 años (sex: "N" - Promedio Neutral Exacto)');
console.log('----------------------------------------------------------------------');
const curveM42 = NORMATIVE_CURVES.chair_stand_30s['41-50'].M;
const curveF42 = NORMATIVE_CURVES.chair_stand_30s['41-50'].F;
const curveN42 = getCurve('chair_stand_30s', 42, 'N');

const expectedP10 = Math.round(((curveM42.p10 + curveF42.p10) / 2) * 10) / 10;
const expectedZsmMin = Math.round(((curveM42.zsm_min + curveF42.zsm_min) / 2) * 10) / 10;
assert(curveN42.p10 === expectedP10, `Curva N p10 (${curveN42.p10}) debe ser promedio de M y F (${expectedP10})`);
assert(curveN42.zsm_min === expectedZsmMin, `Curva N zsm_min (${curveN42.zsm_min}) debe ser promedio de M y F (${expectedZsmMin})`);

const inputsCasoC: Partial<Record<TestId, number | null>> = {
  chair_stand_30s: 22,
  sit_to_stand_5x: 7.5,
  calf_raise_30s: 28,
  glute_bridge_30s: 24,
  wall_pushups_30s: 26,
  arm_curl_1l_30s: 28,
  monopodal_open: 40,
  tandem_stance_open: 45,
  tandem_walk_3m: 5.2,
  chair_sit_reach: 4,
  back_scratch: 2,
  knee_to_wall: 11,
  wall_toss_30s: 28,
  plate_tapping_25: 10.5,
  side_step_20s: 32,
  step_test_2min: 95,
  functional_reach: 34,
  step_touch_arms_60s: 66,
};

const reportC = evaluateFullReport(42, 'N', inputsCasoC, 'full');
console.log(`Edad: ${reportC.age} años | Corte: ${reportC.ageBracket} | Sexo: ${reportC.sex} (Neutro)`);
console.log(`Verificación de baremo neutro en Sentadillas 30s:`);
console.log(`  - Baremo M: p10=${curveM42.p10}, zsm_min=${curveM42.zsm_min}, zsm_opt=${curveM42.zsm_opt}, p95=${curveM42.p95}`);
console.log(`  - Baremo F: p10=${curveF42.p10}, zsm_min=${curveF42.zsm_min}, zsm_opt=${curveF42.zsm_opt}, p95=${curveF42.p95}`);
console.log(`  - Baremo N (Promedio): p10=${curveN42.p10}, zsm_min=${curveN42.zsm_min}, zsm_opt=${curveN42.zsm_opt}, p95=${curveN42.p95}`);
console.log(`Puntuación Global Caso C: ${reportC.globalScore}/600 | Media Global: ${reportC.globalAverage}/100`);
console.log('✓ Promedio aritmético neutral verificado satisfactoriamente.');

// CASO D: Hombre de 76 años en modo 'full' vs modo 'express'
console.log('\n----------------------------------------------------------------------');
console.log('CASO D: Hombre de 76 años (sex: "M" - Modo "full" vs Modo "express")');
console.log('----------------------------------------------------------------------');
const inputsCasoD: Partial<Record<TestId, number | null>> = {
  // Pruebas Express
  sit_to_stand_5x: 12.0, // Rápido y sólido para 76 años
  monopodal_open: 16,    // 16s en zona saludable
  wall_toss_30s: 18,     // 18 recepciones
  // Resto de pruebas para modo completo
  chair_stand_30s: 14,
  calf_raise_30s: 17,
  glute_bridge_30s: 14,
  wall_pushups_30s: 16,
  arm_curl_1l_30s: 18,
  tandem_stance_open: 26,
  tandem_walk_3m: 8.5,
  chair_sit_reach: 0,
  back_scratch: -4,
  knee_to_wall: 7.5,
  plate_tapping_25: 14.5,
  side_step_20s: 19,
  step_test_2min: 68,
  functional_reach: 24,
  step_touch_arms_60s: 42,
};

const reportDFull = evaluateFullReport(76, 'M', inputsCasoD, 'full');
const reportDExpress = evaluateFullReport(76, 'M', inputsCasoD, 'express');

assert(reportDFull.mode === 'full', 'Modo debe ser "full"');
assert(reportDFull.totalTests === 18, 'Modo full tiene 18 pruebas');
assert(reportDExpress.mode === 'express', 'Modo debe ser "express"');
assert(reportDExpress.totalTests === 3, 'Modo express tiene 3 pruebas');
assert(reportDExpress.completedCount === 3, 'Modo express completó 3 pruebas');

console.log(`[Modo Full] Edad: 76 (Corte: ${reportDFull.ageBracket}) | Completadas: ${reportDFull.completedCount}/${reportDFull.totalTests}`);
console.log(`  - Puntuación Global: ${reportDFull.globalScore}/600 | Media Global: ${reportDFull.globalAverage}/100`);
console.log(`  - Ejes débiles: ${reportDFull.lowestAxes.join(', ')}`);

console.log(`[Modo Express] Edad: 76 (Corte: ${reportDExpress.ageBracket}) | Completadas: ${reportDExpress.completedCount}/${reportDExpress.totalTests}`);
console.log(`  - Media Express: ${reportDExpress.globalAverage}/100`);
for (const axisId of ['lower_body_strength', 'balance_posture', 'coordination_agility'] as AxisId[]) {
  const ax = reportDExpress.axisResults[axisId];
  console.log(`  - ${ax.name} (Express): ${ax.score} pts [${ax.level}]`);
}
console.log(`  - Ejes débiles en Express: ${reportDExpress.lowestAxes.join(', ')}`);

// -----------------------------------------------------------------------------
// RESUMEN FINAL
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(`✓ VERIFICACIÓN COMPLETADA CON ÉXITO: ${passedChecks}/${totalChecks} comprobaciones superadas.`);
console.log('======================================================================\n');
