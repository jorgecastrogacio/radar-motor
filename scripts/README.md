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

## 5. Verificación
El script es verificado mediante tests automatizados en `src/tests/normative-reproducibility.test.ts` que validan la existencia y estricta monotonicidad de las 792 curvas.
