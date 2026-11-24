import { AxisId, EvaluationReport } from '../types/radar-motor';

export interface MicroChallenge {
  id: string;
  axisId: AxisId;
  title: string;
  durationMinutes: number;
  description: string;
  instruction: string;
  homeTip: string;
  frequency: string;
}

export const MICRO_CHALLENGES: MicroChallenge[] = [
  // Eje 1: Tren Inferior (lower_body_strength)
  {
    id: 'mc_lower_1',
    axisId: 'lower_body_strength',
    title: 'El Levantamiento Fantasma',
    durationMinutes: 2,
    description:
      'Fortalece tus cuádriceps y glúteos eliminando el impulso pasivo al levantarte.',
    instruction:
      'Cada vez que te levantes de la silla o el sofá, levántate sin apoyar las manos en los reposabrazos ni en los muslos. Hazlo 5 veces seguidas con control.',
    homeTip: 'Mantén el pecho erguido y el peso centrado en toda la planta del pie.',
    frequency: 'En cada comida o cambio de actividad sentado',
  },
  {
    id: 'mc_lower_2',
    axisId: 'lower_body_strength',
    title: 'Puntillas del Café',
    durationMinutes: 2,
    description:
      'Activa tus gemelos y la bomba circulatoria de las piernas sin restar tiempo al día.',
    instruction:
      'Mientras se calienta el café, la leche o el té, realiza 15 elevaciones de talones lentas (2 segundos para subir, 2 para bajar).',
    homeTip: 'Puedes apoyar la yema de dos dedos en la encimera para dar seguridad.',
    frequency: 'Diario por la mañana en la cocina',
  },
  {
    id: 'mc_lower_3',
    axisId: 'lower_body_strength',
    title: 'El Puente de la Siesta',
    durationMinutes: 3,
    description:
      'Despierta la cadena posterior y protege la zona lumbar fortaleciendo glúteos.',
    instruction:
      'Tumbado boca arriba en la alfombra o cama firme, flexiona rodillas y eleva la cadera manteniendo 3 segundos arriba. Realiza 2 series de 8 repeticiones.',
    homeTip: 'Aprieta los glúteos en el punto alto sin arquear en exceso la espalda baja.',
    frequency: 'Antes de acostarte o al levantarte',
  },

  // Eje 2: Core y Tren Superior (core_upper_strength)
  {
    id: 'mc_upper_1',
    axisId: 'core_upper_strength',
    title: 'Flexión de Pasillo',
    durationMinutes: 2,
    description:
      'Estimula el empuje pectoral y la estabilidad escapular en un marco 100% regulable.',
    instruction:
      'Apoya las manos en la pared a la altura de los hombros, da un paso atrás y realiza 10 flexiones fluidas con el cuerpo en bloque.',
    homeTip: 'Cuanto más alejes los pies de la pared, mayor será la intensidad del reto.',
    frequency: 'A media mañana en cualquier pared despejada',
  },
  {
    id: 'mc_upper_2',
    axisId: 'core_upper_strength',
    title: 'El Brik de la Fuerza',
    durationMinutes: 2,
    description:
      'Tonifica bíceps y antebrazos aprovechando artículos habituales de la despensa.',
    instruction:
      'Toma un brik de leche o botella de 1L en cada mano y realiza 12 flexiones de codo controladas, manteniendo los codos pegados a las costillas.',
    homeTip: 'Exhala al subir la botella e inhala al descender en 3 segundos.',
    frequency: 'Al guardar la compra o antes de merendar',
  },
  {
    id: 'mc_upper_3',
    axisId: 'core_upper_strength',
    title: 'La Esfinge Activa',
    durationMinutes: 2,
    description:
      'Fortalece el transverso abdominal y los erectores espinales sin impacto articular.',
    instruction:
      'Apóyate sobre antebrazos y rodillas en el suelo (o sobre una mesa firme de pie si prefieres). Mantén la columna alineada durante 20 segundos con respiración fluida y continua, sin contener el aire en ningún momento.',
    homeTip: 'Imagina que quieres meter el ombligo hacia dentro para sostener la pelvis neutra.',
    frequency: '3 repeticiones de 20s con pausa intermedia',
  },

  // Eje 3: Equilibrio y Estabilidad (balance_posture)
  {
    id: 'mc_balance_1',
    axisId: 'balance_posture',
    title: 'Flamenco del Cepillo',
    durationMinutes: 2,
    description:
      'Refuerza la propiocepción del tobillo y el control monopodálico diario.',
    instruction:
      'Al lavarte los dientes, levanta un pie del suelo durante el primer minuto y cambia de pie durante el segundo minuto.',
    homeTip: 'Ten la otra mano cerca del lavabo por si necesitas rozarlo para estabilizarte.',
    frequency: 'Dos veces al día (mañana y noche)',
  },
  {
    id: 'mc_balance_2',
    axisId: 'balance_posture',
    title: 'La Cuerda Floja Doméstica',
    durationMinutes: 2,
    description:
      'Entrena el equilibrio dinámico y la alineación tándem con referencias del suelo.',
    instruction:
      'Sigue la línea recta de las baldosas o una alfombra caminando talón contra puntera durante 10 pasos hacia adelante.',
    homeTip: 'Fija la mirada en un punto al frente a la altura de los ojos, no en los pies.',
    frequency: 'Al desplazarte por el pasillo de casa',
  },
  {
    id: 'mc_balance_3',
    axisId: 'balance_posture',
    title: 'La Estatua con Ojos Guiñados',
    durationMinutes: 2,
    description:
      'Disminuye la dependencia visual y activa el sistema vestibular y táctil de la planta.',
    instruction:
      'Ponte de pie con los pies juntos. Cierra los ojos durante 15 segundos sintiendo las micropulsaciones de tus tobillos. Abre y repite 3 veces.',
    homeTip: 'Hazlo siempre con la espalda cerca de la pared o una esquina para total seguridad.',
    frequency: 'Por la tarde como pausa de descanso visual',
  },

  // Eje 4: Movilidad y Flexibilidad (mobility_flexibility)
  {
    id: 'mc_mobility_1',
    axisId: 'mobility_flexibility',
    title: 'El Saludo a la Espalda',
    durationMinutes: 2,
    description:
      'Abre la caja torácica y recupera la rotación interna y externa de hombros.',
    instruction:
      'Pasa una toalla doblada por detrás de la espalda, una mano por arriba del hombro y otra por la cintura. Camina con los dedos acercando las manos.',
    homeTip: 'No fuerces dolor; mantén una respiración amplia y relajada durante 30 segundos.',
    frequency: 'Al salir de la ducha o al terminar la jornada',
  },
  {
    id: 'mc_mobility_2',
    axisId: 'mobility_flexibility',
    title: 'Alcance Suave de Banqueta',
    durationMinutes: 3,
    description:
      'Libera la tensión en isquiotibiales y zona lumbar acumulada por el sedentarismo.',
    instruction:
      'Sentado en el borde de una silla, estira una pierna con el talón apoyado. Inclina el pecho recto hacia adelante hasta notar un estiramiento suave.',
    homeTip: 'Mantén 20 segundos por pierna sin hacer rebotes bruscos.',
    frequency: 'A mitad de mañana tras estar sentados',
  },
  {
    id: 'mc_mobility_3',
    axisId: 'mobility_flexibility',
    title: 'El Tobillo a la Pared',
    durationMinutes: 2,
    description:
      'Mejora la dorsiflexión del tobillo, clave para bajar escaleras y sentarse sin tropiezos.',
    instruction:
      'Descalzo frente a la pared a 5-8 cm, lleva la rodilla hacia la pared sin que el talón se despegue del suelo. Mantén 3 segundos y repite 8 veces.',
    homeTip: 'Asegúrate de que la rodilla avance en línea recta sobre el segundo dedo del pie.',
    frequency: 'Una vez al día con cada pie',
  },

  // Eje 5: Coordinación y Agilidad (coordination_agility)
  {
    id: 'mc_agility_1',
    axisId: 'coordination_agility',
    title: 'El Rebote de Calcetín',
    durationMinutes: 2,
    description:
      'Agiliza la respuesta óculo-manual y el cálculo de trayectoria espacial.',
    instruction:
      'Enrolla un par de calcetines en bola. Lánzalo al aire con una mano y atrápalo con la contraria 15 veces consecutivas.',
    homeTip: 'Si te resulta fácil, lanza la bola, da una palmada y atrápala antes de que caiga.',
    frequency: 'En cualquier momento de ocio en el salón',
  },
  {
    id: 'mc_agility_2',
    axisId: 'coordination_agility',
    title: 'Paso Lateral de Cojín',
    durationMinutes: 2,
    description:
      'Estimula la agilidad reactiva lateral y la transferencia de apoyos rápidos.',
    instruction:
      'Coloca un cojín plano en el suelo. Da pasos laterales pasando un pie y luego el otro por encima del cojín durante 20 segundos a ritmo alegre.',
    homeTip: 'Mantén las rodillas ligeramente desbloqueadas para amortiguar el peso.',
    frequency: 'Dos rondas de 20s con 30s de descanso',
  },
  {
    id: 'mc_agility_3',
    axisId: 'coordination_agility',
    title: 'Tambor de Dedos Alternos',
    durationMinutes: 2,
    description:
      'Ejercita la coordinación neuromuscular fina y la disociación hemisférica cerebral.',
    instruction:
      'Apoya las manos en una mesa plana y tamborilea los dedos del pulgar al meñique con la mano derecha, mientras con la izquierda vas del meñique al pulgar.',
    homeTip: 'Empieza muy lento y prioriza la precisión rítmica antes que la velocidad.',
    frequency: 'Antes de escribir o trabajar con pantallas',
  },

  // Eje 6: Resistencia y Capacidad Aeróbica (aerobic_stability)
  {
    id: 'mc_aerobic_1',
    axisId: 'aerobic_stability',
    title: 'La Marcha del Teléfono',
    durationMinutes: 3,
    description:
      'Suma pasos y activa el metabolismo aeróbico aprovechando las llamadas telefónicas.',
    instruction:
      'Siempre que hables por teléfono o escuches un audio largo, camina por la casa o marcha en el sitio elevando suavemente las rodillas.',
    homeTip: 'Mantén un ritmo donde puedas seguir hablando sin ahogarte.',
    frequency: 'En cada llamada o escucha de mensajes de voz',
  },
  {
    id: 'mc_aerobic_2',
    axisId: 'aerobic_stability',
    title: 'El Ascensor Olvidado',
    durationMinutes: 3,
    description:
      'Convierte los desplazamientos cotidianos en un estímulo cardiovascular natural.',
    instruction:
      'Sube al menos un tramo de escaleras (1 o 2 pisos) a pie cada día en lugar de tomar el ascensor, a tu propio ritmo constante.',
    homeTip: 'Usa el pasamanos con suavidad para regular el esfuerzo con seguridad.',
    frequency: 'Al regresar a casa o en el trabajo',
  },
  {
    id: 'mc_aerobic_3',
    axisId: 'aerobic_stability',
    title: 'El Minuto de Ritmo en la Silla',
    durationMinutes: 2,
    description:
      'Eleva las pulsaciones y reactiva la circulación en personas con movilidad reducida.',
    instruction:
      'Sentado erguido, realiza braceo rítmico mientras alternas toques de puntera en el suelo durante 60 segundos ininterrumpidos.',
    homeTip: 'Acompaña el ejercicio con tu canción favorita para mantener una cadencia alegre.',
    frequency: 'A mitad de tarde como estímulo energizante',
  },
];

