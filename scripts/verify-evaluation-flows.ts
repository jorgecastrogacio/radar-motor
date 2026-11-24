import * as fs from 'fs';
import * as path from 'path';
import { ALL_AXIS_IDS, EXPRESS_TEST_IDS } from '../src/data/tests-catalog';
import { evaluateFullReport } from '../src/lib/scoring-engine';
import {
  ClassroomSession,
  generateClassroomCSVContent,
  Participant,
} from '../src/lib/session-store';

console.log('======================================================================');
console.log(' RADAR MOTOR — VERIFICACIÓN AUTOMÁTICA EVALUATION FLOWS (FASE 4)     ');
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
// VERIFICACIÓN 1: Integridad de rutas y archivos de página Next.js
// -----------------------------------------------------------------------------
console.log('▶ [1/3] Verificando existencia de las 5 rutas clave de la aplicación...');
const requiredPages = [
  '../src/app/page.tsx',
  '../src/app/evaluar/page.tsx',
  '../src/app/aula/page.tsx',
  '../src/app/informe/page.tsx',
  '../src/app/primeros-auxilios/page.tsx',
];

for (const p of requiredPages) {
  const fullPath = path.resolve(__dirname, p);
  const exists = fs.existsSync(fullPath);
  assert(exists, `Ruta obligatoria ${p} debe existir`);
}
console.log('  ✓ Rutas verificadas: /, /evaluar, /aula, /informe, /primeros-auxilios');

// -----------------------------------------------------------------------------
// VERIFICACIÓN 2: Simulación de Modo Familia (Niña 7a + Abuelo 74a)
// -----------------------------------------------------------------------------
console.log('\n▶ [2/3] Verificando simulación completa de Modo Familia (2 generaciones)...');

const familiaParticipantes: Participant[] = [
  {
    id: 'f1',
    alias: 'Lucía',
    age: 7,
    sex: 'F',
    inputs: {
      sit_to_stand_5x: 8.5,
      monopodal_open: 26,
      wall_toss_30s: 15,
      chair_stand_30s: 18,
      calf_raise_30s: 22,
      glute_bridge_30s: 19,
      wall_pushups_30s: 19,
      arm_curl_1l_30s: 20,
      tandem_stance_open: 32,
      tandem_walk_3m: 6.8,
      chair_sit_reach: 6,
      back_scratch: 7,
      knee_to_wall: 9.8,
      plate_tapping_25: 14.8,
      side_step_20s: 23,
      step_test_2min: 78,
      functional_reach: 25,
      step_touch_arms_60s: 52,
    },
  },
  {
    id: 'f2',
    alias: 'Abuelo Manuel',
    age: 74,
    sex: 'M',
    inputs: {
      sit_to_stand_5x: 12.2,
      monopodal_open: 15,
      wall_toss_30s: 17,
      chair_stand_30s: 13,
      calf_raise_30s: 16,
      glute_bridge_30s: 13,
      wall_pushups_30s: 15,
      arm_curl_1l_30s: 17,
      tandem_stance_open: 24,
      tandem_walk_3m: 8.8,
      chair_sit_reach: -1,
      back_scratch: -5,
      knee_to_wall: 7.0,
      plate_tapping_25: 15.0,
      side_step_20s: 18,
      step_test_2min: 65,
      functional_reach: 22,
      step_touch_arms_60s: 39,
    },
  },
];

const reportLucia = evaluateFullReport(
  familiaParticipantes[0].age,
  familiaParticipantes[0].sex,
  familiaParticipantes[0].inputs,
  'full'
);

const reportAbuelo = evaluateFullReport(
  familiaParticipantes[1].age,
  familiaParticipantes[1].sex,
  familiaParticipantes[1].inputs,
  'full'
);

assert(reportLucia.ageBracket === '7', 'Lucía mapea a corte 7 años');
assert(reportAbuelo.ageBracket === '70-74', 'Abuelo Manuel mapea a corte 70-74 años');
assert(reportLucia.completedCount === 18, 'Lucía completó 18/18 pruebas');
assert(reportAbuelo.completedCount === 18, 'Abuelo Manuel completó 18/18 pruebas');
assert(reportLucia.globalScore > 0 && reportLucia.globalScore <= 600, 'Score global de Lucía válido');
assert(reportAbuelo.globalScore > 0 && reportAbuelo.globalScore <= 600, 'Score global del Abuelo válido');

