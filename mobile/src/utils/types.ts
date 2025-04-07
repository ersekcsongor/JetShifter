// types/index.ts
import Flight from "~/types/Flight";

export type SwitchingTimes = {
  t0: string;
  tf: string;
  switchingPoints: {
    time: string;
    type: 'light' | 'dark';
  }[];
  u0: number;
  u1: number;
  timezoneDiff: number;
  direction: string;
  flightDurationHours: number;
  sleepSchedule: SleepSchedule;
};

export type CircadianState = {
  x: number;
  n: number;
};

export type StateTrajectory = {
  time: string;
  x: number;
  n: number;
}[];

export type CoState = {
  lambda1: number;
  lambda2: number;
  time?: string;
};

export type CoStateTrajectory = {
  time: string;
  lambda1: number;
  lambda2: number;
}[];

export type ControlPerturbation = {
  point: string;
  optimalPerturbation: number;
  timeAdjustment: number;
};

export type FlightDetailsState = {
  loading: boolean;
  timezones: {
    originTz?: string;
    destTz?: string;
  };
  switchingTimes: SwitchingTimes | null;
  stateTrajectory: StateTrajectory;
  simulationLoading: boolean;
  coStateTrajectory: CoStateTrajectory;
  coStateAtSwitchingPoints: { [key: string]: CoState };
  controlPerturbations: ControlPerturbation[];
  perturbationLoading: boolean;
  updatedSwitchingTimes: string[] | null;
  iterationCount: number;
  optimizationComplete: boolean;
  costHistory: number[];
  activeSwitchingCount: number;
  optimizationHistory: SwitchingTimes[];
  isOptimizing: boolean;
};

export type SleepSchedule = {
  bedtime: string;    // Format: "HH:mm" (e.g., "22:30")
  wakeupTime: string; // Format: "HH:mm" (e.g., "06:30")
};
