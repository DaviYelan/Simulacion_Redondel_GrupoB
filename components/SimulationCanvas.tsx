
import React, { useRef, useEffect, useCallback } from 'react';
import { Car, SimulationConfig } from '../types';
import { TRACK_RADIUS, CAR_SIZE, CAR_WIDTH, CAR_LENGTH, CAR_PALETTE } from '../constants';

interface SimulationCanvasProps {
  config: SimulationConfig;
  isRunning: boolean;
  triggerJamSignal: number; // Increment this to trigger a jam
  onJamComplete: () => void;
  setStats: (stats: { avgSpeed: number; brakingCount: number }) => void;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  config,
  isRunning,
  triggerJamSignal,
  onJamComplete,
  setStats,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const carsRef = useRef<Car[]>([]);
  const animationFrameId = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  // Initialize Cars
  const initCars = useCallback(() => {
    const newCars: Car[] = [];
    const spacing = (2 * Math.PI) / config.carCount;

    for (let i = 0; i < config.carCount; i++) {
      newCars.push({
        id: i,
        angle: i * spacing,
        speed: 0, // Start stopped and accelerate
        radius: TRACK_RADIUS,
        baseColor: CAR_PALETTE[i % CAR_PALETTE.length], // Cycle through palette
        isForcedStopped: false,
        state: 'stopped',
      });
    }
    carsRef.current = newCars;
  }, [config.carCount]);

  // Handle configuration changes that require re-init
  useEffect(() => {
    initCars();
  }, [initCars]);

  // Handle Jam Trigger
  useEffect(() => {
    if (triggerJamSignal === 0) return;
    if (carsRef.current.length === 0) return;

    // Pick a random car
    const randomIdx = Math.floor(Math.random() * carsRef.current.length);
    carsRef.current[randomIdx].isForcedStopped = true;
    carsRef.current[randomIdx].state = 'stopped';
    
    // Release after 2 seconds
    setTimeout(() => {
      if (carsRef.current[randomIdx]) {
        carsRef.current[randomIdx].isForcedStopped = false;
        onJamComplete();
      }
    }, 2000);

  }, [triggerJamSignal, onJamComplete]);

  // Physics Loop
  const updatePhysics = () => {
    const cars = carsRef.current;
    const numCars = cars.length;
    let brakingCount = 0;
    let totalSpeed = 0;

    for (let i = 0; i < numCars; i++) {
      const car = cars[i];
      
      // Identify car ahead (circular array)
      const nextCarIndex = (i + 1) % numCars;
      const nextCar = cars[nextCarIndex];

      // Calculate gap (Arc distance in radians)
      let gap = nextCar.angle - car.angle;
      if (gap < 0) gap += 2 * Math.PI; // Wrap around calculation
      
      // Subtract car size physically to get actual empty space
      // Use visual CAR_LENGTH plus a small buffer to prevent visual overlap
      const physicalSizeRad = (CAR_LENGTH + 6) / TRACK_RADIUS; 
      gap -= physicalSizeRad;

      // --- Behavior Logic ---

      if (car.isForcedStopped) {
        // 1. Experiment Condition: Forced Stop
        car.speed = 0;
        car.state = 'stopped';
        brakingCount++;
      } else {
        // 2. Adaptive Cruise Control Logic
        
        if (gap < config.safeDistance) {
            // TOO CLOSE: BRAKE
            // The closer we are, the harder we brake, but prevent negative speed
            if (gap < config.safeDistance * 0.3) {
                // Emergency brake
                car.speed = Math.max(0, car.speed - config.brakingPower * 3);
            } else {
                car.speed = Math.max(0, car.speed - config.brakingPower);
            }
            car.state = 'braking';
            brakingCount++;
        } else {
            // SAFE DISTANCE
            if (car.speed < config.maxSpeed) {
                // ACCELERATE
                car.speed += config.acceleration;
                car.state = 'accelerating';
            } else if (car.speed > config.maxSpeed) {
                // DECELERATE (Engine braking / friction) to match new lower limit
                car.speed = Math.max(config.maxSpeed, car.speed - config.brakingPower * 0.5);
                car.state = 'cruising';
            } else {
                // Cruising at max speed
                car.state = 'cruising';
            }
        }

        // Prevent collision (physically cannot occupy same space)
        if (gap <= 0.001 && car.speed > nextCar.speed) {
             car.speed = nextCar.speed; // Match speed instantly if touching
             // Ensure they don't overlap by forcing position behind next car
             // (Optional simplification: just match speed is usually enough for visual if updated frequent enough)
        }
      }

      totalSpeed += car.speed;
    }

    // Update Positions
    for (let i = 0; i < numCars; i++) {
        cars[i].angle += cars[i].speed;
        // Normalize angle 0 - 2PI
        if (cars[i].angle > 2 * Math.PI) {
            cars[i].angle -= 2 * Math.PI;
        }
    }

    // Update Stats (throttled to avoid heavy React state updates every frame)
    if (Date.now() - lastUpdateRef.current > 200) {
        setStats({
            avgSpeed: (totalSpeed / numCars) * 100,
            brakingCount
        });
        lastUpdateRef.current = Date.now();
    }
  };

