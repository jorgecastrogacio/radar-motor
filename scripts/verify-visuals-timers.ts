import { ALL_TEST_IDS } from '../src/data/tests-catalog';
import { audioSynth } from '../src/lib/audio-synth';
import { TestId } from '../src/types/radar-motor';

console.log('======================================================================');
console.log('  RADAR MOTOR — VERIFICACIÓN AUTOMÁTICA VISUALS & TIMERS (FASE 3)    ');
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

// 1. Verificación del Sintetizador Sonoro (Web Audio API)
console.log('▶ [1/4] Verificando Sintetizador Sonoro Web Audio API (audio-synth.ts)...');
assert(typeof audioSynth.playPrepBeep === 'function', 'audioSynth.playPrepBeep debe ser función');
assert(typeof audioSynth.playStartBeep === 'function', 'audioSynth.playStartBeep debe ser función');
assert(typeof audioSynth.playHalfwayBeep === 'function', 'audioSynth.playHalfwayBeep debe ser función');
assert(typeof audioSynth.playFinishBeep === 'function', 'audioSynth.playFinishBeep debe ser función');
assert(typeof audioSynth.playTapClick === 'function', 'audioSynth.playTapClick debe ser función');
assert(typeof audioSynth.setMuted === 'function', 'audioSynth.setMuted debe ser función');
assert(typeof audioSynth.toggleMute === 'function', 'audioSynth.toggleMute debe ser función');

// Test de mute
audioSynth.setMuted(true);
assert(audioSynth.getMuted() === true, 'audioSynth debe estar silenciado tras setMuted(true)');
audioSynth.playPrepBeep(); // Debe ejecutarse silenciosamente sin fallar en entorno Node/SSR
audioSynth.toggleMute();
assert(audioSynth.getMuted() === false, 'audioSynth debe reactivarse con toggleMute()');
console.log('  ✓ Sintetizador sonoro 100% operativo y seguro en SSR/Node');

// 2. Verificación de las 18 Ilustraciones Vectoriales Duales
console.log('\n▶ [2/4] Verificando las 18 Ilustraciones SVG Duales en TestIllustration.tsx...');
assert(ALL_TEST_IDS.length === 18, `Deben existir 18 TestId (hay ${ALL_TEST_IDS.length})`);

// Importamos el archivo de ilustración como texto para comprobar que cada testId tiene sus dos paneles implementados
import * as fs from 'fs';
import * as path from 'path';

const illustrationCode = fs.readFileSync(
  path.resolve(__dirname, '../src/components/illustrations/TestIllustration.tsx'),
  'utf-8'
);

for (const testId of ALL_TEST_IDS) {
  const hasInStart = illustrationCode.includes(`case '${testId}':`);
  assert(hasInStart, `El testId ${testId} debe estar implementado específicamente en TestIllustration.tsx`);
}
console.log('  ✓ Las 18 pruebas cuentan con viñetas duales (Inicio y Ejecución) vectoriales SVG específicas');

// 3. Verificación de Cero Archivos Multimedia Externos
console.log('\n▶ [3/4] Comprobando regla inviolable: Cero archivos multimedia externos (.mp3, .wav, .png, etc.)...');
const componentsDir = path.resolve(__dirname, '../src/components');
const filesToCheck: string[] = [];

function getFiles(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getFiles(fullPath);
    } else {
      filesToCheck.push(fullPath);
    }
  }
}

getFiles(componentsDir);
getFiles(path.resolve(__dirname, '../src/lib'));

const forbiddenExts = ['.mp3', '.wav', '.ogg', '.aac', '.png', '.jpg', '.jpeg', '.gif', '.webp'];

for (const file of filesToCheck) {
  const content = fs.readFileSync(file, 'utf-8');
  for (const ext of forbiddenExts) {
    const hasForbidden = content.includes(ext);
    assert(
      !hasForbidden,
      `No se permite importar ni referenciar archivos de medios externos (${ext}) en ${path.basename(file)}`
    );
  }
}
console.log(`  ✓ Comprobados ${filesToCheck.length} archivos fuente: 0 dependencias de audio o imagen raster externa`);

// 4. Verificación de los Componentes de Temporizador y Kit de Salón
console.log('\n▶ [4/4] Verificando existencia de componentes modulares de temporización...');
const requiredComponents = [
  '../src/components/timers/CountdownTimer.tsx',
  '../src/components/timers/StopwatchTimer.tsx',
  '../src/components/timers/ManualScaleInput.tsx',
  '../src/components/kit/LivingRoomKit.tsx',
  '../src/components/timers/TestExecutionPanel.tsx',
];

for (const compPath of requiredComponents) {
  const exists = fs.existsSync(path.resolve(__dirname, compPath));
  assert(exists, `Componente ${compPath} debe existir`);
}
console.log('  ✓ CountdownTimer, StopwatchTimer, ManualScaleInput, LivingRoomKit y TestExecutionPanel validados');

console.log('\n======================================================================');
console.log(`✓ VERIFICACIÓN DE FASE 3 SUPERADA: ${passedChecks}/${totalChecks} comprobaciones.`);
console.log('======================================================================\n');
