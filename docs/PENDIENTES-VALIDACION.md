# Radar Motor — Registro de Puntos Pendientes de Validación Externa

Este documento recopila de manera neutra, objetiva y trazable aquellos aspectos del currículo motriz, protocolos de ejecución y baremos de puntuación que requieren contraste con fuentes científicas primarias o validación de campo independiente antes de su certificación final.

---

## 1. Protocolos Físicos y Distancias Geométricas

### 1.1 Prueba 14: `plate_tapping_25` (Toques Alternos de Mano)
- **[CÓDIGO] Estado en el repositorio:** En `src/data/tests-catalog.ts` (líneas 383–384) se indica textualmente:
  - Línea 383 (`material`): `"Mesa con dos marcas separadas por 40 cm y un rectángulo central."`
  - Línea 384 (`homeEquivalent`): `"Dos posavasos o folios separados por el ancho de tus hombros sobre una mesa."`
- **[EXTERNO / NO VERIFICADO EN REPOSITORIO — REQUIERE FUENTE PRIMARIA]:** En el protocolo oficial de la batería Eurofit (Council of Europe, 1988), la prueba clásica de plate tapping utiliza dos discos de goma de 20 cm de diámetro con centros distanciados por 60 cm (o adaptaciones a 80 cm). Esta discrepancia métrica no se justifica ni se detalla en el repositorio.
- **Acción requerida:** Validar con fuente primaria si los 40 cm del catálogo corresponden a una adaptación ergonómica doméstica específica y, en caso de ajustarse a los 60 cm estándar de Eurofit, recalibrar los baremos normativos correspondientes.
- **Criterio de actuación aplicado:** Se mantiene la medida literal definida en el código (`40 cm`) sin alteraciones arbitrarias para preservar la integridad del test suite existente.

### 1.2 Prueba 15: `side_step_20s` (Pasos Laterales 20s)
- **[CÓDIGO] Estado en el repositorio:** En `src/data/tests-catalog.ts` (líneas 406–407) se indica textualmente:
  - Línea 406 (`material`): `"Tres referencias o líneas paralelas en el suelo separadas por 1 metro en total."`
  - Línea 407 (`homeEquivalent`): `"Marcas con cinta adhesiva de pintor o cojines situados a 1 metro de distancia."`
- **[EXTERNO / NO VERIFICADO EN REPOSITORIO — REQUIERE FUENTE PRIMARIA]:** En los protocolos oficiales japoneses de agilidad lateral referenciados como `MEXT Japan Sports Agency` (línea 400), la prueba estándar suele utilizar tres líneas separadas por 100 cm entre sí (amplitud total de 200 cm de extremo a extremo) o marcas a 120 cm. La mención a *"1 metro en total"* en el código reduce la distancia total a la mitad respecto al protocolo habitual MEXT.
- **Acción requerida:** Consultar el manual de referencia de la MEXT Sports Agency para confirmar si la versión doméstica pretende medir 100 cm entre cada línea (200 cm total) o 100 cm total (50 cm por intervalo).
- **Criterio de actuación aplicado:** Se mantiene sin alteraciones la redacción literal de `1 metro en total` hasta que el comité pedagógico aporte la fuente documental primaria.

---

## 2. Baremos Normativos y Curvas de Percentiles

### 2.1 Cobertura de las 792 Curvas Normativas
- **[CÓDIGO] Estado en el repositorio:** El archivo `src/data/normative-curves.ts` contiene 792 curvas normativas (18 pruebas $\times$ 22 cortes de edad $\times$ 2 sexos) generadas por `scripts/build-normative-data.ts`.
- **[CÓDIGO] Fuentes citadas en cabecera:**
  - Rikli & Jones Senior Fitness Test (SFT)
  - Eurofit Physical Fitness Test Battery
  - ALPHA-Fitness Battery (Helena Study)
  - Short Physical Performance Battery (SPPB)
  - MEXT Japan Sports Agency
  - Estudios de campo: Springer et al., Bennell et al., Duncan et al.
- **[EXTERNO / NO VERIFICADO EN REPOSITORIO — REQUIERE FUENTE PRIMARIA]:** La interpolación lineal entre los 14 hitos etarios clave (para cubrir todas las edades desde 6 hasta 80+ años) y la derivación de la Zona Saludable Motriz (ZSM p45–p75) son modelos matemáticos deterministas generados algorítmicamente en el repositorio. Requieren contraste empírico contra las tablas tabuladas de cada batería original para certificar su validez de constructo y significancia biomédica.

---

## 3. Criterios de Evaluación y Exclusión Clínica

### 3.1 Puntuaciones Omitidas ("No realizada / Saltar")
- **[CÓDIGO] Estado en el repositorio:** Al omitir una prueba voluntariamente o por limitación física, se asigna `rawValue: null`, `skipped: true` y una puntuación de 0 puntos en el test individual (`src/lib/scoring-engine.ts`, líneas 183–193).
- **[EXTERNO / NO VERIFICADO EN REPOSITORIO — REQUIERE FUENTE PRIMARIA]:** En la literatura de evaluación de la condición física escolar y clínica, omitir una prueba por dolor articular o contraindicación se clasifica habitualmente como "No Aplicable" (NA) y se excluye del cómputo del eje para no falsear el perfil motor como incapacidad funcional nula.
- **Acción requerida:** Evaluar con profesionales de la salud la implementación de una distinción entre "capacidad insuficiente evaluada" y "prueba contraindicada/no aplicable".

### 3.2 Asignación de Arquetipos en Evaluaciones Parciales
- **[CÓDIGO] Estado en el repositorio:** Se exige un mínimo de pruebas para asignar arquetipos. En modo exprés y en evaluaciones incompletas se devuelven perfiles parciales (`determineArchetype` retorna `null`), evitando falsas clasificaciones.
- **Acción requerida:** Validar con educadores físicos si procede definir un catálogo simplificado de perfiles para chequeos de 3 pruebas o mantener la política actual de "Evaluación Parcial (3 de 6 ejes evaluados)" sin arquetipo global.
