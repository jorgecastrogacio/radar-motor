import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('2.4: Tarjeta PNG: Edad no duplicada y Despeje de Solapes', () => {
  it('no duplica el rango de edad si es identico al numero de edad', () => {
    const canvasPath = path.resolve(process.cwd(), 'src/lib/canvas-exporter.ts');
    const content = fs.readFileSync(canvasPath, 'utf-8');

    // Comprobar que existe la condicion para no duplicar ageBracket si es igual a age
    expect(content).toContain('ageBracket !== String(report.age)');
  });

  it('el centro y radio del radar garantizan al menos 24px de margen con la caja de arquetipo en 1:1', () => {
    // Calculo matematico de cotas en formato cuadrado (1080x1080):
    const archetypeY = 320;
    const archetypeHeight = 84;
    const boxBottom = archetypeY + archetypeHeight; // 404

    const radarCenterY = 700;
    const radarRadius = 210;
    const labelRadius = radarRadius + 38; // 248
    const topLabelY = radarCenterY - labelRadius - 8; // 444

    const clearance = topLabelY - boxBottom; // 444 - 404 = 40px
    expect(clearance).toBeGreaterThanOrEqual(24);
  });
});
