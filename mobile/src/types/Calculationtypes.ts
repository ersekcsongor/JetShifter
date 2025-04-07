type SwitchingTimes = {
  t0: string;
  tf: string;
  switchingPoints: string[];
  u0: number;
  u1: number;
  timezoneDiff: number;
  direction: string;
  flightDurationHours: number;
};

type CircadianState = {
  x: number;  
  n: number;  
};

type StateTrajectory = {
  time: string;
  x: number;
  n: number;
}[];

type CoState = {
  lambda1: number;
  lambda2: number;
};

type CoStateTrajectory = {
  time: string;
  lambda1: number;
  lambda2: number;
}[];

type ControlPerturbation = {
  point: string;
  optimalPerturbation: number;
  timeAdjustment: number;
};
