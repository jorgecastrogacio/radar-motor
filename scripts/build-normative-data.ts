import * as fs from 'fs';
import * as path from 'path';
import { AgeBracket, NormativeCurve, TestId } from '../src/types/radar-motor';
import { TESTS_CATALOG } from '../src/data/tests-catalog';

const AGE_BRACKETS: AgeBracket[] = [
  '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17',
  '18-20', '21-30', '31-40', '41-50', '51-60', '61-64', '65-69', '70-74', '75-79', '80+'
];

// Helper to interpolate between two NormativeCurves
function interpolateCurve(c1: NormativeCurve, c2: NormativeCurve, t: number): NormativeCurve {
  const round = (val: number) => Math.round(val * 10) / 10;
  return {
    p10: round(c1.p10 + (c2.p10 - c1.p10) * t),
    p25: round(c1.p25 + (c2.p25 - c1.p25) * t),
    zsm_min: round(c1.zsm_min + (c2.zsm_min - c1.zsm_min) * t),
    zsm_opt: round(c1.zsm_opt + (c2.zsm_opt - c1.zsm_opt) * t),
    p95: round(c1.p95 + (c2.p95 - c1.p95) * t),
  };
}

// Milestone age bracket map to index
// 0: '6', 4: '10', 8: '14', 11: '17', 12: '18-20', 13: '21-30', 14: '31-40',
// 15: '41-50', 16: '51-60', 17: '61-64', 18: '65-69', 19: '70-74', 20: '75-79', 21: '80+'

type KeyMilestones = {
  '6': NormativeCurve;
  '10': NormativeCurve;
  '14': NormativeCurve;
  '17': NormativeCurve;
  '18-20': NormativeCurve;
  '21-30': NormativeCurve;
  '31-40': NormativeCurve;
  '41-50': NormativeCurve;
  '51-60': NormativeCurve;
  '61-64': NormativeCurve;
  '65-69': NormativeCurve;
  '70-74': NormativeCurve;
  '75-79': NormativeCurve;
  '80+': NormativeCurve;
};

function generate22Brackets(milestones: KeyMilestones): Record<AgeBracket, NormativeCurve> {
  const result: Partial<Record<AgeBracket, NormativeCurve>> = {};

  const anchorIndices: Record<keyof KeyMilestones, number> = {
    '6': 0,
    '10': 4,
    '14': 8,
    '17': 11,
    '18-20': 12,
    '21-30': 13,
    '31-40': 14,
    '41-50': 15,
    '51-60': 16,
    '61-64': 17,
    '65-69': 18,
    '70-74': 19,
    '75-79': 20,
    '80+': 21,
  };

  const anchorKeys = Object.keys(anchorIndices) as (keyof KeyMilestones)[];

  for (let k = 0; k < anchorKeys.length - 1; k++) {
    const k1 = anchorKeys[k];
    const k2 = anchorKeys[k + 1];
    const i1 = anchorIndices[k1];
    const i2 = anchorIndices[k2];
    const c1 = milestones[k1];
    const c2 = milestones[k2];

    for (let i = i1; i <= i2; i++) {
      const bracket = AGE_BRACKETS[i];
      const t = (i - i1) / (i2 - i1);
      result[bracket] = interpolateCurve(c1, c2, t);
    }
  }

  return result as Record<AgeBracket, NormativeCurve>;
}

// Check and fix strict monotonicity if rounding caused duplicate values
function enforceMonotonicity(curve: NormativeCurve, higherIsBetter: boolean): NormativeCurve {
  const c = { ...curve };
  const minDelta = 0.5;

  if (higherIsBetter) {
    if (c.p25 <= c.p10) c.p25 = Math.round((c.p10 + minDelta) * 10) / 10;
    if (c.zsm_min <= c.p25) c.zsm_min = Math.round((c.p25 + minDelta) * 10) / 10;
    if (c.zsm_opt <= c.zsm_min) c.zsm_opt = Math.round((c.zsm_min + minDelta) * 10) / 10;
    if (c.p95 <= c.zsm_opt) c.p95 = Math.round((c.zsm_opt + minDelta) * 10) / 10;
  } else {
    // lower is better: p10 > p25 > zsm_min > zsm_opt > p95
    if (c.p25 >= c.p10) c.p25 = Math.round((c.p10 - minDelta) * 10) / 10;
    if (c.zsm_min >= c.p25) c.zsm_min = Math.round((c.p25 - minDelta) * 10) / 10;
    if (c.zsm_opt >= c.zsm_min) c.zsm_opt = Math.round((c.zsm_min - minDelta) * 10) / 10;
    if (c.p95 >= c.zsm_opt) c.p95 = Math.round((c.zsm_opt - minDelta) * 10) / 10;
  }
  return c;
}

