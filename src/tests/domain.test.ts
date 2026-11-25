import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('1.5: Corrección de Dominio Oficial', () => {
  it('src/app/layout.tsx no contiene referencias a radarmotor.app y usa radar-motor.vercel.app', () => {
    const layoutPath = path.resolve(process.cwd(), 'src/app/layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf-8');
    expect(content).not.toContain('https://radarmotor.app');
    expect(content).toContain('https://radar-motor.vercel.app');
    expect(content).toContain('metadataBase');
    expect(content).toContain('canonical');
  });

  it('src/lib/canvas-exporter.ts y FamilyPassportPrint.tsx usan radar-motor.vercel.app', () => {
    const canvasPath = path.resolve(process.cwd(), 'src/lib/canvas-exporter.ts');
    const passportPath = path.resolve(process.cwd(), 'src/components/report/FamilyPassportPrint.tsx');
    
    const canvasContent = fs.readFileSync(canvasPath, 'utf-8');
    const passportContent = fs.readFileSync(passportPath, 'utf-8');

    expect(canvasContent).not.toContain('radarmotor.app');
    expect(canvasContent).toContain('radar-motor.vercel.app');

    expect(passportContent).not.toContain('radarmotor.app');
    expect(passportContent).toContain('radar-motor.vercel.app');
  });
});
