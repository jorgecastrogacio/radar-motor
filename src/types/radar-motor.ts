export type AxisId =
  | 'lower_body_strength'
  | 'core_upper_strength'
  | 'balance_posture'
  | 'mobility_flexibility'
  | 'coordination_agility'
  | 'aerobic_stability';

export type Sex = 'M' | 'F' | 'N';

export type AgeBracket =
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12'
  | '13'
  | '14'
  | '15'
  | '16'
  | '17'
  | '18-20'
  | '21-30'
  | '31-40'
  | '41-50'
  | '51-60'
  | '61-64'
  | '65-69'
  | '70-74'
  | '75-79'
  | '80+';

export type TestId =
  | 'chair_stand_30s'
  | 'sit_to_stand_5x'
  | 'calf_raise_30s'
  | 'glute_bridge_30s'
  | 'wall_pushups_30s'
  | 'arm_curl_1l_30s'
  | 'monopodal_open'
  | 'tandem_stance_open'
  | 'tandem_walk_3m'
  | 'chair_sit_reach'
  | 'back_scratch'
  | 'knee_to_wall'
  | 'wall_toss_30s'
  | 'plate_tapping_25'
  | 'side_step_20s'
  | 'step_test_2min'
  | 'functional_reach'
  | 'step_touch_arms_60s';

export type TimerMode = 'countdown' | 'stopwatch' | 'manual_scale';

export type ScoreDirection = 'higher_is_better' | 'lower_is_better';

export interface NormativeCurve {
  p10: number;
  p25: number;
  zsm_min: number;
  zsm_opt: number;
  p95: number;
}

export type ConstructiveLevel = 'Base' | 'En Progreso' | 'Sólido' | 'Referente';

export type ZsmStatus = 'below_zsm' | 'in_zsm' | 'above_zsm';

export interface VisualScaleOption {
  label: string;
  anatomicalRef: string;
  valueCm: number;
}

export interface TestDefinition {
  id: TestId;
  order: number;
  axisId: AxisId;
  name: string;
  shortName: string;
  scientificRef: string;
  unit: string;
  direction: ScoreDirection;
  timerMode: TimerMode;
  durationSeconds?: number;
  maxSeconds?: number;
  isExpressTest: boolean;
  material: string;
  homeEquivalent: string;
  protocolSteps: string[];
  safetyCue: string;
  visualScaleOptions?: VisualScaleOption[];
}

export interface TestInput {
  testId: TestId;
  rawValue: number | null;
}

export interface TestResult {
  testId: TestId;
  name: string;
  rawValue: number | null;
  unit: string;
  direction: ScoreDirection;
  score: number;
  level: ConstructiveLevel;
  zsmStatus: ZsmStatus;
  skipped: boolean;
  curve: NormativeCurve;
}

export interface AxisResult {
  axisId: AxisId;
  name: string;
  score: number;
  level: ConstructiveLevel;
  testResults: TestResult[];
}

export interface EvaluationReport {
  age: number;
  ageBracket: AgeBracket;
  sex: Sex;
  mode: 'full' | 'express';
  globalScore: number;
  globalAverage: number;
  completedCount: number;
  totalTests: number;
  axisResults: Record<AxisId, AxisResult>;
  lowestAxes: AxisId[];
}