  const drawRoundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        return;
    }
    // Polyfill for roundRect
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const drawCar = (ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, car: Car) => {
    ctx.save();
    
    // Move to car position
    ctx.translate(x, y);
    
    // Rotate to match track tangent
    // Angle + PI aligns the car (which faces "Up" locally) with the tangent of the clockwise circle.
    ctx.rotate(angle + Math.PI);

    // Car Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    drawRoundRect(ctx, -CAR_WIDTH / 2 + 2, -CAR_LENGTH / 2 + 2, CAR_WIDTH, CAR_LENGTH, 4);
    ctx.fill();

    // Car Body (Use assigned random color)
    ctx.fillStyle = car.baseColor;
    drawRoundRect(ctx, -CAR_WIDTH / 2, -CAR_LENGTH / 2, CAR_WIDTH, CAR_LENGTH, 4);
    ctx.fill();

    // Roof / Windshield area (Darker tint of body color or black glass)
    ctx.fillStyle = 'rgba(20, 30, 40, 0.6)';
    drawRoundRect(ctx, -CAR_WIDTH / 2 + 2, -CAR_LENGTH / 2 + 5, CAR_WIDTH - 4, CAR_LENGTH / 2, 2);
    ctx.fill();

    // Headlights (Yellow/White, at front)
    ctx.fillStyle = '#fef9c3'; // yellow-100
    ctx.shadowColor = '#fef9c3';
    ctx.shadowBlur = 5;
    // Left Light
    ctx.beginPath();
    ctx.rect(-CAR_WIDTH / 2 + 1, -CAR_LENGTH / 2, 3, 2);
    ctx.fill();
    // Right Light
    ctx.beginPath();
    ctx.rect(CAR_WIDTH / 2 - 4, -CAR_LENGTH / 2, 3, 2);
    ctx.fill();
    ctx.shadowBlur = 0; // Reset glow

    // Brake Lights (Red, at back)
    // Logic: If braking or stopped, bright red + glow. Else dark red.
    const isBraking = car.state === 'braking' || car.state === 'stopped';
    
    ctx.fillStyle = isBraking ? '#ff2200' : '#7f1d1d';
    if (isBraking) {
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 10;
    }

    // Left Rear
    ctx.beginPath();
    ctx.rect(-CAR_WIDTH / 2 + 1, CAR_LENGTH / 2 - 2, 3, 2);
    ctx.fill();
    // Right Rear
    ctx.beginPath();
    ctx.rect(CAR_WIDTH / 2 - 4, CAR_LENGTH / 2 - 2, 3, 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;

    // Forced Stop Indicator: Hazard Lights (Intermitentes)
    if (car.isForcedStopped) {
       // Blink every 300ms
       const now = Date.now();
       if (Math.floor(now / 300) % 2 === 0) {
           ctx.fillStyle = '#fbbf24'; // amber-400
           ctx.shadowColor = '#f59e0b';
           ctx.shadowBlur = 12;

           const w = CAR_WIDTH;
           const l = CAR_LENGTH;
           const lightSize = 3;

           // Front Left
           ctx.fillRect(-w/2 - 2, -l/2 - 1, lightSize, lightSize);
           // Front Right
           ctx.fillRect(w/2 - 1, -l/2 - 1, lightSize, lightSize);
           // Rear Left
           ctx.fillRect(-w/2 - 2, l/2 - 2, lightSize, lightSize);
           // Rear Right
           ctx.fillRect(w/2 - 1, l/2 - 2, lightSize, lightSize);
           
           ctx.shadowBlur = 0;
       }
    }

    ctx.restore();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw Track (Road surface)
    ctx.beginPath();
    ctx.arc(centerX, centerY, TRACK_RADIUS, 0, 2 * Math.PI);
    ctx.lineWidth = 50; // Wider road for new car size
    ctx.strokeStyle = '#334155'; // Dark asphalt
    ctx.stroke();

    // Road Borders
    ctx.beginPath();
    ctx.arc(centerX, centerY, TRACK_RADIUS - 25, 0, 2 * Math.PI);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#64748b';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, TRACK_RADIUS + 25, 0, 2 * Math.PI);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#64748b';
    ctx.stroke();

    // Dashed Center Line
    ctx.beginPath();
    ctx.arc(centerX, centerY, TRACK_RADIUS, 0, 2 * Math.PI);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.setLineDash([15, 20]);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Draw Cars
    carsRef.current.forEach(car => {
      const x = centerX + Math.cos(car.angle) * TRACK_RADIUS;
      const y = centerY + Math.sin(car.angle) * TRACK_RADIUS;
      drawCar(ctx, x, y, car.angle, car);
    });
  };

  const loop = useCallback(() => {
    if (isRunning) {
      updatePhysics();
    }
    draw();
    animationFrameId.current = requestAnimationFrame(loop);
  }, [isRunning, config]);

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [loop]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={600}
      className="max-w-full max-h-full mx-auto"
    />
  );
};
