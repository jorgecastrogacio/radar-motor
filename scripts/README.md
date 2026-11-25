# Documentación del Script de Baremos Normativos (`scripts/build-normative-data.ts`)

## 1. Propósito
Este script genera el archivo `src/data/normative-curves.ts`, el cual contiene la matriz completa de baremos normativos para la autoevaluación motriz en Radar Motor.

## 2. Estructura de la Matriz Normativa
- **18 Pruebas biomotoras** (6 categorías x 3 pruebas).
- **22 Cortes de edad**: 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18-20, 21-30, 31-40, 41-50, 51-60, 61-64, 65-69, 70-74, 75-79, 80+.
- **2 Sexos**: Masculino (M) y Femenino (F).
- **Total de curvas normativas**: $18 \times 22 \times 2 = 792$ curvas normativas.

## 3. Modelo de Generación por Hitos (14 Key Milestones)
Cada prueba define 14 hitos de edad empíricamente anclados:
`'6', '10', '14', '17', '18-20', '21-30', '31-40', '41-50', '51-60', '61-64', '65-69', '70-74', '75-79', '80+'`

Los tramos intermedios (ej. 7, 8, 9, 11, 12, 13, 15, 16) se generan mediante interpolación lineal determinista con redondeo a un decimal.

## 4. Garantía de Monotonicidad Estricta
Cada curva generada contiene los 5 puntos clave de percentil:
- `p10`: Percentil 10
- `p25`: Percentil 25
- `zsm_min`: Límite inferior de la Zona Saludable Motriz (~p45)
- `zsm_opt`: Punto óptimo de la Zona Saludable Motriz (~p75)
- `p95`: Percentil 95

La función `enforceMonotonicity` asegura que no existan cruces ni solapes entre percentiles para pruebas donde más es mejor (`p10 < p25 < zsm_min < zsm_opt < p95`) o donde menos es mejor (`p10 > p25 > zsm_min > zsm_opt > p95`).

## 5. Verificación Binaria Byte a Byte
Se ha verificado la reproducibilidad determinista del generador:
- **Archivo de destino:** `src/data/normative-curves.ts`
- **Tamaño exacto:** 108.932 bytes
- **SHA-256:** `0115e1786001ebefe5d3cae4b55d32212ad825d2a2783b3afbbcb4a384951027`
- **Resultado de comparación:** Generando la matriz a un archivo temporal (`/tmp/normative-curves-temp.ts`), la comparación binaria byte a byte (`targetBuf.equals(tempBuf)`) resulta `true` (diferencia 0 bytes, 0 discrepancias).

## 6. Distinción Crítica: Verdad Computacional vs. Validez Científica Empírica
- **Verdad computacional:** El código del generador es 100% determinista, libre de errores de sintaxis o ejecución, y garantiza matemáticamente la monotonicidad de los 792 baremos sin cruce de percentiles ni valores nulos.
- **Validez científica empírica:** Las fuentes citadas en cabecera (Rikli & Jones SFT, Eurofit, ALPHA-Fitness, SPPB, MEXT Japón) proveen las referencias teóricas de los hitos. Sin embargo, la extrapolación e interpolación matemática a los 22 tramos continuos de edad constituye una aproximación algorítmica con fines pedagógicos y lúdicos, no una baremación médica certificada. Cualquier validación biomédica o contraste con cohortes poblacionales reales queda clasificado como pendiente de validación científica externa (ver `docs/PENDIENTES-VALIDACION.md`).
