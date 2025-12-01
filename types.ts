
export interface Car {
  id: number;
  angle: number;       // Position in radians (0 to 2PI)
  speed: number;       // Current angular velocity
  radius: number;      // Distance from center (visual layering)
  baseColor: string;   // The paint color of the car
  isForcedStopped: boolean; // Flag for the experiment
  state: 'accelerating' | 'braking' | 'cruising' | 'stopped';
}

export interface SimulationConfig {
  carCount: number;
  maxSpeed: number;
  acceleration: number;
  brakingPower: number;
  safeDistance: number; // In radians
}
