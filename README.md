# RADAR MOTOR — Autoevaluación Motriz 360°

**RADAR MOTOR** es una aplicación web de autoevaluación física y motriz de código abierto orientada a familias, deportistas y centros educativos.

Permite evaluar 6 ejes biomotores mediante 18 pruebas estandarizadas (o un Reto Exprés de 3 pruebas) adaptadas para realizarse en el salón de casa con material doméstico y sin aparatos de gimnasio.

---

## Características Principales

- **Arquitectura 100% Client-Side:** Todo el cálculo de puntuaciones, baremos y generación de gráficos se realiza en el navegador del usuario. Cero bases de datos remotas y cumplimiento estricto del RGPD.
- **Baremos Normativos (792 curvas):** Cobertura de 6 a 80+ años dividida en 22 tramos de edad y 2 sexos, basada en baterías científicas (Eurofit, Rikli & Jones SFT, ALPHA-Fitness, SPPB y MEXT).
- **8 Arquetipos Motores y Micro-Retos:** Diagnóstico motivacional positivo y recomendaciones de hábitos activos de 2–3 minutos al día.
- **Exportación Versátil:** Generación de tarjetas PNG (1:1 y 9:16 Stories) mediante Canvas nativo, Pasaporte Familiar en PDF/A4 para imprimir y exportación de aula en CSV.
- **Desafíos P2P sin Backend:** Enlaces de reto mediante parámetros de URL con codificación segura.

---

## Modos de Uso

1. **Chequeo Completo (18 pruebas):** Evaluación exhaustiva de las 6 capacidades motrices.
2. **Reto Exprés (3 pruebas):** Evaluación rápida de agilidad, fuerza inferior y equilibrio postural (evaluación parcial sin arquetipo global asignado).
3. **Modo Familia:** Autoevaluación simultánea de hasta 4 miembros del hogar con comparador de radar.
4. **Modo Aula (`/aula`):** Evaluación ágil de grupos de estudiantes con cálculo de Zona de Salud Motriz (ZSM) y CSV.

---

## Pila Tecnológica

- **Framework:** Next.js (App Router) y React
- **Estilos:** Tailwind CSS y sistema de diseño deportivo por categorías
- **Iconografía:** Lucide React
- **Sonido:** Web Audio API sintético nativo (sin dependencias externas)
- **Testing:** Vitest

---

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Ejecutar batería de tests
npm test

# Compilar para producción
npm run build
```

---

## Aviso Legal y Pedagógico

RADAR MOTOR es una herramienta educativa y deportiva de orientación y autoevaluación motriz basada en pruebas de condición física estandarizadas. **No constituye un diagnóstico médico, clínico ni prescripción de tratamiento.** Ante cualquier duda, dolor o condición preexistente, consulta a un profesional sanitario colegiado.