/**
 * Obtiene los micro-retos recomendados en base a los ejes con menor puntuación.
 */
export function getRecommendedMicroChallenges(
  report: EvaluationReport,
  count = 2
): MicroChallenge[] {
  const targetAxes =
    report.lowestAxes && report.lowestAxes.length > 0
      ? report.lowestAxes
      : (['lower_body_strength', 'balance_posture'] as AxisId[]);

  const selected: MicroChallenge[] = [];

  // Buscar primer reto para el primer eje
  const scoreInt = Math.floor(Math.abs(report?.globalScore || 0));
  for (const axisId of targetAxes) {
    if (selected.length >= count) break;
    const candidates = MICRO_CHALLENGES.filter((c) => c.axisId === axisId);
    if (candidates.length > 0) {
      // Tomamos el primero o rotamos según edad/globalScore (entero)
      const index = scoreInt % candidates.length;
      const picked = candidates[index] || candidates[0];
      if (picked && !selected.some((s) => s.id === picked.id)) {
        selected.push(picked);
      }
    }
  }

  // Si aún faltan, rellenar con otros ejes
  if (selected.length < count) {
    for (const challenge of MICRO_CHALLENGES) {
      if (selected.length >= count) break;
      if (challenge && !selected.some((s) => s.id === challenge.id)) {
        selected.push(challenge);
      }
    }
  }

  return selected.filter((item): item is MicroChallenge => Boolean(item)).slice(0, count);
}