// Define milestone data for all 18 tests for M and F
const TEST_MILESTONES: Record<TestId, { M: KeyMilestones; F: KeyMilestones }> = {
  chair_stand_30s: {
    M: {
      '6':     { p10: 10, p25: 12, zsm_min: 15, zsm_opt: 18, p95: 23 },
      '10':    { p10: 13, p25: 16, zsm_min: 19, zsm_opt: 23, p95: 28 },
      '14':    { p10: 16, p25: 19, zsm_min: 23, zsm_opt: 27, p95: 33 },
      '17':    { p10: 18, p25: 21, zsm_min: 25, zsm_opt: 29, p95: 35 },
      '18-20': { p10: 18, p25: 21, zsm_min: 25, zsm_opt: 29, p95: 36 },
      '21-30': { p10: 18, p25: 21, zsm_min: 25, zsm_opt: 29, p95: 36 },
      '31-40': { p10: 17, p25: 20, zsm_min: 24, zsm_opt: 28, p95: 34 },
      '41-50': { p10: 15, p25: 18, zsm_min: 22, zsm_opt: 26, p95: 31 },
      '51-60': { p10: 13, p25: 16, zsm_min: 19, zsm_opt: 23, p95: 28 },
      '61-64': { p10: 12, p25: 14, zsm_min: 17, zsm_opt: 20, p95: 25 },
      '65-69': { p10: 11, p25: 13, zsm_min: 16, zsm_opt: 19, p95: 23 },
      '70-74': { p10: 10, p25: 12, zsm_min: 14, zsm_opt: 17, p95: 21 },
      '75-79': { p10: 8,  p25: 10, zsm_min: 13, zsm_opt: 16, p95: 19 },
      '80+':   { p10: 7,  p25: 9,  zsm_min: 11, zsm_opt: 14, p95: 17 },
    },
    F: {
      '6':     { p10: 10, p25: 12, zsm_min: 15, zsm_opt: 18, p95: 23 },
      '10':    { p10: 13, p25: 16, zsm_min: 19, zsm_opt: 22, p95: 27 },
      '14':    { p10: 15, p25: 18, zsm_min: 21, zsm_opt: 25, p95: 30 },
      '17':    { p10: 16, p25: 19, zsm_min: 23, zsm_opt: 27, p95: 33 },
      '18-20': { p10: 16, p25: 19, zsm_min: 23, zsm_opt: 27, p95: 33 },
      '21-30': { p10: 16, p25: 19, zsm_min: 23, zsm_opt: 27, p95: 33 },
      '31-40': { p10: 15, p25: 18, zsm_min: 22, zsm_opt: 26, p95: 31 },
      '41-50': { p10: 14, p25: 17, zsm_min: 20, zsm_opt: 24, p95: 29 },
      '51-60': { p10: 12, p25: 15, zsm_min: 18, zsm_opt: 21, p95: 26 },
      '61-64': { p10: 11, p25: 13, zsm_min: 16, zsm_opt: 19, p95: 23 },
      '65-69': { p10: 10, p25: 12, zsm_min: 15, zsm_opt: 18, p95: 22 },
      '70-74': { p10: 9,  p25: 11, zsm_min: 13, zsm_opt: 16, p95: 20 },
      '75-79': { p10: 8,  p25: 10, zsm_min: 12, zsm_opt: 15, p95: 18 },
      '80+':   { p10: 6,  p25: 8,  zsm_min: 10, zsm_opt: 13, p95: 16 },
    },
  },

  sit_to_stand_5x: {
    M: {
      '6':     { p10: 13.5, p25: 11.5, zsm_min: 9.8,  zsm_opt: 8.2,  p95: 6.5 },
      '10':    { p10: 11.2, p25: 9.5,  zsm_min: 8.0,  zsm_opt: 6.7,  p95: 5.3 },
      '14':    { p10: 10.2, p25: 8.6,  zsm_min: 7.2,  zsm_opt: 5.9,  p95: 4.7 },
      '17':    { p10: 9.6,  p25: 8.1,  zsm_min: 6.7,  zsm_opt: 5.4,  p95: 4.4 },
      '18-20': { p10: 9.6,  p25: 8.1,  zsm_min: 6.7,  zsm_opt: 5.4,  p95: 4.4 },
      '21-30': { p10: 9.8,  p25: 8.2,  zsm_min: 6.8,  zsm_opt: 5.5,  p95: 4.5 },
      '31-40': { p10: 10.5, p25: 8.8,  zsm_min: 7.4,  zsm_opt: 6.1,  p95: 5.0 },
      '41-50': { p10: 11.5, p25: 9.7,  zsm_min: 8.2,  zsm_opt: 6.8,  p95: 5.5 },
      '51-60': { p10: 12.8, p25: 10.8, zsm_min: 9.2,  zsm_opt: 7.6,  p95: 6.1 },
      '61-64': { p10: 13.6, p25: 11.5, zsm_min: 9.8,  zsm_opt: 8.1,  p95: 6.5 },
      '65-69': { p10: 14.5, p25: 12.2, zsm_min: 10.5, zsm_opt: 8.7,  p95: 7.0 },
      '70-74': { p10: 15.5, p25: 13.0, zsm_min: 11.2, zsm_opt: 9.2,  p95: 7.4 },
      '75-79': { p10: 17.5, p25: 14.8, zsm_min: 12.5, zsm_opt: 10.4, p95: 8.2 },
      '80+':   { p10: 19.5, p25: 16.5, zsm_min: 14.0, zsm_opt: 11.5, p95: 9.0 },
    },
    F: {
      '6':     { p10: 13.5, p25: 11.5, zsm_min: 9.8,  zsm_opt: 8.2,  p95: 6.5 },
      '10':    { p10: 11.4, p25: 9.7,  zsm_min: 8.2,  zsm_opt: 6.9,  p95: 5.5 },
      '14':    { p10: 10.6, p25: 9.0,  zsm_min: 7.5,  zsm_opt: 6.2,  p95: 5.0 },
      '17':    { p10: 10.2, p25: 8.6,  zsm_min: 7.2,  zsm_opt: 5.8,  p95: 4.8 },
      '18-20': { p10: 10.2, p25: 8.6,  zsm_min: 7.2,  zsm_opt: 5.8,  p95: 4.8 },
      '21-30': { p10: 10.4, p25: 8.8,  zsm_min: 7.4,  zsm_opt: 6.0,  p95: 4.9 },
      '31-40': { p10: 11.0, p25: 9.3,  zsm_min: 7.9,  zsm_opt: 6.5,  p95: 5.3 },
      '41-50': { p10: 12.2, p25: 10.3, zsm_min: 8.7,  zsm_opt: 7.2,  p95: 5.8 },
      '51-60': { p10: 13.5, p25: 11.4, zsm_min: 9.7,  zsm_opt: 8.0,  p95: 6.4 },
      '61-64': { p10: 14.5, p25: 12.2, zsm_min: 10.4, zsm_opt: 8.6,  p95: 6.9 },
      '65-69': { p10: 15.5, p25: 13.0, zsm_min: 11.2, zsm_opt: 9.2,  p95: 7.4 },
      '70-74': { p10: 16.5, p25: 13.8, zsm_min: 11.8, zsm_opt: 9.8,  p95: 7.8 },
      '75-79': { p10: 18.5, p25: 15.5, zsm_min: 13.2, zsm_opt: 11.0, p95: 8.8 },
      '80+':   { p10: 21.0, p25: 17.5, zsm_min: 14.8, zsm_opt: 12.2, p95: 9.6 },
    },
  },

  calf_raise_30s: {
    M: {
      '6':     { p10: 12, p25: 15, zsm_min: 19, zsm_opt: 23, p95: 28 },
      '10':    { p10: 16, p25: 20, zsm_min: 24, zsm_opt: 28, p95: 34 },
      '14':    { p10: 19, p25: 23, zsm_min: 27, zsm_opt: 32, p95: 39 },
      '17':    { p10: 22, p25: 26, zsm_min: 30, zsm_opt: 35, p95: 42 },
      '18-20': { p10: 22, p25: 26, zsm_min: 30, zsm_opt: 35, p95: 42 },
      '21-30': { p10: 22, p25: 26, zsm_min: 30, zsm_opt: 35, p95: 42 },
      '31-40': { p10: 20, p25: 24, zsm_min: 28, zsm_opt: 33, p95: 40 },
      '41-50': { p10: 18, p25: 22, zsm_min: 26, zsm_opt: 31, p95: 37 },
      '51-60': { p10: 16, p25: 19, zsm_min: 23, zsm_opt: 28, p95: 34 },
      '61-64': { p10: 15, p25: 18, zsm_min: 22, zsm_opt: 26, p95: 32 },
      '65-69': { p10: 14, p25: 17, zsm_min: 21, zsm_opt: 25, p95: 30 },
      '70-74': { p10: 12, p25: 15, zsm_min: 18, zsm_opt: 22, p95: 27 },
      '75-79': { p10: 10, p25: 13, zsm_min: 16, zsm_opt: 20, p95: 25 },
      '80+':   { p10: 8,  p25: 11, zsm_min: 14, zsm_opt: 17, p95: 22 },
    },
    F: {
      '6':     { p10: 12, p25: 15, zsm_min: 19, zsm_opt: 23, p95: 28 },
      '10':    { p10: 16, p25: 19, zsm_min: 23, zsm_opt: 27, p95: 33 },
      '14':    { p10: 18, p25: 22, zsm_min: 26, zsm_opt: 30, p95: 37 },
      '17':    { p10: 20, p25: 24, zsm_min: 28, zsm_opt: 33, p95: 40 },
      '18-20': { p10: 20, p25: 24, zsm_min: 28, zsm_opt: 33, p95: 40 },
      '21-30': { p10: 20, p25: 24, zsm_min: 28, zsm_opt: 33, p95: 40 },
      '31-40': { p10: 19, p25: 23, zsm_min: 27, zsm_opt: 32, p95: 38 },
      '41-50': { p10: 17, p25: 21, zsm_min: 25, zsm_opt: 30, p95: 36 },
      '51-60': { p10: 15, p25: 18, zsm_min: 22, zsm_opt: 26, p95: 32 },
      '61-64': { p10: 14, p25: 17, zsm_min: 21, zsm_opt: 25, p95: 30 },
      '65-69': { p10: 13, p25: 16, zsm_min: 20, zsm_opt: 24, p95: 29 },
      '70-74': { p10: 11, p25: 14, zsm_min: 17, zsm_opt: 21, p95: 26 },
      '75-79': { p10: 9,  p25: 12, zsm_min: 15, zsm_opt: 19, p95: 23 },
      '80+':   { p10: 7,  p25: 10, zsm_min: 13, zsm_opt: 16, p95: 21 },
    },
  },

  glute_bridge_30s: {
    M: {
      '6':     { p10: 11, p25: 13, zsm_min: 16, zsm_opt: 19, p95: 24 },
      '10':    { p10: 14, p25: 17, zsm_min: 20, zsm_opt: 24, p95: 29 },
      '14':    { p10: 16, p25: 19, zsm_min: 23, zsm_opt: 27, p95: 33 },
      '17':    { p10: 18, p25: 21, zsm_min: 25, zsm_opt: 29, p95: 35 },
      '18-20': { p10: 18, p25: 21, zsm_min: 25, zsm_opt: 29, p95: 35 },
      '21-30': { p10: 18, p25: 21, zsm_min: 25, zsm_opt: 29, p95: 35 },
      '31-40': { p10: 17, p25: 20, zsm_min: 24, zsm_opt: 28, p95: 33 },
      '41-50': { p10: 15, p25: 18, zsm_min: 22, zsm_opt: 26, p95: 31 },
      '51-60': { p10: 13, p25: 16, zsm_min: 19, zsm_opt: 23, p95: 28 },
      '61-64': { p10: 12, p25: 14, zsm_min: 17, zsm_opt: 21, p95: 25 },
      '65-69': { p10: 11, p25: 13, zsm_min: 16, zsm_opt: 19, p95: 23 },
      '70-74': { p10: 9,  p25: 11, zsm_min: 14, zsm_opt: 17, p95: 21 },
      '75-79': { p10: 7,  p25: 9,  zsm_min: 12, zsm_opt: 15, p95: 19 },
      '80+':   { p10: 6,  p25: 8,  zsm_min: 11, zsm_opt: 14, p95: 18 },
    },
    F: {
      '6':     { p10: 11, p25: 13, zsm_min: 16, zsm_opt: 19, p95: 24 },
      '10':    { p10: 14, p25: 17, zsm_min: 20, zsm_opt: 24, p95: 29 },
      '14':    { p10: 16, p25: 19, zsm_min: 23, zsm_opt: 27, p95: 33 },
      '17':    { p10: 18, p25: 21, zsm_min: 25, zsm_opt: 29, p95: 35 },
      '18-20': { p10: 18, p25: 21, zsm_min: 25, zsm_opt: 29, p95: 35 },
      '21-30': { p10: 18, p25: 21, zsm_min: 25, zsm_opt: 29, p95: 35 },
      '31-40': { p10: 17, p25: 20, zsm_min: 24, zsm_opt: 28, p95: 33 },
      '41-50': { p10: 15, p25: 18, zsm_min: 22, zsm_opt: 26, p95: 31 },
      '51-60': { p10: 13, p25: 16, zsm_min: 19, zsm_opt: 23, p95: 28 },
      '61-64': { p10: 12, p25: 14, zsm_min: 17, zsm_opt: 21, p95: 25 },
      '65-69': { p10: 11, p25: 13, zsm_min: 16, zsm_opt: 19, p95: 23 },
      '70-74': { p10: 9,  p25: 11, zsm_min: 14, zsm_opt: 17, p95: 21 },
      '75-79': { p10: 7,  p25: 9,  zsm_min: 12, zsm_opt: 15, p95: 19 },
      '80+':   { p10: 6,  p25: 8,  zsm_min: 11, zsm_opt: 14, p95: 18 },
    },
  },

  wall_pushups_30s: {
    M: {
      '6':     { p10: 11, p25: 14, zsm_min: 17, zsm_opt: 21, p95: 26 },
      '10':    { p10: 15, p25: 18, zsm_min: 22, zsm_opt: 26, p95: 32 },
      '14':    { p10: 19, p25: 23, zsm_min: 28, zsm_opt: 33, p95: 39 },
      '17':    { p10: 23, p25: 27, zsm_min: 32, zsm_opt: 37, p95: 44 },
      '18-20': { p10: 23, p25: 27, zsm_min: 32, zsm_opt: 37, p95: 44 },
      '21-30': { p10: 23, p25: 27, zsm_min: 32, zsm_opt: 37, p95: 44 },
      '31-40': { p10: 21, p25: 25, zsm_min: 30, zsm_opt: 35, p95: 41 },
      '41-50': { p10: 19, p25: 22, zsm_min: 27, zsm_opt: 32, p95: 38 },
      '51-60': { p10: 16, p25: 19, zsm_min: 23, zsm_opt: 28, p95: 34 },
      '61-64': { p10: 14, p25: 17, zsm_min: 21, zsm_opt: 25, p95: 31 },
      '65-69': { p10: 12, p25: 15, zsm_min: 19, zsm_opt: 23, p95: 28 },
      '70-74': { p10: 11, p25: 14, zsm_min: 17, zsm_opt: 21, p95: 26 },
      '75-79': { p10: 9,  p25: 12, zsm_min: 15, zsm_opt: 19, p95: 24 },
      '80+':   { p10: 8,  p25: 11, zsm_min: 14, zsm_opt: 18, p95: 23 },
    },
    F: {
      '6':     { p10: 11, p25: 14, zsm_min: 17, zsm_opt: 21, p95: 26 },
      '10':    { p10: 14, p25: 17, zsm_min: 21, zsm_opt: 25, p95: 30 },
      '14':    { p10: 16, p25: 20, zsm_min: 24, zsm_opt: 29, p95: 35 },
      '17':    { p10: 19, p25: 23, zsm_min: 27, zsm_opt: 32, p95: 38 },
      '18-20': { p10: 19, p25: 23, zsm_min: 27, zsm_opt: 32, p95: 38 },
      '21-30': { p10: 19, p25: 23, zsm_min: 27, zsm_opt: 32, p95: 38 },
      '31-40': { p10: 18, p25: 21, zsm_min: 25, zsm_opt: 30, p95: 36 },
      '41-50': { p10: 16, p25: 19, zsm_min: 23, zsm_opt: 28, p95: 33 },
      '51-60': { p10: 14, p25: 17, zsm_min: 20, zsm_opt: 25, p95: 30 },
      '61-64': { p10: 12, p25: 15, zsm_min: 18, zsm_opt: 22, p95: 27 },
      '65-69': { p10: 11, p25: 14, zsm_min: 17, zsm_opt: 21, p95: 25 },
      '70-74': { p10: 9,  p25: 12, zsm_min: 15, zsm_opt: 18, p95: 23 },
      '75-79': { p10: 8,  p25: 11, zsm_min: 14, zsm_opt: 17, p95: 22 },
      '80+':   { p10: 7,  p25: 10, zsm_min: 13, zsm_opt: 16, p95: 21 },
    },
  },

  arm_curl_1l_30s: {
    M: {
      '6':     { p10: 12, p25: 15, zsm_min: 18, zsm_opt: 22, p95: 27 },
      '10':    { p10: 15, p25: 18, zsm_min: 22, zsm_opt: 26, p95: 32 },
      '14':    { p10: 19, p25: 23, zsm_min: 27, zsm_opt: 32, p95: 38 },
      '17':    { p10: 22, p25: 26, zsm_min: 30, zsm_opt: 35, p95: 42 },
      '18-20': { p10: 22, p25: 26, zsm_min: 30, zsm_opt: 35, p95: 42 },
      '21-30': { p10: 22, p25: 26, zsm_min: 30, zsm_opt: 35, p95: 42 },
      '31-40': { p10: 21, p25: 25, zsm_min: 29, zsm_opt: 34, p95: 40 },
      '41-50': { p10: 19, p25: 23, zsm_min: 27, zsm_opt: 32, p95: 38 },
      '51-60': { p10: 17, p25: 20, zsm_min: 24, zsm_opt: 29, p95: 35 },
      '61-64': { p10: 15, p25: 18, zsm_min: 22, zsm_opt: 26, p95: 32 },
      '65-69': { p10: 14, p25: 17, zsm_min: 20, zsm_opt: 25, p95: 30 },
      '70-74': { p10: 12, p25: 15, zsm_min: 18, zsm_opt: 23, p95: 28 },
      '75-79': { p10: 11, p25: 14, zsm_min: 17, zsm_opt: 21, p95: 26 },
      '80+':   { p10: 10, p25: 13, zsm_min: 16, zsm_opt: 20, p95: 25 },
    },
    F: {
      '6':     { p10: 12, p25: 15, zsm_min: 18, zsm_opt: 22, p95: 27 },
      '10':    { p10: 15, p25: 18, zsm_min: 21, zsm_opt: 25, p95: 30 },
      '14':    { p10: 17, p25: 21, zsm_min: 25, zsm_opt: 29, p95: 35 },
      '17':    { p10: 20, p25: 24, zsm_min: 28, zsm_opt: 33, p95: 40 },
      '18-20': { p10: 20, p25: 24, zsm_min: 28, zsm_opt: 33, p95: 40 },
      '21-30': { p10: 20, p25: 24, zsm_min: 28, zsm_opt: 33, p95: 40 },
      '31-40': { p10: 19, p25: 23, zsm_min: 27, zsm_opt: 32, p95: 38 },
      '41-50': { p10: 17, p25: 21, zsm_min: 25, zsm_opt: 30, p95: 36 },
      '51-60': { p10: 15, p25: 18, zsm_min: 22, zsm_opt: 26, p95: 32 },
      '61-64': { p10: 14, p25: 17, zsm_min: 20, zsm_opt: 24, p95: 29 },
      '65-69': { p10: 13, p25: 16, zsm_min: 19, zsm_opt: 23, p95: 28 },
      '70-74': { p10: 11, p25: 14, zsm_min: 17, zsm_opt: 21, p95: 26 },
      '75-79': { p10: 10, p25: 13, zsm_min: 16, zsm_opt: 19, p95: 24 },
      '80+':   { p10: 9,  p25: 12, zsm_min: 15, zsm_opt: 18, p95: 23 },
    },
  },

  monopodal_open: {
    M: {
      '6':     { p10: 5,  p25: 9,  zsm_min: 14, zsm_opt: 20, p95: 30 },
      '10':    { p10: 16, p25: 24, zsm_min: 32, zsm_opt: 38, p95: 44 },
      '14':    { p10: 24, p25: 32, zsm_min: 38, zsm_opt: 42, p95: 45 },
      '17':    { p10: 28, p25: 36, zsm_min: 41, zsm_opt: 43, p95: 45 },
      '18-20': { p10: 28, p25: 36, zsm_min: 41, zsm_opt: 43, p95: 45 },
      '21-30': { p10: 28, p25: 36, zsm_min: 41, zsm_opt: 43, p95: 45 },
      '31-40': { p10: 25, p25: 34, zsm_min: 40, zsm_opt: 43, p95: 45 },
      '41-50': { p10: 21, p25: 30, zsm_min: 37, zsm_opt: 41, p95: 45 },
      '51-60': { p10: 15, p25: 24, zsm_min: 32, zsm_opt: 38, p95: 44 },
      '61-64': { p10: 11, p25: 18, zsm_min: 26, zsm_opt: 34, p95: 42 },
      '65-69': { p10: 8,  p25: 14, zsm_min: 21, zsm_opt: 29, p95: 38 },
      '70-74': { p10: 5,  p25: 10, zsm_min: 16, zsm_opt: 23, p95: 33 },
      '75-79': { p10: 3,  p25: 7,  zsm_min: 12, zsm_opt: 18, p95: 26 },
      '80+':   { p10: 2,  p25: 4,  zsm_min: 8,  zsm_opt: 13, p95: 20 },
    },
    F: {
      '6':     { p10: 6,  p25: 10, zsm_min: 16, zsm_opt: 22, p95: 32 },
      '10':    { p10: 18, p25: 26, zsm_min: 34, zsm_opt: 40, p95: 45 },
      '14':    { p10: 25, p25: 33, zsm_min: 39, zsm_opt: 42, p95: 45 },
      '17':    { p10: 28, p25: 36, zsm_min: 41, zsm_opt: 43, p95: 45 },
      '18-20': { p10: 28, p25: 36, zsm_min: 41, zsm_opt: 43, p95: 45 },
      '21-30': { p10: 28, p25: 36, zsm_min: 41, zsm_opt: 43, p95: 45 },
      '31-40': { p10: 25, p25: 34, zsm_min: 40, zsm_opt: 43, p95: 45 },
      '41-50': { p10: 21, p25: 30, zsm_min: 37, zsm_opt: 41, p95: 45 },
      '51-60': { p10: 15, p25: 24, zsm_min: 32, zsm_opt: 38, p95: 44 },
      '61-64': { p10: 11, p25: 18, zsm_min: 26, zsm_opt: 34, p95: 42 },
      '65-69': { p10: 8,  p25: 14, zsm_min: 21, zsm_opt: 29, p95: 38 },
      '70-74': { p10: 5,  p25: 10, zsm_min: 16, zsm_opt: 23, p95: 33 },
      '75-79': { p10: 3,  p25: 7,  zsm_min: 12, zsm_opt: 18, p95: 26 },
      '80+':   { p10: 2,  p25: 4,  zsm_min: 8,  zsm_opt: 13, p95: 20 },
    },
  },

  tandem_stance_open: {
    M: {
      '6':     { p10: 12, p25: 18, zsm_min: 25, zsm_opt: 32, p95: 40 },
      '10':    { p10: 24, p25: 32, zsm_min: 38, zsm_opt: 42, p95: 45 },
      '14':    { p10: 32, p25: 38, zsm_min: 41, zsm_opt: 43, p95: 45 },
      '17':    { p10: 35, p25: 40, zsm_min: 42, zsm_opt: 44, p95: 45 },
      '18-20': { p10: 35, p25: 40, zsm_min: 42, zsm_opt: 44, p95: 45 },
      '21-30': { p10: 35, p25: 40, zsm_min: 42, zsm_opt: 44, p95: 45 },
      '31-40': { p10: 33, p25: 39, zsm_min: 42, zsm_opt: 44, p95: 45 },
      '41-50': { p10: 29, p25: 36, zsm_min: 40, zsm_opt: 43, p95: 45 },
      '51-60': { p10: 23, p25: 31, zsm_min: 37, zsm_opt: 41, p95: 45 },
      '61-64': { p10: 18, p25: 26, zsm_min: 33, zsm_opt: 39, p95: 44 },
      '65-69': { p10: 15, p25: 23, zsm_min: 30, zsm_opt: 38, p95: 44 },
      '70-74': { p10: 11, p25: 18, zsm_min: 25, zsm_opt: 33, p95: 42 },
      '75-79': { p10: 7,  p25: 13, zsm_min: 20, zsm_opt: 28, p95: 38 },
      '80+':   { p10: 4,  p25: 8,  zsm_min: 14, zsm_opt: 21, p95: 30 },
    },
    F: {
      '6':     { p10: 14, p25: 20, zsm_min: 27, zsm_opt: 34, p95: 42 },
      '10':    { p10: 26, p25: 34, zsm_min: 39, zsm_opt: 43, p95: 45 },
      '14':    { p10: 33, p25: 39, zsm_min: 41, zsm_opt: 43, p95: 45 },
      '17':    { p10: 35, p25: 40, zsm_min: 42, zsm_opt: 44, p95: 45 },
      '18-20': { p10: 35, p25: 40, zsm_min: 42, zsm_opt: 44, p95: 45 },
      '21-30': { p10: 35, p25: 40, zsm_min: 42, zsm_opt: 44, p95: 45 },
      '31-40': { p10: 33, p25: 39, zsm_min: 42, zsm_opt: 44, p95: 45 },
      '41-50': { p10: 29, p25: 36, zsm_min: 40, zsm_opt: 43, p95: 45 },
      '51-60': { p10: 23, p25: 31, zsm_min: 37, zsm_opt: 41, p95: 45 },
      '61-64': { p10: 18, p25: 26, zsm_min: 33, zsm_opt: 39, p95: 44 },
      '65-69': { p10: 15, p25: 23, zsm_min: 30, zsm_opt: 38, p95: 44 },
      '70-74': { p10: 11, p25: 18, zsm_min: 25, zsm_opt: 33, p95: 42 },
      '75-79': { p10: 7,  p25: 13, zsm_min: 20, zsm_opt: 28, p95: 38 },
      '80+':   { p10: 4,  p25: 8,  zsm_min: 14, zsm_opt: 21, p95: 30 },
    },
  },

  tandem_walk_3m: {
    M: {
      '6':     { p10: 11.2, p25: 9.4,  zsm_min: 8.0,  zsm_opt: 6.8, p95: 5.2 },
      '10':    { p10: 8.8,  p25: 7.4,  zsm_min: 6.3,  zsm_opt: 5.3, p95: 4.1 },
      '14':    { p10: 7.6,  p25: 6.3,  zsm_min: 5.3,  zsm_opt: 4.4, p95: 3.4 },
      '17':    { p10: 6.8,  p25: 5.6,  zsm_min: 4.8,  zsm_opt: 4.0, p95: 3.1 },
      '18-20': { p10: 6.8,  p25: 5.6,  zsm_min: 4.8,  zsm_opt: 4.0, p95: 3.1 },
      '21-30': { p10: 6.8,  p25: 5.6,  zsm_min: 4.8,  zsm_opt: 4.0, p95: 3.1 },
      '31-40': { p10: 7.2,  p25: 6.0,  zsm_min: 5.1,  zsm_opt: 4.2, p95: 3.3 },
      '41-50': { p10: 7.8,  p25: 6.5,  zsm_min: 5.5,  zsm_opt: 4.5, p95: 3.5 },
      '51-60': { p10: 8.6,  p25: 7.2,  zsm_min: 6.1,  zsm_opt: 5.0, p95: 3.9 },
      '61-64': { p10: 9.5,  p25: 8.0,  zsm_min: 6.8,  zsm_opt: 5.6, p95: 4.3 },
      '65-69': { p10: 10.5, p25: 8.8,  zsm_min: 7.4,  zsm_opt: 6.2, p95: 4.8 },
      '70-74': { p10: 11.5, p25: 9.6,  zsm_min: 8.1,  zsm_opt: 6.8, p95: 5.2 },
      '75-79': { p10: 13.5, p25: 11.2, zsm_min: 9.5,  zsm_opt: 7.9, p95: 6.1 },
      '80+':   { p10: 15.5, p25: 13.0, zsm_min: 11.0, zsm_opt: 9.2, p95: 7.2 },
    },
    F: {
      '6':     { p10: 11.2, p25: 9.4,  zsm_min: 8.0,  zsm_opt: 6.8, p95: 5.2 },
      '10':    { p10: 8.8,  p25: 7.4,  zsm_min: 6.3,  zsm_opt: 5.3, p95: 4.1 },
      '14':    { p10: 7.8,  p25: 6.5,  zsm_min: 5.5,  zsm_opt: 4.5, p95: 3.5 },
      '17':    { p10: 7.0,  p25: 5.8,  zsm_min: 4.9,  zsm_opt: 4.1, p95: 3.2 },
      '18-20': { p10: 7.0,  p25: 5.8,  zsm_min: 4.9,  zsm_opt: 4.1, p95: 3.2 },
      '21-30': { p10: 7.0,  p25: 5.8,  zsm_min: 4.9,  zsm_opt: 4.1, p95: 3.2 },
      '31-40': { p10: 7.4,  p25: 6.2,  zsm_min: 5.2,  zsm_opt: 4.3, p95: 3.4 },
      '41-50': { p10: 8.0,  p25: 6.7,  zsm_min: 5.7,  zsm_opt: 4.7, p95: 3.6 },
      '51-60': { p10: 9.0,  p25: 7.5,  zsm_min: 6.4,  zsm_opt: 5.2, p95: 4.0 },
      '61-64': { p10: 10.0, p25: 8.4,  zsm_min: 7.1,  zsm_opt: 5.8, p95: 4.5 },
      '65-69': { p10: 11.0, p25: 9.2,  zsm_min: 7.8,  zsm_opt: 6.4, p95: 5.0 },
      '70-74': { p10: 12.0, p25: 10.0, zsm_min: 8.5,  zsm_opt: 7.1, p95: 5.5 },
      '75-79': { p10: 14.2, p25: 11.8, zsm_min: 10.0, zsm_opt: 8.4, p95: 6.5 },
      '80+':   { p10: 16.5, p25: 13.8, zsm_min: 11.6, zsm_opt: 9.8, p95: 7.6 },
    },
  },

  chair_sit_reach: {
    M: {
      '6':     { p10: -6,  p25: -2,  zsm_min: 2,  zsm_opt: 6,  p95: 11 },
      '10':    { p10: -5,  p25: -1,  zsm_min: 3,  zsm_opt: 7,  p95: 12 },
      '14':    { p10: -6,  p25: -2,  zsm_min: 2,  zsm_opt: 6,  p95: 11 },
      '17':    { p10: -5,  p25: -1,  zsm_min: 3,  zsm_opt: 7,  p95: 12 },
      '18-20': { p10: -5,  p25: -1,  zsm_min: 3,  zsm_opt: 7,  p95: 12 },
      '21-30': { p10: -5,  p25: -1,  zsm_min: 3,  zsm_opt: 7,  p95: 12 },
      '31-40': { p10: -6,  p25: -2,  zsm_min: 2,  zsm_opt: 6,  p95: 11 },
      '41-50': { p10: -7,  p25: -3,  zsm_min: 1,  zsm_opt: 5,  p95: 10 },
      '51-60': { p10: -9,  p25: -4,  zsm_min: 0,  zsm_opt: 4,  p95: 9  },
      '61-64': { p10: -10, p25: -5,  zsm_min: -1, zsm_opt: 3,  p95: 8  },
      '65-69': { p10: -11, p25: -6,  zsm_min: -2, zsm_opt: 3,  p95: 8  },
      '70-74': { p10: -12, p25: -7,  zsm_min: -3, zsm_opt: 2,  p95: 7  },
      '75-79': { p10: -14, p25: -8,  zsm_min: -4, zsm_opt: 1,  p95: 6  },
      '80+':   { p10: -16, p25: -10, zsm_min: -5, zsm_opt: 0,  p95: 5  },
    },
    F: {
      '6':     { p10: -4,  p25: 0,   zsm_min: 4,  zsm_opt: 8,   p95: 13 },
      '10':    { p10: -3,  p25: 1,   zsm_min: 5,  zsm_opt: 9,   p95: 14 },
      '14':    { p10: -2,  p25: 2,   zsm_min: 6,  zsm_opt: 10,  p95: 15 },
      '17':    { p10: -2,  p25: 2,   zsm_min: 6,  zsm_opt: 10,  p95: 15 },
      '18-20': { p10: -2,  p25: 2,   zsm_min: 6,  zsm_opt: 10,  p95: 15 },
      '21-30': { p10: -2,  p25: 2,   zsm_min: 6,  zsm_opt: 10,  p95: 15 },
      '31-40': { p10: -3,  p25: 1,   zsm_min: 5,  zsm_opt: 9,   p95: 14 },
      '41-50': { p10: -4,  p25: 0,   zsm_min: 4,  zsm_opt: 8,   p95: 13 },
      '51-60': { p10: -5,  p25: -1,  zsm_min: 3,  zsm_opt: 7,   p95: 12 },
      '61-64': { p10: -6,  p25: -2,  zsm_min: 2,  zsm_opt: 6,   p95: 11 },
      '65-69': { p10: -7,  p25: -3,  zsm_min: 1,  zsm_opt: 5,   p95: 10 },
      '70-74': { p10: -8,  p25: -4,  zsm_min: 0,  zsm_opt: 4,   p95: 9  },
      '75-79': { p10: -10, p25: -5,  zsm_min: -1, zsm_opt: 3,   p95: 8  },
      '80+':   { p10: -12, p25: -7,  zsm_min: -2, zsm_opt: 2,   p95: 7  },
    },
  },

  back_scratch: {
    M: {
      '6':     { p10: -6,  p25: -2,  zsm_min: 2,  zsm_opt: 6,  p95: 11 },
      '10':    { p10: -6,  p25: -2,  zsm_min: 2,  zsm_opt: 6,  p95: 11 },
      '14':    { p10: -7,  p25: -3,  zsm_min: 1,  zsm_opt: 5,  p95: 10 },
      '17':    { p10: -7,  p25: -3,  zsm_min: 1,  zsm_opt: 5,  p95: 10 },
      '18-20': { p10: -7,  p25: -3,  zsm_min: 1,  zsm_opt: 5,  p95: 10 },
      '21-30': { p10: -7,  p25: -3,  zsm_min: 1,  zsm_opt: 5,  p95: 10 },
      '31-40': { p10: -9,  p25: -4,  zsm_min: 0,  zsm_opt: 4,  p95: 9  },
      '41-50': { p10: -11, p25: -6,  zsm_min: -2, zsm_opt: 3,  p95: 8  },
      '51-60': { p10: -13, p25: -8,  zsm_min: -3, zsm_opt: 1,  p95: 6  },
      '61-64': { p10: -14, p25: -9,  zsm_min: -4, zsm_opt: 0,  p95: 5  },
      '65-69': { p10: -15, p25: -10, zsm_min: -5, zsm_opt: 0,  p95: 5  },
      '70-74': { p10: -16, p25: -11, zsm_min: -6, zsm_opt: -1, p95: 4  },
      '75-79': { p10: -18, p25: -12, zsm_min: -7, zsm_opt: -2, p95: 3  },
      '80+':   { p10: -20, p25: -14, zsm_min: -8, zsm_opt: -3, p95: 2  },
    },
    F: {
      '6':     { p10: -3,  p25: 1,   zsm_min: 5,  zsm_opt: 9,  p95: 13 },
      '10':    { p10: -3,  p25: 1,   zsm_min: 5,  zsm_opt: 9,  p95: 14 },
      '14':    { p10: -3,  p25: 1,   zsm_min: 5,  zsm_opt: 9,  p95: 14 },
      '17':    { p10: -3,  p25: 1,   zsm_min: 5,  zsm_opt: 9,  p95: 14 },
      '18-20': { p10: -3,  p25: 1,   zsm_min: 5,  zsm_opt: 9,  p95: 14 },
      '21-30': { p10: -3,  p25: 1,   zsm_min: 5,  zsm_opt: 9,  p95: 14 },
      '31-40': { p10: -5,  p25: -1,  zsm_min: 3,  zsm_opt: 7,  p95: 12 },
      '41-50': { p10: -6,  p25: -2,  zsm_min: 2,  zsm_opt: 6,  p95: 11 },
      '51-60': { p10: -8,  p25: -3,  zsm_min: 1,  zsm_opt: 5,  p95: 10 },
      '61-64': { p10: -9,  p25: -4,  zsm_min: 0,  zsm_opt: 4,  p95: 9  },
      '65-69': { p10: -10, p25: -5,  zsm_min: -1, zsm_opt: 3,  p95: 8  },
      '70-74': { p10: -11, p25: -6,  zsm_min: -2, zsm_opt: 2,  p95: 7  },
      '75-79': { p10: -13, p25: -7,  zsm_min: -3, zsm_opt: 1,  p95: 6  },
      '80+':   { p10: -15, p25: -9,  zsm_min: -4, zsm_opt: 0,  p95: 5  },
    },
  },

  knee_to_wall: {
    M: {
      '6':     { p10: 5.0, p25: 6.8,  zsm_min: 8.6,  zsm_opt: 10.5, p95: 13.5 },
      '10':    { p10: 6.0, p25: 8.0,  zsm_min: 10.0, zsm_opt: 12.0, p95: 15.0 },
      '14':    { p10: 7.0, p25: 9.0,  zsm_min: 11.0, zsm_opt: 13.0, p95: 16.0 },
      '17':    { p10: 7.5, p25: 9.5,  zsm_min: 11.5, zsm_opt: 13.5, p95: 16.5 },
      '18-20': { p10: 7.5, p25: 9.5,  zsm_min: 11.5, zsm_opt: 13.5, p95: 16.5 },
      '21-30': { p10: 7.5, p25: 9.5,  zsm_min: 11.5, zsm_opt: 13.5, p95: 16.5 },
      '31-40': { p10: 7.0, p25: 9.0,  zsm_min: 11.0, zsm_opt: 13.0, p95: 16.0 },
      '41-50': { p10: 6.5, p25: 8.5,  zsm_min: 10.5, zsm_opt: 12.5, p95: 15.5 },
      '51-60': { p10: 5.5, p25: 7.5,  zsm_min: 9.5,  zsm_opt: 11.5, p95: 14.5 },
      '61-64': { p10: 4.8, p25: 6.5,  zsm_min: 8.3,  zsm_opt: 10.2, p95: 13.2 },
      '65-69': { p10: 4.2, p25: 5.8,  zsm_min: 7.5,  zsm_opt: 9.4,  p95: 12.4 },
      '70-74': { p10: 3.5, p25: 5.0,  zsm_min: 6.8,  zsm_opt: 8.6,  p95: 11.5 },
      '75-79': { p10: 2.8, p25: 4.2,  zsm_min: 5.8,  zsm_opt: 7.6,  p95: 10.5 },
      '80+':   { p10: 2.2, p25: 3.5,  zsm_min: 5.0,  zsm_opt: 6.8,  p95: 9.5  },
    },
    F: {
      '6':     { p10: 5.0, p25: 6.8,  zsm_min: 8.6,  zsm_opt: 10.5, p95: 13.5 },
      '10':    { p10: 6.0, p25: 8.0,  zsm_min: 10.0, zsm_opt: 12.0, p95: 15.0 },
      '14':    { p10: 6.8, p25: 8.8,  zsm_min: 10.8, zsm_opt: 12.8, p95: 15.8 },
      '17':    { p10: 7.0, p25: 9.0,  zsm_min: 11.0, zsm_opt: 13.0, p95: 16.0 },
      '18-20': { p10: 7.0, p25: 9.0,  zsm_min: 11.0, zsm_opt: 13.0, p95: 16.0 },
      '21-30': { p10: 7.0, p25: 9.0,  zsm_min: 11.0, zsm_opt: 13.0, p95: 16.0 },
      '31-40': { p10: 6.8, p25: 8.8,  zsm_min: 10.8, zsm_opt: 12.8, p95: 15.8 },
      '41-50': { p10: 6.2, p25: 8.2,  zsm_min: 10.2, zsm_opt: 12.2, p95: 15.2 },
      '51-60': { p10: 5.2, p25: 7.2,  zsm_min: 9.2,  zsm_opt: 11.2, p95: 14.2 },
      '61-64': { p10: 4.5, p25: 6.2,  zsm_min: 8.0,  zsm_opt: 10.0, p95: 13.0 },
      '65-69': { p10: 4.0, p25: 5.5,  zsm_min: 7.2,  zsm_opt: 9.1,  p95: 12.0 },
      '70-74': { p10: 3.2, p25: 4.8,  zsm_min: 6.5,  zsm_opt: 8.3,  p95: 11.2 },
      '75-79': { p10: 2.6, p25: 4.0,  zsm_min: 5.5,  zsm_opt: 7.3,  p95: 10.2 },
      '80+':   { p10: 2.0, p25: 3.2,  zsm_min: 4.8,  zsm_opt: 6.5,  p95: 9.2  },
    },
  },

  wall_toss_30s: {
    M: {
      '6':     { p10: 7,  p25: 10, zsm_min: 13, zsm_opt: 17, p95: 22 },
      '10':    { p10: 12, p25: 15, zsm_min: 19, zsm_opt: 23, p95: 28 },
      '14':    { p10: 17, p25: 21, zsm_min: 25, zsm_opt: 30, p95: 36 },
      '17':    { p10: 21, p25: 25, zsm_min: 29, zsm_opt: 34, p95: 40 },
      '18-20': { p10: 21, p25: 25, zsm_min: 29, zsm_opt: 34, p95: 40 },
      '21-30': { p10: 21, p25: 25, zsm_min: 29, zsm_opt: 34, p95: 40 },
      '31-40': { p10: 20, p25: 24, zsm_min: 28, zsm_opt: 33, p95: 39 },
      '41-50': { p10: 18, p25: 22, zsm_min: 26, zsm_opt: 31, p95: 37 },
      '51-60': { p10: 16, p25: 19, zsm_min: 23, zsm_opt: 28, p95: 34 },
      '61-64': { p10: 14, p25: 17, zsm_min: 21, zsm_opt: 25, p95: 31 },
      '65-69': { p10: 12, p25: 15, zsm_min: 19, zsm_opt: 23, p95: 29 },
      '70-74': { p10: 10, p25: 13, zsm_min: 17, zsm_opt: 21, p95: 26 },
      '75-79': { p10: 9,  p25: 12, zsm_min: 15, zsm_opt: 19, p95: 24 },
      '80+':   { p10: 8,  p25: 11, zsm_min: 14, zsm_opt: 18, p95: 23 },
    },
    F: {
      '6':     { p10: 6,  p25: 9,  zsm_min: 12, zsm_opt: 16, p95: 21 },
      '10':    { p10: 11, p25: 14, zsm_min: 18, zsm_opt: 22, p95: 27 },
      '14':    { p10: 15, p25: 19, zsm_min: 23, zsm_opt: 28, p95: 34 },
      '17':    { p10: 18, p25: 22, zsm_min: 26, zsm_opt: 31, p95: 37 },
      '18-20': { p10: 18, p25: 22, zsm_min: 26, zsm_opt: 31, p95: 37 },
      '21-30': { p10: 18, p25: 22, zsm_min: 26, zsm_opt: 31, p95: 37 },
      '31-40': { p10: 17, p25: 21, zsm_min: 25, zsm_opt: 30, p95: 36 },
      '41-50': { p10: 16, p25: 19, zsm_min: 23, zsm_opt: 28, p95: 34 },
      '51-60': { p10: 14, p25: 17, zsm_min: 21, zsm_opt: 25, p95: 31 },
      '61-64': { p10: 13, p25: 16, zsm_min: 19, zsm_opt: 23, p95: 28 },
      '65-69': { p10: 11, p25: 14, zsm_min: 17, zsm_opt: 21, p95: 26 },
      '70-74': { p10: 9,  p25: 12, zsm_min: 15, zsm_opt: 19, p95: 24 },
      '75-79': { p10: 8,  p25: 11, zsm_min: 14, zsm_opt: 17, p95: 22 },
      '80+':   { p10: 7,  p25: 10, zsm_min: 13, zsm_opt: 16, p95: 21 },
    },
  },

  plate_tapping_25: {
    M: {
      '6':     { p10: 21.5, p25: 18.8, zsm_min: 16.5, zsm_opt: 14.5, p95: 12.2 },
      '10':    { p10: 16.5, p25: 14.5, zsm_min: 12.8, zsm_opt: 11.2, p95: 9.5  },
      '14':    { p10: 13.8, p25: 12.0, zsm_min: 10.5, zsm_opt: 9.2,  p95: 7.8  },
      '17':    { p10: 12.5, p25: 10.8, zsm_min: 9.4,  zsm_opt: 8.2,  p95: 7.0  },
      '18-20': { p10: 12.5, p25: 10.8, zsm_min: 9.4,  zsm_opt: 8.2,  p95: 7.0  },
      '21-30': { p10: 12.5, p25: 10.8, zsm_min: 9.4,  zsm_opt: 8.2,  p95: 7.0  },
      '31-40': { p10: 13.2, p25: 11.4, zsm_min: 10.0, zsm_opt: 8.7,  p95: 7.4  },
      '41-50': { p10: 14.2, p25: 12.2, zsm_min: 10.8, zsm_opt: 9.4,  p95: 8.0  },
      '51-60': { p10: 15.5, p25: 13.4, zsm_min: 11.8, zsm_opt: 10.2, p95: 8.7  },
      '61-64': { p10: 16.5, p25: 14.2, zsm_min: 12.5, zsm_opt: 10.9, p95: 9.3  },
      '65-69': { p10: 17.5, p25: 15.0, zsm_min: 13.2, zsm_opt: 11.5, p95: 9.8  },
      '70-74': { p10: 19.0, p25: 16.4, zsm_min: 14.4, zsm_opt: 12.6, p95: 10.8 },
      '75-79': { p10: 20.8, p25: 18.0, zsm_min: 15.8, zsm_opt: 13.8, p95: 11.8 },
      '80+':   { p10: 22.5, p25: 19.5, zsm_min: 17.0, zsm_opt: 14.8, p95: 12.5 },
    },
    F: {
      '6':     { p10: 21.8, p25: 19.0, zsm_min: 16.8, zsm_opt: 14.8, p95: 12.5 },
      '10':    { p10: 17.0, p25: 14.8, zsm_min: 13.0, zsm_opt: 11.4, p95: 9.8  },
      '14':    { p10: 14.2, p25: 12.4, zsm_min: 10.8, zsm_opt: 9.5,  p95: 8.0  },
      '17':    { p10: 13.2, p25: 11.4, zsm_min: 9.9,  zsm_opt: 8.6,  p95: 7.3  },
      '18-20': { p10: 13.2, p25: 11.4, zsm_min: 9.9,  zsm_opt: 8.6,  p95: 7.3  },
      '21-30': { p10: 13.2, p25: 11.4, zsm_min: 9.9,  zsm_opt: 8.6,  p95: 7.3  },
      '31-40': { p10: 13.8, p25: 11.9, zsm_min: 10.4, zsm_opt: 9.0,  p95: 7.7  },
      '41-50': { p10: 14.8, p25: 12.8, zsm_min: 11.2, zsm_opt: 9.8,  p95: 8.3  },
      '51-60': { p10: 16.0, p25: 13.8, zsm_min: 12.2, zsm_opt: 10.6, p95: 9.0  },
      '61-64': { p10: 17.2, p25: 14.8, zsm_min: 13.0, zsm_opt: 11.4, p95: 9.7  },
      '65-69': { p10: 18.2, p25: 15.6, zsm_min: 13.8, zsm_opt: 12.0, p95: 10.2 },
      '70-74': { p10: 19.8, p25: 17.0, zsm_min: 15.0, zsm_opt: 13.1, p95: 11.2 },
      '75-79': { p10: 21.6, p25: 18.6, zsm_min: 16.3, zsm_opt: 14.2, p95: 12.1 },
      '80+':   { p10: 23.5, p25: 20.2, zsm_min: 17.6, zsm_opt: 15.2, p95: 12.8 },
    },
  },

  side_step_20s: {
    M: {
      '6':     { p10: 13, p25: 16, zsm_min: 20, zsm_opt: 24, p95: 29 },
      '10':    { p10: 18, p25: 22, zsm_min: 26, zsm_opt: 31, p95: 37 },
      '14':    { p10: 23, p25: 27, zsm_min: 32, zsm_opt: 37, p95: 44 },
      '17':    { p10: 26, p25: 30, zsm_min: 35, zsm_opt: 40, p95: 47 },
      '18-20': { p10: 26, p25: 30, zsm_min: 35, zsm_opt: 40, p95: 47 },
      '21-30': { p10: 26, p25: 30, zsm_min: 35, zsm_opt: 40, p95: 47 },
      '31-40': { p10: 24, p25: 28, zsm_min: 33, zsm_opt: 38, p95: 45 },
      '41-50': { p10: 22, p25: 26, zsm_min: 30, zsm_opt: 35, p95: 41 },
      '51-60': { p10: 19, p25: 23, zsm_min: 27, zsm_opt: 32, p95: 37 },
      '61-64': { p10: 17, p25: 20, zsm_min: 24, zsm_opt: 28, p95: 33 },
      '65-69': { p10: 15, p25: 18, zsm_min: 22, zsm_opt: 26, p95: 31 },
      '70-74': { p10: 13, p25: 16, zsm_min: 19, zsm_opt: 23, p95: 28 },
      '75-79': { p10: 11, p25: 14, zsm_min: 17, zsm_opt: 21, p95: 26 },
      '80+':   { p10: 9,  p25: 12, zsm_min: 15, zsm_opt: 19, p95: 24 },
    },
    F: {
      '6':     { p10: 13, p25: 16, zsm_min: 20, zsm_opt: 24, p95: 29 },
      '10':    { p10: 17, p25: 21, zsm_min: 25, zsm_opt: 30, p95: 36 },
      '14':    { p10: 20, p25: 24, zsm_min: 29, zsm_opt: 34, p95: 40 },
      '17':    { p10: 22, p25: 26, zsm_min: 31, zsm_opt: 36, p95: 43 },
      '18-20': { p10: 22, p25: 26, zsm_min: 31, zsm_opt: 36, p95: 43 },
      '21-30': { p10: 22, p25: 26, zsm_min: 31, zsm_opt: 36, p95: 43 },
      '31-40': { p10: 21, p25: 25, zsm_min: 29, zsm_opt: 34, p95: 41 },
      '41-50': { p10: 19, p25: 23, zsm_min: 27, zsm_opt: 32, p95: 38 },
      '51-60': { p10: 17, p25: 20, zsm_min: 24, zsm_opt: 29, p95: 34 },
      '61-64': { p10: 15, p25: 18, zsm_min: 22, zsm_opt: 26, p95: 31 },
      '65-69': { p10: 13, p25: 16, zsm_min: 20, zsm_opt: 24, p95: 29 },
      '70-74': { p10: 11, p25: 14, zsm_min: 17, zsm_opt: 21, p95: 26 },
      '75-79': { p10: 9,  p25: 12, zsm_min: 15, zsm_opt: 19, p95: 23 },
      '80+':   { p10: 8,  p25: 11, zsm_min: 14, zsm_opt: 18, p95: 23 },
    },
  },

  step_test_2min: {
    M: {
      '6':     { p10: 50, p25: 59, zsm_min: 68, zsm_opt: 78,  p95: 92  },
      '10':    { p10: 58, p25: 68, zsm_min: 78, zsm_opt: 89,  p95: 104 },
      '14':    { p10: 66, p25: 77, zsm_min: 88, zsm_opt: 100, p95: 116 },
      '17':    { p10: 72, p25: 84, zsm_min: 96, zsm_opt: 108, p95: 124 },
      '18-20': { p10: 72, p25: 84, zsm_min: 96, zsm_opt: 108, p95: 124 },
      '21-30': { p10: 72, p25: 84, zsm_min: 96, zsm_opt: 108, p95: 124 },
      '31-40': { p10: 69, p25: 80, zsm_min: 92, zsm_opt: 104, p95: 120 },
      '41-50': { p10: 65, p25: 75, zsm_min: 87, zsm_opt: 99,  p95: 115 },
      '51-60': { p10: 59, p25: 69, zsm_min: 80, zsm_opt: 92,  p95: 108 },
      '61-64': { p10: 54, p25: 64, zsm_min: 75, zsm_opt: 87,  p95: 102 },
      '65-69': { p10: 50, p25: 60, zsm_min: 71, zsm_opt: 83,  p95: 98  },
      '70-74': { p10: 45, p25: 54, zsm_min: 65, zsm_opt: 77,  p95: 92  },
      '75-79': { p10: 40, p25: 49, zsm_min: 60, zsm_opt: 72,  p95: 86  },
      '80+':   { p10: 34, p25: 43, zsm_min: 53, zsm_opt: 65,  p95: 78  },
    },
    F: {
      '6':     { p10: 50, p25: 59, zsm_min: 68, zsm_opt: 78,  p95: 92  },
      '10':    { p10: 58, p25: 68, zsm_min: 78, zsm_opt: 88,  p95: 102 },
      '14':    { p10: 64, p25: 75, zsm_min: 86, zsm_opt: 97,  p95: 112 },
      '17':    { p10: 68, p25: 80, zsm_min: 92, zsm_opt: 104, p95: 120 },
      '18-20': { p10: 68, p25: 80, zsm_min: 92, zsm_opt: 104, p95: 120 },
      '21-30': { p10: 68, p25: 80, zsm_min: 92, zsm_opt: 104, p95: 120 },
      '31-40': { p10: 65, p25: 76, zsm_min: 88, zsm_opt: 100, p95: 116 },
      '41-50': { p10: 61, p25: 72, zsm_min: 83, zsm_opt: 95,  p95: 111 },
      '51-60': { p10: 56, p25: 66, zsm_min: 77, zsm_opt: 88,  p95: 104 },
      '61-64': { p10: 51, p25: 61, zsm_min: 72, zsm_opt: 83,  p95: 98  },
      '65-69': { p10: 47, p25: 57, zsm_min: 68, zsm_opt: 79,  p95: 94  },
      '70-74': { p10: 42, p25: 51, zsm_min: 62, zsm_opt: 73,  p95: 88  },
      '75-79': { p10: 37, p25: 46, zsm_min: 57, zsm_opt: 68,  p95: 82  },
      '80+':   { p10: 31, p25: 40, zsm_min: 50, zsm_opt: 61,  p95: 74  },
    },
  },

  functional_reach: {
    M: {
      '6':     { p10: 16, p25: 19, zsm_min: 22, zsm_opt: 26, p95: 31 },
      '10':    { p10: 19, p25: 23, zsm_min: 27, zsm_opt: 31, p95: 37 },
      '14':    { p10: 23, p25: 27, zsm_min: 31, zsm_opt: 36, p95: 42 },
      '17':    { p10: 26, p25: 30, zsm_min: 34, zsm_opt: 39, p95: 45 },
      '18-20': { p10: 26, p25: 30, zsm_min: 34, zsm_opt: 39, p95: 45 },
      '21-30': { p10: 26, p25: 30, zsm_min: 34, zsm_opt: 39, p95: 45 },
      '31-40': { p10: 25, p25: 29, zsm_min: 33, zsm_opt: 38, p95: 44 },
      '41-50': { p10: 23, p25: 27, zsm_min: 31, zsm_opt: 36, p95: 42 },
      '51-60': { p10: 21, p25: 25, zsm_min: 29, zsm_opt: 33, p95: 39 },
      '61-64': { p10: 19, p25: 23, zsm_min: 27, zsm_opt: 31, p95: 37 },
      '65-69': { p10: 17, p25: 21, zsm_min: 25, zsm_opt: 29, p95: 35 },
      '70-74': { p10: 15, p25: 19, zsm_min: 23, zsm_opt: 27, p95: 33 },
      '75-79': { p10: 14, p25: 17, zsm_min: 21, zsm_opt: 25, p95: 31 },
      '80+':   { p10: 12, p25: 15, zsm_min: 19, zsm_opt: 23, p95: 28 },
    },
    F: {
      '6':     { p10: 16, p25: 19, zsm_min: 22, zsm_opt: 26, p95: 31 },
      '10':    { p10: 19, p25: 23, zsm_min: 27, zsm_opt: 31, p95: 36 },
      '14':    { p10: 22, p25: 26, zsm_min: 30, zsm_opt: 35, p95: 41 },
      '17':    { p10: 24, p25: 28, zsm_min: 32, zsm_opt: 37, p95: 43 },
      '18-20': { p10: 24, p25: 28, zsm_min: 32, zsm_opt: 37, p95: 43 },
      '21-30': { p10: 24, p25: 28, zsm_min: 32, zsm_opt: 37, p95: 43 },
      '31-40': { p10: 23, p25: 27, zsm_min: 31, zsm_opt: 36, p95: 42 },
      '41-50': { p10: 21, p25: 25, zsm_min: 29, zsm_opt: 34, p95: 40 },
      '51-60': { p10: 19, p25: 23, zsm_min: 27, zsm_opt: 32, p95: 37 },
      '61-64': { p10: 17, p25: 21, zsm_min: 25, zsm_opt: 29, p95: 35 },
      '65-69': { p10: 16, p25: 19, zsm_min: 23, zsm_opt: 27, p95: 33 },
      '70-74': { p10: 14, p25: 17, zsm_min: 21, zsm_opt: 25, p95: 31 },
      '75-79': { p10: 13, p25: 16, zsm_min: 19, zsm_opt: 23, p95: 29 },
      '80+':   { p10: 11, p25: 14, zsm_min: 18, zsm_opt: 22, p95: 27 },
    },
  },

  step_touch_arms_60s: {
    M: {
      '6':     { p10: 34, p25: 40, zsm_min: 46, zsm_opt: 53, p95: 62 },
      '10':    { p10: 39, p25: 45, zsm_min: 52, zsm_opt: 59, p95: 69 },
      '14':    { p10: 44, p25: 51, zsm_min: 58, zsm_opt: 66, p95: 76 },
      '17':    { p10: 48, p25: 55, zsm_min: 62, zsm_opt: 70, p95: 80 },
      '18-20': { p10: 48, p25: 55, zsm_min: 62, zsm_opt: 70, p95: 80 },
      '21-30': { p10: 48, p25: 55, zsm_min: 62, zsm_opt: 70, p95: 80 },
      '31-40': { p10: 46, p25: 53, zsm_min: 60, zsm_opt: 68, p95: 78 },
      '41-50': { p10: 43, p25: 49, zsm_min: 56, zsm_opt: 64, p95: 74 },
      '51-60': { p10: 39, p25: 45, zsm_min: 52, zsm_opt: 60, p95: 70 },
      '61-64': { p10: 36, p25: 42, zsm_min: 49, zsm_opt: 56, p95: 66 },
      '65-69': { p10: 33, p25: 39, zsm_min: 46, zsm_opt: 53, p95: 63 },
      '70-74': { p10: 29, p25: 35, zsm_min: 42, zsm_opt: 49, p95: 58 },
      '75-79': { p10: 25, p25: 31, zsm_min: 37, zsm_opt: 44, p95: 53 },
      '80+':   { p10: 21, p25: 27, zsm_min: 33, zsm_opt: 39, p95: 47 },
    },
    F: {
      '6':     { p10: 34, p25: 40, zsm_min: 46, zsm_opt: 53, p95: 62 },
      '10':    { p10: 39, p25: 45, zsm_min: 52, zsm_opt: 59, p95: 69 },
      '14':    { p10: 44, p25: 51, zsm_min: 58, zsm_opt: 66, p95: 76 },
      '17':    { p10: 48, p25: 55, zsm_min: 62, zsm_opt: 70, p95: 80 },
      '18-20': { p10: 48, p25: 55, zsm_min: 62, zsm_opt: 70, p95: 80 },
      '21-30': { p10: 48, p25: 55, zsm_min: 62, zsm_opt: 70, p95: 80 },
      '31-40': { p10: 46, p25: 53, zsm_min: 60, zsm_opt: 68, p95: 78 },
      '41-50': { p10: 43, p25: 49, zsm_min: 56, zsm_opt: 64, p95: 74 },
      '51-60': { p10: 39, p25: 45, zsm_min: 52, zsm_opt: 60, p95: 70 },
      '61-64': { p10: 36, p25: 42, zsm_min: 49, zsm_opt: 56, p95: 66 },
      '65-69': { p10: 33, p25: 39, zsm_min: 46, zsm_opt: 53, p95: 63 },
      '70-74': { p10: 29, p25: 35, zsm_min: 42, zsm_opt: 49, p95: 58 },
      '75-79': { p10: 25, p25: 31, zsm_min: 37, zsm_opt: 44, p95: 53 },
      '80+':   { p10: 21, p25: 27, zsm_min: 33, zsm_opt: 39, p95: 47 },
    },
  },
};

