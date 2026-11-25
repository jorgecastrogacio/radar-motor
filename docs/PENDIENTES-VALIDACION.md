# Radar Motor — Registro de Puntos Pendientes de Validación Externa

Este documento recopila de manera neutra, objetiva y trazable aquellos aspectos del currículo motriz, protocolos de ejecución y baremos de puntuación que requieren contraste con fuentes científicas primarias o validación de campo independiente antes de su certificación final.

---

## 1. Protocolos Físicos y Distancias Geométricas

### 1.1 Prueba 14: `plate_tapping_25` (Toques Alternos de Mano)
- **Estado en código:** En `src/data/tests-catalog.ts` (línea 383-384) se indica: *"Mesa con dos marcas separadas por 40 cm y un rectángulo central"* y *"Dos posavasos o folios separados por el ancho de tus hombros"*.
- **Observación científica:** En el protocolo original de la batería Eurofit (Council of Europe, 1988), los dos discos de goma tienen 20 cm de diámetro y sus centros están distanciados 60 cm o 80 cm según la adaptación poblacional.
- **Acción pendiente:** Validación de fuente primaria sobre la distancia idónea para entorno doméstico (40 cm vs 60 cm de centro a centro) y calibración de los baremos si se modifica la distancia física.
- **Criterio de actuación:** Se mantiene la descripción literal del código actual sin alterar números ni distancias de forma arbitraria.

### 1.2 Prueba 15: `side_step_20s` (Pasos Laterales 20s)
- **Estado en código:** En `src/data/tests-catalog.ts` (línea 406-407) se indica: *"Tres referencias o líneas paralelas en el suelo separadas por 1 metro en total"*.
- **Observación científica:** En los protocolos de agilidad lateral como el MEXT (Japan Sports Agency) o tests escolares habituales, la distancia entre líneas suele ser de 100 cm entre cada línea consecutiva (ancho total de 200 cm) o 120 cm.
- **Acción pendiente:** Aclarar si la distancia se refiere a 1 metro entre marcas adyacentes o 1 metro de amplitud total de desplazamiento.
- **Criterio de actuación:** No alterar las medidas sin verificación formal con el comité pedagógico / deportivo.

---

## 2. Baremos Normativos y Curvas de Percentiles

### 2.1 Cobertura de las 792 Curvas Normativas
- **Estado en código:** El archivo `src/data/normative-curves.ts` contiene 792 curvas normativas (18 pruebas $\times$ 22 cortes de edad $\times$ 2 sexos).
- **Fuentes citadas en repositorio:**
  - Rikli & Jones Senior Fitness Test (SFT)
  - Eurofit Physical Fitness Test Battery
  - ALPHA-Fitness Battery (Helena Study)
  - Short Physical Performance Battery (SPPB)
  - MEXT Japan Sports Agency
  - Estudios de campo: Springer et al., Bennell et al., Duncan et al.
- **Acción pendiente:** Auditoría externa de validez convergente y ecológica para comprobar la correspondencia exacta entre los percentiles interpolados (6 a 80+ años) y las muestras poblacionales reales de cada estudio citado.

---

## 3. Criterios de Evaluación y Límites Clínicos

### 3.1 Puntuaciones Omitidas ("No realizada / Saltar")
- **Estado en código:** Al omitir o no poder realizar una prueba, el motor de puntuación asigna 0 puntos al test individual (`skipped: true`).
- **Consideración:** En autoevaluaciones no supervisadas, la imposibilidad de realizar una prueba (por limitación articular o dolor) debe distinguirse conceptualmente de una baja capacidad motriz condicional.
- **Acción pendiente:** Evaluar la incorporación de un estado explícito de "No aplicable por indicación médica/dolor" que excluya la prueba del denominador del eje, en lugar de puntuar 0.

### 3.2 Clasificación de Arquetipos Motores
- **Estado en código:** Se requieren pruebas completadas para asignar un arquetipo (8 arquetipos disponibles). En el Reto Exprés (3 pruebas) se muestra como "Evaluación Parcial" y no se asigna arquetipo global para evitar diagnósticos precipitados con solo 3 capacidades medidas.
- **Acción pendiente:** Validar con profesionales de la actividad física si se debe definir una familia de sub-arquetipos específicos para evaluaciones rápidas de 3 pruebas.
