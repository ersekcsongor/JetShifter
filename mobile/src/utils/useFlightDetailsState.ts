// hooks/useFlightDetailsState.ts
import { useState } from 'react';
import { FlightDetailsState } from './types';

export const useFlightDetailsState = () => {
  const [state, setState] = useState<FlightDetailsState>({
    loading: false,
    timezones: {},
    switchingTimes: null,
    stateTrajectory: [],
    simulationLoading: false,
    coStateTrajectory: [],
    coStateAtSwitchingPoints: {},
    controlPerturbations: [],
    perturbationLoading: false,
    updatedSwitchingTimes: null,
    iterationCount: 0,
    optimizationComplete: false,
    costHistory: [],
    activeSwitchingCount: 0,
    optimizationHistory: [],
    isOptimizing: false,
  });

  const updateState = (newState: Partial<FlightDetailsState>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  return {
    ...state,
    updateState,
  };
};