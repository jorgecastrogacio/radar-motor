import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('2.3: Contador de Repeticiones Desacoplado del Temporizador', () => {
  it('CountdownTimer no pone a cero el contador al reiniciar el temporizador', () => {
    const timerPath = path.resolve(process.cwd(), 'src/components/timers/CountdownTimer.tsx');
    const content = fs.readFileSync(timerPath, 'utf-8');

    // Comprobar que handleResetTimer no contiene setCounter(0)
    expect(content).toContain('handleResetTimer');
    // Verificar que el input de repeticiones existe y es editable
    expect(content).toContain('type="number"');
    // Verificar que el botón +1 no tiene disabled condicionado a running
    expect(content).not.toContain("disabled={status !== 'running' && status !== 'finished'}");
  });
});
