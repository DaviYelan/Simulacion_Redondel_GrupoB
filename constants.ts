
export const TRACK_RADIUS = 200;
export const CAR_SIZE = 6; // Used for physics calculation proximity
export const CAR_WIDTH = 12; // Slightly wider
export const CAR_LENGTH = 24; // Longer to look more like a car

// Physics defaults
export const DEFAULT_CONFIG = {
  carCount: 15,
  maxSpeed: 0.02,         // Radians per frame
  acceleration: 0.0003,   // Speed increase per frame
  brakingPower: 0.0008,   // Speed decrease per frame
  safeDistance: 0.25,     // Minimum safe gap in radians
};

export const COLORS = {
  track: '#1e293b',
  // We will no longer use these for the whole body, but for logic or debug if needed
  carCruising: '#3b82f6', 
  carAccelerating: '#22c55e', 
  carBraking: '#ef4444', 
  carStopped: '#f59e0b', 
};

// Palette for random car body colors
export const CAR_PALETTE = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#84cc16', // Lime
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
  '#f43f5e', // Rose
  '#e2e8f0', // Slate (White-ish)
  '#94a3b8', // Gray
];