// Generate full matrix
const fullMatrix: Record<string, Record<string, { M: NormativeCurve; F: NormativeCurve }>> = {};

let totalCurves = 0;
let monotonicityErrors = 0;

for (const testId of Object.keys(TESTS_CATALOG) as TestId[]) {
  const higherIsBetter = TESTS_CATALOG[testId].direction === 'higher_is_better';
  const milestonesM = TEST_MILESTONES[testId].M;
  const milestonesF = TEST_MILESTONES[testId].F;

  const curvesM = generate22Brackets(milestonesM);
  const curvesF = generate22Brackets(milestonesF);

  fullMatrix[testId] = {};

  for (const bracket of AGE_BRACKETS) {
    const enforcedM = enforceMonotonicity(curvesM[bracket], higherIsBetter);
    const enforcedF = enforceMonotonicity(curvesF[bracket], higherIsBetter);

    // Verify monotonicity
    const checkMono = (c: NormativeCurve) => {
      if (higherIsBetter) {
        return c.p10 < c.p25 && c.p25 < c.zsm_min && c.zsm_min < c.zsm_opt && c.zsm_opt < c.p95;
      } else {
        return c.p10 > c.p25 && c.p25 > c.zsm_min && c.zsm_min > c.zsm_opt && c.zsm_opt > c.p95;
      }
    };

    if (!checkMono(enforcedM)) {
      console.error(`Monotonicity error for ${testId} ${bracket} M`, enforcedM);
      monotonicityErrors++;
    }
    if (!checkMono(enforcedF)) {
      console.error(`Monotonicity error for ${testId} ${bracket} F`, enforcedF);
      monotonicityErrors++;
    }

    fullMatrix[testId][bracket] = {
      M: enforcedM,
      F: enforcedF,
    };

    totalCurves += 2;
  }
}

console.log(`Generated ${totalCurves} curves across 18 tests and 22 age brackets. Monotonicity errors: ${monotonicityErrors}`);

if (monotonicityErrors > 0) {
  process.exit(1);
}

// Generate the TypeScript file with explicit literal object
const outputTsPath = path.resolve(__dirname, '../src/data/normative-curves.ts');

const tsCode = `// ARCHIVO GENERADO AUTOMÁTICAMENTE - 792 BAREMOS NORMATIVOS COMPLETOS
// 18 pruebas x 22 cortes de edad x 2 sexos = 792 curvas normativas estrictamente monótonas
// Fuentes científicas: Rikli & Jones SFT, Eurofit, ALPHA-Fitness, SPPB, MEXT Japón, Springer et al., Bennell et al., Duncan et al.

import { AgeBracket, NormativeCurve, TestId } from '../types/radar-motor';

export const NORMATIVE_CURVES: Record<TestId, Record<AgeBracket, { M: NormativeCurve; F: NormativeCurve }>> = ${JSON.stringify(
  fullMatrix,
  null,
  2
)};
`;

fs.writeFileSync(outputTsPath, tsCode, 'utf-8');
console.log(`Saved normative curves file to ${outputTsPath}`);
