// utils/constants.ts
export const MODEL_CONSTANTS = {
    PI_12: Math.PI / 12,
    ALPHA: 0.05,
    BETA: 0.01,
    B: 0.4,
    I0: 1,      // Try 1 instead of 1000
    I1: 10      // Try 10 instead of 10000
  };
  
  export const PERTURBATION_CONSTANTS = {
    TS: 0.5, // Try 1e7
    DELTA_U: 1,
    EPSILON: 1e-6,
    MAX_ITERATIONS: 20,
    COST_TOLERANCE: 1e-4,
    TIME_TOLERANCE: 0.1
  };

  const ENV = {
  API_BASE_URL: 'http://172.20.10.2:3000',
  //192.168.56.1:3000,172.20.10.2:3000,http://192.168.1.14:3000
};

export default ENV;