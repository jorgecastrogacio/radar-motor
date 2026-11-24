export type SafetyTrafficLight = 'green' | 'amber' | 'red';

export interface SafetyQuestion {
  id: 'red_stop' | 'amber_cardiovascular' | 'amber_joint';
  level: 'red' | 'amber';
  title: string;
  question: string;
  description: string;
  recommendation: string;
}

export interface PasStep {
  step: 'P' | 'A' | 'S';
  title: string;
  action: string;
  summary: string;
  colorBg: string;
  colorBorder: string;
  colorText: string;
  badgeBg: string;
}

export interface FirstAidGuide {
  id: 'fainting' | 'injury' | 'chest_pain' | 'choking_pls';
  title: string;
  subtitle: string;
  iconName: 'Activity' | 'ShieldAlert' | 'HeartPulse' | 'LifeBuoy';
  stepsToDo: string[];
  whatNotToDo: string[];
  alarmSigns: string[];
}

export const SAFETY_QUESTIONS: SafetyQuestion[] = [
  {
    id: 'red_stop',
    level: 'red',
    title: 'Criterio de Exclusión Temporal (Stop)',
    question:
      '¿Tienes actualmente dolor u opresión en el pecho, mareos recientes, pérdida de conocimiento, falta de aire en reposo o una lesión aguda/cirugía reciente sin alta médica?',
    description:
      'Cualquier síntoma agudo o molestia cardiovascular reciente desaconseja iniciar la autoevaluación motriz en este momento.',
    recommendation:
      'Por tu bienestar y seguridad, no debes realizar las pruebas motrices en este momento. Te recomendamos consultar con tu profesional de la salud de referencia antes de reanudar cualquier actividad física.',
  },
  {
    id: 'amber_cardiovascular',
    level: 'amber',
    title: 'Precaución Cardiovascular / Medicación',
    question:
      '¿Tomas medicación para la tensión arterial o tienes alguna condición cardiovascular conocida y controlada por tu médico?',
    description:
      'La medicación o control médico previo aconseja realizar cualquier esfuerzo a un ritmo sosegado y sin apresurarse.',
    recommendation:
      'Puedes realizar la autoevaluación con prudencia y tranquilidad. Mantén un ritmo suave y cómodo, descansa entre pruebas todo el tiempo que necesites y detén el ejercicio si sientes fatiga.',
  },
  {
    id: 'amber_joint',
    level: 'amber',
    title: 'Precaución Articular y Equilibrio',
    question:
      '¿Sufres habitualmente molestias articulares moderadas (rodillas, cadera, espalda u hombros) o notas problemas de estabilidad al caminar?',
    description:
      'Las sensaciones de inestabilidad o molestias musculares aconsejan adaptar cada gesto a tu rango de movimiento seguro.',
    recommendation:
      'Adapta cada prueba a tu rango de confort sin forzar las articulaciones. Si alguna prueba te produce incomodidad, puedes saltarla sin problema o elegir el modo Express de 3 pruebas.',
  },
];

export const PAS_PROTOCOL: PasStep[] = [
  {
    step: 'P',
    title: 'PROTEGER',
    action: 'Asegura el entorno y evita nuevos percances',
    summary:
      'Comprueba que el lugar es seguro. Retira sillas, alfombras u objetos con los que la persona o tú podáis tropezar. Conserva la calma.',
    colorBg: 'bg-sky-50 dark:bg-sky-950/40',
    colorBorder: 'border-sky-200 dark:border-sky-800',
    colorText: 'text-sky-900 dark:text-sky-100',
    badgeBg: 'bg-sky-600 text-white',
  },
  {
    step: 'A',
    title: 'AVISAR',
    action: 'Llama al 112 si hay signos de alarma',
    summary:
      'Si hay pérdida de conocimiento, dolor en el pecho, desorientación o incapacidad de apoyo, avisa al 112 indicando dirección clara y estado de la persona.',
    colorBg: 'bg-amber-50 dark:bg-amber-950/40',
    colorBorder: 'border-amber-200 dark:border-amber-800',
    colorText: 'text-amber-900 dark:text-amber-100',
    badgeBg: 'bg-amber-600 text-white',
  },
  {
    step: 'S',
    title: 'SOCORRER',
    action: 'Acompaña con calma y medidas básicas',
    summary:
      'Permanece junto a la persona, háblale con tono tranquilizador, afloja prendas ajustadas y no intentes levantarla bruscamente.',
    colorBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    colorBorder: 'border-emerald-200 dark:border-emerald-800',
    colorText: 'text-emerald-900 dark:text-emerald-100',
    badgeBg: 'bg-emerald-600 text-white',
  },
];

