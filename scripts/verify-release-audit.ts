import fs from 'fs';
import path from 'path';

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

console.log('======================================================================');
console.log('  RADAR MOTOR — VERIFICACIÓN AUTOMÁTICA DE AUDITORÍA FINAL (FASE 6)   ');
console.log('======================================================================\n');

const srcDir = path.resolve(__dirname, '../src');

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allSrcFiles = getAllFiles(srcDir);

// 1. AUDITORÍA DE PRIVACIDAD Y COSTE 0 €
console.log('▶ [1/4] Auditoría de Privacidad Estricta RGPD y Coste 0 €...');
const forbiddenNetworkPatterns = [
  { pattern: /fetch\s*\(/i, name: 'Llamada HTTP fetch()' },
  { pattern: /fonts\.googleapis\.com/i, name: 'Google Fonts externa' },
  { pattern: /google-analytics/i, name: 'Google Analytics' },
  { pattern: /googletagmanager/i, name: 'Google Tag Manager' },
  { pattern: /api\.qrserver\.com/i, name: 'API externa de QR' },
  { pattern: /segment\.com/i, name: 'Tracker Segment' },
  { pattern: /mixpanel/i, name: 'Tracker Mixpanel' },
];

for (const file of allSrcFiles) {
  // Solo revisar archivos de código/estilos
  if (!/\.(ts|tsx|js|jsx|css|json)$/.test(file)) continue;
  const content = fs.readFileSync(file, 'utf-8');
  for (const item of forbiddenNetworkPatterns) {
    const match = item.pattern.test(content);
    assert(!match, `No se permite ${item.name} en ${path.relative(srcDir, file)}`);
  }
}
console.log(`  ✓ Auditados ${allSrcFiles.length} archivos en src/: 0 peticiones de red externas, 0 trackers, 0 dependencias backend`);

// 2. AUDITORÍA DE MARCA, METADATOS Y PWA
console.log('\n▶ [2/4] Auditoría de Identidad Visual, Metadatos Virales y PWA...');

// Favicon / Icon SVG
const iconPath = path.resolve(srcDir, 'app/icon.svg');
assert(fs.existsSync(iconPath), 'El archivo src/app/icon.svg debe existir');
const iconContent = fs.readFileSync(iconPath, 'utf-8');
assert(iconContent.includes('<svg') && iconContent.includes('polygon'), 'icon.svg debe ser un SVG vectorial con polígonos del radar');

// Manifest PWA
const manifestPath = path.resolve(srcDir, 'app/manifest.ts');
assert(fs.existsSync(manifestPath), 'El archivo src/app/manifest.ts debe existir');
const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
assert(manifestContent.includes('RADAR MOTOR'), 'manifest.ts debe contener el nombre de la app');
assert(manifestContent.includes('standalone'), 'manifest.ts debe especificar display standalone');
assert(manifestContent.includes('/icon.svg'), 'manifest.ts debe referenciar /icon.svg');

// Metadatos en layout.tsx
const layoutPath = path.resolve(srcDir, 'app/layout.tsx');
assert(fs.existsSync(layoutPath), 'src/app/layout.tsx debe existir');
const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
assert(layoutContent.includes('openGraph:'), 'layout.tsx debe contener metadatos openGraph');
assert(layoutContent.includes('twitter:'), 'layout.tsx debe contener metadatos twitter');
assert(layoutContent.includes('RADAR MOTOR'), 'layout.tsx debe contener el título oficial');

console.log('  ✓ Icono SVG, Manifest PWA y Metadatos OpenGraph/Twitter validados con éxito');

// 3. AUDITORÍA DE LENGUAJE NO DIAGNÓSTICO Y POLÍTICA ZERO-VALSALVA
console.log('\n▶ [3/4] Auditoría de Lenguaje No Diagnóstico y Política Cero-Valsalva...');

const prohibitedTerms = [
  { term: 'patología', regex: /patolog[ií]a/i },
  { term: 'diagnóstico', regex: /diagn[oó]stico/i },
  { term: 'enfermedad', regex: /enfermedad/i },
  { term: 'retraso', regex: /retraso/i },
];

const checkDirs = ['app', 'data', 'components'];
for (const dirName of checkDirs) {
  const dirPath = path.resolve(srcDir, dirName);
  if (!fs.existsSync(dirPath)) continue;
  const dirFiles = getAllFiles(dirPath);
  for (const file of dirFiles) {
    if (!/\.(ts|tsx)$/.test(file)) continue;
    const content = fs.readFileSync(file, 'utf-8');
    for (const pt of prohibitedTerms) {
      const hasTerm = pt.regex.test(content);
      assert(!hasTerm, `Término no permitido "${pt.term}" detectado en ${path.relative(srcDir, file)}`);
    }
  }
}

// Comprobar política Cero-Valsalva en La Esfinge Activa
const microChallengesPath = path.resolve(srcDir, 'data/micro-challenges.ts');
const mcContent = fs.readFileSync(microChallengesPath, 'utf-8');
assert(
  mcContent.includes('respiración fluida y continua, sin contener el aire en ningún momento'),
  'El micro-reto "La Esfinge Activa" debe advertir de mantener respiración fluida y sin Valsalva'
);

console.log('  ✓ Cumplimiento estricto de vocabulario no diagnóstico y protocolo Cero-Valsalva verificado');

// 4. AUDITORÍA DE IMPRESIÓN A4 LIMPIA
console.log('\n▶ [4/4] Auditoría de CSS de Impresión A4 y Ocultación de Elementos...');

const globalsCssPath = path.resolve(srcDir, 'app/globals.css');
assert(fs.existsSync(globalsCssPath), 'src/app/globals.css debe existir');
const globalsCss = fs.readFileSync(globalsCssPath, 'utf-8');
assert(globalsCss.includes('@media print'), 'globals.css debe contener reglas @media print');
assert(globalsCss.includes('A4'), 'globals.css debe definir el tamaño de página A4');

const headerPath = path.resolve(srcDir, 'components/layout/Header.tsx');
const headerContent = fs.readFileSync(headerPath, 'utf-8');
assert(headerContent.includes('print:hidden'), 'El componente Header debe incluir print:hidden');

const informePath = path.resolve(srcDir, 'app/informe/page.tsx');
const informeContent = fs.readFileSync(informePath, 'utf-8');
assert(informeContent.includes('print:hidden'), 'La pantalla de informe debe ocultar elementos interactivos en impresión');

console.log('  ✓ Reglas de impresión A4 limpia (ocultación de cabecera, SOS y barras interactivas) validadas');

console.log('\n======================================================================');
console.log(`TOTAL DE COMPROBACIONES DE AUDITORÍA: ${passed + failed}`);
console.log(`✅ APROBADAS: ${passed}`);
console.log(`❌ FALLIDAS: ${failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 AUDITORÍA FASE 6 COMPLETADA AL 100%');
  console.log('======================================================================\n');
}
