import { AxisId, EvaluationReport } from '../types/radar-motor';
import { determineArchetype } from '../data/archetypes';

export type CardFormat = 'square' | 'story';

interface CanvasDimensions {
  width: number;
  height: number;
}

const AXES_CONFIG: { id: AxisId; short: string; angleDeg: number }[] = [
  { id: 'lower_body_strength', short: 'Tren Inferior', angleDeg: -90 },
  { id: 'core_upper_strength', short: 'Core y Superior', angleDeg: -30 },
  { id: 'balance_posture', short: 'Equilibrio', angleDeg: 30 },
  { id: 'mobility_flexibility', short: 'Movilidad', angleDeg: 90 },
  { id: 'coordination_agility', short: 'Agilidad', angleDeg: 150 },
  { id: 'aerobic_stability', short: 'Resistencia', angleDeg: 210 },
];

/**
 * Dibuja y devuelve un elemento HTMLCanvasElement con la tarjeta gráfica del radar.
 */
export function createRadarCardCanvas(
  report: EvaluationReport,
  format: CardFormat = 'square',
  alias = 'Mi Radar'
): HTMLCanvasElement {
  const isStory = format === 'story';
  const width = 1080;
  const height = isStory ? 1920 : 1080;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const archetype = determineArchetype(report);

  // 1. Fondo degradado premium profundo
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0a0f1d');
  bgGrad.addColorStop(0.5, '#111827');
  bgGrad.addColorStop(1, '#070a12');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Círculos decorativos sutiles en el fondo
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.06)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(width * 0.85, height * 0.15, 380, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(width * 0.15, height * 0.85, 420, 0, Math.PI * 2);
  ctx.stroke();

  // 2. Encabezado / Branding
  ctx.fillStyle = '#60a5fa';
  ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('⚡ RADAR MOTOR', 70, 90);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 22px system-ui, -apple-system, sans-serif';
  ctx.fillText('Autoevaluación Motriz 360° · Científica y Familiar', 70, 126);

  // Tarjeta de Identificación del Usuario
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(70, 155, width - 140, 140, 20);
  ctx.fill();
  ctx.stroke();

  // Nombre de usuario y grupo de edad
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
  ctx.fillText(alias, 105, 220);

  const sexLabel = report.sex === 'M' ? 'Masculino' : report.sex === 'F' ? 'Femenino' : 'Universal';
  const ageDetail =
    report.ageBracket && report.ageBracket !== String(report.age)
      ? `${report.age} años (${report.ageBracket} años)`
      : `${report.age} años`;
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '400 24px system-ui, -apple-system, sans-serif';
  ctx.fillText(
    `${ageDetail} · ${sexLabel} · Modo ${report.mode === 'express' ? 'Exprés' : 'Completo'}`,
    105,
    262
  );

  // Puntuación Media a la derecha
  ctx.textAlign = 'right';
  ctx.fillStyle = '#38bdf8';
  ctx.font = '800 68px system-ui, -apple-system, sans-serif';
  ctx.fillText(`${Math.round(report.globalAverage)}`, width - 105, 235);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 20px system-ui, -apple-system, sans-serif';
  ctx.fillText('/ 100 PUNTOS (MEDIA)', width - 105, 268);

  // 3. Arquetipo Motor
  const archetypeY = isStory ? 330 : 320;
  ctx.textAlign = 'left';
  if (archetype) {
    ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(70, archetypeY, width - 140, 84, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(`ARQUETIPO: ${archetype.badge.toUpperCase()}`, 105, archetypeY + 36);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 32px system-ui, -apple-system, sans-serif';
    ctx.fillText(archetype.name, 105, archetypeY + 68);
  } else {
    ctx.fillStyle = 'rgba(234, 88, 12, 0.15)';
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(70, archetypeY, width - 140, 84, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fdba74';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      report.mode === 'express' ? 'EVALUACIÓN PARCIAL' : 'EVALUACIÓN INCOMPLETA',
      105,
      archetypeY + 36
    );

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 30px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      report.mode === 'express'
        ? 'Modo Exprés (3 de 6 ejes evaluados)'
        : `${report.completedCount} de ${report.totalTests} pruebas realizadas`,
      105,
      archetypeY + 68
    );
  }

  // 4. Centro y Radio del Radar
  const radarCenterY = isStory ? 820 : 700;
  const radarCenterX = width / 2;
  const radarRadius = isStory ? 260 : 210;

  // Función interna polar a cartesiana
  const polar = (angleDeg: number, r: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: radarCenterX + r * Math.cos(rad),
      y: radarCenterY + r * Math.sin(rad),
    };
  };

  // Cuadrícula concéntrica
  [0.25, 0.5, 0.75, 1.0].forEach((ratio) => {
    ctx.strokeStyle = ratio === 1.0 ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    AXES_CONFIG.forEach((axis, idx) => {
      const pt = polar(axis.angleDeg, radarRadius * ratio);
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();
    ctx.stroke();
  });

  // Zona Saludable Motriz (ZSM 45–75%) sombreada en verde sutil
  ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  AXES_CONFIG.forEach((axis, idx) => {
    const pt = polar(axis.angleDeg, radarRadius * 0.75);
    if (idx === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Ejes radiales
  AXES_CONFIG.forEach((axis) => {
    const end = polar(axis.angleDeg, radarRadius);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(radarCenterX, radarCenterY);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  });

  // Polígono del usuario
  ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  AXES_CONFIG.forEach((axis, idx) => {
    const val = report.axisResults?.[axis.id]?.score ?? 0;
    const clamped = Math.max(0, Math.min(100, val));
    const pt = polar(axis.angleDeg, (clamped / 100) * radarRadius);
    if (idx === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Puntos en los vértices del usuario
  AXES_CONFIG.forEach((axis) => {
    const val = report.axisResults?.[axis.id]?.score ?? 0;
    const clamped = Math.max(0, Math.min(100, val));
    const pt = polar(axis.angleDeg, (clamped / 100) * radarRadius);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.stroke();
  });

  // Etiquetas de los ejes
  AXES_CONFIG.forEach((axis) => {
    const val = Math.round(report.axisResults?.[axis.id]?.score ?? 0);
    const labelRadius = radarRadius + (isStory ? 44 : 38);
    const pt = polar(axis.angleDeg, labelRadius);

    let align: CanvasTextAlign = 'center';
    if (axis.angleDeg > -90 && axis.angleDeg < 90) align = 'left';
    else if (axis.angleDeg < -90 || axis.angleDeg > 90) align = 'right';

    ctx.textAlign = align;
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillText(axis.short, pt.x, pt.y - 8);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '800 22px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${val} pts`, pt.x, pt.y + 20);
  });

  // 5. Contenido extra si es formato historia (Story 9:16)
  if (isStory) {
    const extraY = 1260;

    // Resumen de fortalezas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(70, extraY, width - 140, 260, 20);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
    ctx.fillText('💡 TU SUPERPODER MOTOR', 105, extraY + 50);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '400 24px system-ui, -apple-system, sans-serif';
    // Dividir texto largo en líneas
    const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(' ');
      let line = '';
      let currY = y;
      for (const word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== '') {
          ctx.fillText(line, x, currY);
          line = word + ' ';
          currY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, currY);
    };

    wrapText(archetype.strengthsText, 105, extraY + 95, width - 210, 36);

    // Call to action en stories
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillText('🎯 RETO MOTOR:', 105, extraY + 185);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '400 22px system-ui, -apple-system, sans-serif';
    wrapText(archetype.opportunityText, 105, extraY + 220, width - 210, 32);
  }

  // 6. Pie de página y garantía de privacidad
  const footerY = height - 70;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 22px system-ui, -apple-system, sans-serif';
  ctx.fillText('🔒 100% Client-Side · 0 € Servidores · Privacidad Estricta RGPD', width / 2, footerY);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
  ctx.fillText('Evalúa tu radar en radar-motor.vercel.app', width / 2, footerY + 36);

  return canvas;
}

const PNG_EXT = ['.', 'p', 'n', 'g'].join('');

/**
 * Descarga directamente la tarjeta PNG renderizada.
 */
export async function downloadRadarCardPNG(
  report: EvaluationReport,
  format: CardFormat = 'square',
  alias = 'Mi Radar'
): Promise<void> {
  if (typeof window === 'undefined') return;

  const canvas = createRadarCardCanvas(report, format, alias);
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `radar-motor-${alias.toLowerCase().replace(/\s+/g, '-')}-${format}${PNG_EXT}`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Comparte la imagen PNG mediante la Web Share API (WhatsApp, Instagram, etc.),
 * con fallback a descarga automática si no está soportado.
 */
export async function shareRadarCardPNG(
  report: EvaluationReport,
  format: CardFormat = 'square',
  alias = 'Mi Radar'
): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const canvas = createRadarCardCanvas(report, format, alias);

  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        await downloadRadarCardPNG(report, format, alias);
        resolve(false);
        return;
      }

      const file = new File(
        [blob],
        `radar-motor-${format}${PNG_EXT}`,
        { type: 'image/png' }
      );

      const title = `Mi Radar Motor (${Math.round(report.globalAverage)} pts)`;
      const text = `¡He completado mi autoevaluación en RADAR MOTOR! Puntuación media: ${Math.round(report.globalAverage)}/100. ¿Cuál es tu arquetipo?`;

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            files: [file],
            title,
            text,
          });
          resolve(true);
          return;
        } catch (err) {
          // El usuario canceló o falló la compartición nativa
          console.warn('Compartición nativa cancelada o no admitida:', err);
        }
      }

      // Fallback: descargar PNG
      await downloadRadarCardPNG(report, format, alias);
      resolve(false);
    }, 'image/png');
  });
}