export const FIRST_AID_GUIDES: FirstAidGuide[] = [
  {
    id: 'fainting',
    title: 'Mareo, Lipotimia o Bajada de Tensión',
    subtitle: 'Sensación de desvanecimiento, palidez súbita, sudor frío o visión nublada.',
    iconName: 'Activity',
    stepsToDo: [
      'Tumbar a la persona boca arriba sobre una superficie plana y despejada.',
      'Elevar las piernas a unos 45° (aproximadamente 30-40 cm sobre un cojín o silla) para favorecer el riego sanguíneo.',
      'Aflojar prendas ajustadas en cuello, cintura y muñecas para facilitar la respiración.',
      'Asegurar ventilación con aire fresco y acompañar a la persona hablándole con suavidad.',
    ],
    whatNotToDo: [
      'NO darle agua, comida ni bebidas con azúcar mientras esté mareada, aturdida o semiinconsciente.',
      'NO incorporarla bruscamente; cuando se recupere, debe pasar primero a sentada unos minutos.',
      'NO dejar a la persona sola durante el episodio.',
    ],
    alarmSigns: [
      'Pérdida de conocimiento que dure más de 1 minuto.',
      'Golpe directo en la cabeza al caer o dolor cervical.',
      'Dificultad para hablar, confusión mental o debilidad en un lado del cuerpo tras recuperar la conciencia.',
    ],
  },
  {
    id: 'injury',
    title: 'Caída, Golpe o Torcedura Articular',
    subtitle: 'Traumatismos leves, torceduras de tobillo, resbalones o tirones musculares.',
    iconName: 'ShieldAlert',
    stepsToDo: [
      'Suspender la actividad de inmediato y acomodar la extremidad afectada en posición de reposo.',
      'Aplicar frío local durante 10-15 minutos envolviendo SIEMPRE el hielo o la bolsa de frío en un paño o toalla.',
      'Mantener la articulación ligeramente elevada para ayudar a contener la inflamación.',
      'Facilitar apoyo y no permitir que cargue peso si hay sensación dolorosa.',
    ],
    whatNotToDo: [
      'NO poner hielo directamente sobre la piel desnuda (puede producir quemaduras por congelación).',
      'NO aplicar calor ni dar masajes enérgicos sobre la zona golpeada durante las primeras 48 horas.',
      'NO forzar la marcha ni intentar comprobar si el hueso aguanta peso si hay dolor.',
    ],
    alarmSigns: [
      'Deformidad visible en el hueso, muñeca, tobillo o rodilla.',
      'Incapacidad total e inmediata para dar cuatro pasos apoyando el pie.',
      'Golpe en la cabeza acompañado de somnolencia anormal, náuseas o vómitos.',
    ],
  },
  {
    id: 'chest_pain',
    title: 'Dolor en el Pecho o Falta de Aire Brusca',
    subtitle: 'Sensación de opresión torácica, fatiga súbita no justificada o dificultad respiratoria.',
    iconName: 'HeartPulse',
    stepsToDo: [
      'Detener en el acto cualquier esfuerzo físico en el mismo instante en que se perciba la molestia.',
      'Acomodar a la persona en posición semisentada (espalda apoyada a unos 45° y rodillas levemente flexionadas).',
      'Aflojar cuellos, corbatas, cinturones o prendas que limiten la libertad torácica.',
      'Llamar de inmediato al 112 describiendo los síntomas con precisión y calma.',
    ],
    whatNotToDo: [
      'NO dejar a la persona sola en ningún momento mientras llega la ayuda especializada.',
      'NO trasladarla en coche propio particular al hospital; es más seguro esperar a la unidad móvil del 112.',
      'NO administrar bebidas, alimentos ni fármacos por cuenta propia sin indicación directa del médico del 112.',
    ],
    alarmSigns: [
      'Dolor de tipo opresivo o sensación de peso en el centro del pecho que se extiende hacia la mandíbula, cuello, espalda o brazo izquierdo.',
      'Aparición simultánea de sudor frío profuso, mareo acusado o sensación de debilidad intensa.',
      'Dificultad acusada para respirar que persiste tras estar en reposo.',
    ],
  },
  {
    id: 'choking_pls',
    title: 'Atragantamiento (OVACE) y Posición Lateral de Seguridad (PLS)',
    subtitle: 'Manejo ante atragantamiento accidental y actuación ante persona inconsciente que respira con normalidad.',
    iconName: 'LifeBuoy',
    stepsToDo: [
      'Si la persona puede toser o hablar (atragantamiento leve): animarla con energía a seguir tosiendo con fuerza sin darle golpes en la espalda.',
      'Si no puede toser, hablar ni respirar (atragantamiento severo): inclinar su tronco hacia adelante y propinar hasta 5 palmadas firmes interescapulares con el talón de la mano.',
      'Si persiste la obstrucción: efectuar hasta 5 compresiones abdominales (maniobra de Heimlich) situando el puño cerrado entre el ombligo y el esternón y empujando hacia adentro y arriba.',
      'Si la persona queda inconsciente pero respira con normalidad: colocarla en Posición Lateral de Seguridad (PLS) para mantener la vía aérea permeable y llamar de inmediato al 112.',
    ],
    whatNotToDo: [
      'NO golpear la espalda si la persona está tosiendo de forma efectiva por sí misma (podría encajar más el objeto).',
      'NO introducir los dedos a ciegas en la garganta si no se observa claramente el objeto al alcance de la mano.',
      'NO dejar nunca a una persona inconsciente boca arriba si respira (peligro de atragantamiento por vómito o lengua).',
    ],
    alarmSigns: [
      'La persona se lleva desesperadamente ambas manos al cuello y no consigue emitir ningún sonido.',
      'Coloración azulada o violácea en labios o uñas (cianosis por falta de aire).',
      'Pérdida súbita de conocimiento (activar el 112 de urgencia e iniciar maniobras de reanimación cardiopulmonar si deja de respirar).',
    ],
  },
];