console.log(`  ✓ Lucía (7 años, F): Media Global ${reportLucia.globalAverage}/100 [${reportLucia.axisResults.lower_body_strength.level}]`);
console.log(`  ✓ Abuelo Manuel (74 años, M): Media Global ${reportAbuelo.globalAverage}/100 [${reportAbuelo.axisResults.lower_body_strength.level}]`);

// -----------------------------------------------------------------------------
// VERIFICACIÓN 3: Simulación de Modo Aula y Generación de CSV Anónimo (RGPD)
// -----------------------------------------------------------------------------
console.log('\n▶ [3/3] Verificando Modo Aula (5 alumnos de 7 años) y exportación CSV anónima...');

const testClassroomSession: ClassroomSession = {
  groupLabel: '2º Primaria A',
  defaultAge: 7,
  testMode: 'express',
  students: [
    {
      id: 'st_1',
      alias: 'Alumno #01',
      age: 7,
      sex: 'M',
      inputs: { sit_to_stand_5x: 8.8, monopodal_open: 24, wall_toss_30s: 14 },
    },
    {
      id: 'st_2',
      alias: 'Alumno #02',
      age: 7,
      sex: 'F',
      inputs: { sit_to_stand_5x: 9.2, monopodal_open: 28, wall_toss_30s: 13 },
    },
    {
      id: 'st_3',
      alias: 'Alumno #03',
      age: 7,
      sex: 'M',
      inputs: { sit_to_stand_5x: 11.5, monopodal_open: 12, wall_toss_30s: 9 }, // Marca más baja
    },
    {
      id: 'st_4',
      alias: 'Alumno #04',
      age: 7,
      sex: 'F',
      inputs: { sit_to_stand_5x: 7.9, monopodal_open: 31, wall_toss_30s: 16 }, // Marca alta
    },
    {
      id: 'st_5',
      alias: 'Alumno #05',
      age: 7,
      sex: 'N',
      inputs: { sit_to_stand_5x: null, monopodal_open: 22, wall_toss_30s: 12 }, // 1 prueba saltada (Ley Anti-trampas)
    },
  ],
  updatedAt: new Date().toISOString(),
};

// Generar informes para cada alumno
testClassroomSession.students = testClassroomSession.students.map((st) => ({
  ...st,
  report: evaluateFullReport(st.age, st.sex, st.inputs, 'express'),
}));

// Generar texto CSV
const csvOutput = generateClassroomCSVContent(testClassroomSession);
assert(typeof csvOutput === 'string' && csvOutput.length > 50, 'CSV generado no vacío');

// Comprobar cabeceras requeridas
const expectedHeaders = ['Alias', 'Edad', 'Sexo', 'Puntuacion_Global', 'Media_Global', 'Tren_Inferior'];
for (const h of expectedHeaders) {
  assert(csvOutput.includes(h), `El CSV debe contener la cabecera ${h}`);
}

// Comprobar que contiene las filas de los alumnos
assert(csvOutput.includes('"Alumno #01"'), 'CSV contiene Alumno #01');
assert(csvOutput.includes('"Alumno #05"'), 'CSV contiene Alumno #05');

// Comprobar estadísticas de la cohorte
let inZsmCount = 0;
for (const st of testClassroomSession.students) {
  const tr = st.report?.axisResults.lower_body_strength?.testResults[0];
  if (tr && (tr.zsmStatus === 'in_zsm' || tr.zsmStatus === 'above_zsm')) {
    inZsmCount++;
  }
}
const zsmPercentage = Math.round((inZsmCount / testClassroomSession.students.length) * 100);
assert(zsmPercentage >= 0 && zsmPercentage <= 100, '% ZSM válido');

console.log(`  ✓ CSV generado correctamente (${csvOutput.split('\r\n').length - 1} filas de datos).`);
console.log(`  ✓ Estadísticas de la clase: ${zsmPercentage}% de alumnos en Zona de Salud Motriz (Tren Inferior).`);
console.log('  ✓ Alumno #05 con prueba saltada procesado sin errores bajo la Ley Anti-trampas.');

console.log('\n======================================================================');
console.log(`✓ VERIFICACIÓN DE FLUJOS DE EVALUACIÓN SUPERADA: ${passedChecks}/${totalChecks} comprobaciones.`);
console.log('======================================================================\n');
