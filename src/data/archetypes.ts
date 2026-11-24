import { AxisId, EvaluationReport } from '../types/radar-motor';

export interface MotorArchetype {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  iconName: string;
  description: string;
  strengthsText: string;
  opportunityText: string;
  dominantAxis?: AxisId;
}

export const ARCHETYPES: Record<string, MotorArchetype> = {
  radar_equilibrado: {
    id: 'radar_equilibrado',
    name: 'Radar Equilibrado',
    subtitle: 'Armonía Motriz Global',
    badge: 'Polivalente',
    iconName: 'Compass',
    description:
      'Tus capacidades motrices presentan una distribución excepcionalmente homogénea. No tienes puntos ciegos ni descompensaciones acusadas: fuerza, coordinación y equilibrio avanzan al mismo compás.',
    strengthsText:
      'Gran versatilidad física y capacidad de adaptación rápida a cualquier nuevo deporte o actividad cotidiana.',
    opportunityText:
      'Elige el eje que más disfrutes y busca un estímulo específico para transformarlo en tu superpoder motriz.',
  },
  resorte_explosivo: {
    id: 'resorte_explosivo',
    name: 'Resorte Explosivo',
    subtitle: 'Potencia en el Tren Inferior',
    badge: 'Propulsor',
    iconName: 'Zap',
    description:
      'Tus piernas son auténticos muelles. Destacas con rotundidad en la capacidad de levantarte, propulsarte y mantener el soporte antigravitatorio con una potencia destacada.',
    strengthsText:
      'Gran facilidad para subir pendientes y escaleras, caminar a ritmo vivo y responder con firmeza ante desniveles.',
    opportunityText:
      'Acompaña esa potencia inferior con movilidad articular y trabajo de core para transferir la energía sin sobrecargas.',
    dominantAxis: 'lower_body_strength',
  },
  nucleo_de_acero: {
    id: 'nucleo_de_acero',
    name: 'Núcleo de Acero',
    subtitle: 'Estabilidad Central y Tren Superior',
    badge: 'Blindado',
    iconName: 'Shield',
    description:
      'Tu zona media y tren superior conforman una estructura sólida y protectora. Transmites fuerza con seguridad y mantienes la postura corporal firme frente a la fatiga.',
    strengthsText:
      'Excelente soporte para cargar pesos domésticos, empujar con seguridad y prevenir molestias lumbares y dorsales.',
    opportunityText:
      'Combina tu solidez de tronco con ejercicios de agilidad dinámica para ganar fluidez en cambios de dirección.',
    dominantAxis: 'core_upper_strength',
  },
  equilibrista_precision: {
    id: 'equilibrista_precision',
    name: 'Equilibrista de Precisión',
    subtitle: 'Control Postural y Propiocepción',
    badge: 'Estable',
    iconName: 'Activity',
    description:
      'Tienes una finísima conexión con tus receptores propioceptivos y tu sistema vestibular. Te mantienes inalterable sobre una pierna y ajustas el centro de gravedad al milímetro.',
    strengthsText:
      'Escudo natural contra tropiezos y caídas, pisada segura y elegancia natural en el movimiento en superficies estrechas o irregulares.',
    opportunityText:
      'Añade carga de fuerza dinámica para que tu control postural se mantenga intacto en situaciones de velocidad o cansancio.',
    dominantAxis: 'balance_posture',
  },
  articulacion_elastica: {
    id: 'articulacion_elastica',
    name: 'Articulación Elástica',
    subtitle: 'Rango Articular y Flexibilidad',
    badge: 'Fluido',
    iconName: 'Feather',
    description:
      'Tus articulaciones gozan de una amplitud y libertad de movimiento envidiables. Alcanzas distancias con soltura sin tensiones parásitas ni restricciones miofasciales.',
    strengthsText:
      'Movimientos libres de rozamiento, gran capacidad para agacharte, alcanzar objetos lejanos y recuperar la postura sin rigidez.',
    opportunityText:
      'Fortalece los rangos finales de movimiento con trabajo de fuerza isométrica para proteger las articulaciones hiperflexibles.',
    dominantAxis: 'mobility_flexibility',
  },
  reflejo_veloz: {
    id: 'reflejo_veloz',
    name: 'Reflejo Veloz',
    subtitle: 'Coordinación Oculomanual y Agilidad',
    badge: 'Chispeante',
    iconName: 'Sparkles',
    description:
      'Tu sistema neuromuscular procesa estímulos visuales y cinestésicos con una rapidez asombrosa. Coordinas manos, pies y desplazamientos laterales con sincronización milimétrica.',
    strengthsText:
      'Capacidad de respuesta fulgurante ante imprevistos, destreza manual fina y soltura en juegos de pelota y ritmo.',
    opportunityText:
      'Canaliza esa velocidad con un fondo aeróbico constante para sostener tu agilidad durante periodos más prolongados.',
    dominantAxis: 'coordination_agility',
  },
  motor_diesel: {
    id: 'motor_diesel',
    name: 'Motor Incombustible',
    subtitle: 'Resistencia y Capacidad Aeróbica',
    badge: 'Incansable',
    iconName: 'Flame',
    description:
      'Posees una capacidad cardiorrespiratoria tenaz y constante. Mantienes el ritmo paso a paso sin decaer, recuperándote con celeridad tras los esfuerzos continuados.',
    strengthsText:
      'Gran reserva energética para jornadas activas, paseos largos y resistencia biológica frente a la fatiga diaria.',
    opportunityText:
      'Incorpora picos cortos de fuerza explosiva para potenciar tu zancada y complementar tu resistencia.',
    dominantAxis: 'aerobic_stability',
  },
  semilla_en_marcha: {
    id: 'semilla_en_marcha',
    name: 'Semilla en Marcha',
    subtitle: 'Máximo Potencial de Despegue',
    badge: 'Despertando',
    iconName: 'Sprout',
    description:
      'Tu radar acaba de encenderse y tiene el mayor margen de crecimiento motriz de toda la comunidad. Cada pequeño hábito activo diario va a generar una mejora exponencial visible en pocas semanas.',
    strengthsText:
      'Punto de partida ideal para redescubrir el placer del movimiento sin sobrecargas, con ganancias rápidas y motivadoras.',
    opportunityText:
      'Elige un único micro-reto diario de 2 minutos. La constancia amable es tu trampolín hacia el siguiente nivel.',
  },
};

/**
 * Determina el arquetipo motor constructivo a partir de un informe de evaluación.
 * Criterio pedagógico y motivacional 100% positivo.
 */
export function determineArchetype(report: EvaluationReport): MotorArchetype {
  // 1. Si la media global es menor a 35 puntos (con tests completados), asignar Semilla en Marcha
  if (report.completedCount > 0 && report.globalAverage < 35) {
    return ARCHETYPES.semilla_en_marcha;
  }

  // 2. Extraer puntuaciones de ejes evaluados
  const evaluatedAxes: { axisId: AxisId; score: number }[] = [];
  const axisIds: AxisId[] = [
    'lower_body_strength',
    'core_upper_strength',
    'balance_posture',
    'mobility_flexibility',
    'coordination_agility',
    'aerobic_stability',
  ];

  for (const axisId of axisIds) {
    const axisRes = report.axisResults?.[axisId];
    if (axisRes && typeof axisRes.score === 'number' && !isNaN(axisRes.score)) {
      evaluatedAxes.push({ axisId, score: axisRes.score });
    }
  }

  if (evaluatedAxes.length === 0) {
    return ARCHETYPES.semilla_en_marcha;
  }

  // 3. Evaluar dispersión (diferencia max - min)
  const scores = evaluatedAxes.map((a) => a.score);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const diff = maxScore - minScore;

  // Si todos los ejes están en una horquilla estrecha (<= 14 puntos) y la media es >= 35, es equilibrado
  if (diff <= 14 && report.globalAverage >= 35) {
    return ARCHETYPES.radar_equilibrado;
  }

  // 4. Buscar el eje con mayor puntuación
  const dominant = evaluatedAxes.reduce((best, curr) =>
    curr.score > best.score ? curr : best
  );

  switch (dominant.axisId) {
    case 'lower_body_strength':
      return ARCHETYPES.resorte_explosivo;
    case 'core_upper_strength':
      return ARCHETYPES.nucleo_de_acero;
    case 'balance_posture':
      return ARCHETYPES.equilibrista_precision;
    case 'mobility_flexibility':
      return ARCHETYPES.articulacion_elastica;
    case 'coordination_agility':
      return ARCHETYPES.reflejo_veloz;
    case 'aerobic_stability':
      return ARCHETYPES.motor_diesel;
    default:
      return ARCHETYPES.radar_equilibrado;
  }
}
