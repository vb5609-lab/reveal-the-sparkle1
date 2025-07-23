import { useRef, useEffect, useCallback, useState } from 'react';

// Performance metrics interface as defined in the design document
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  canvasOperations: number;
}

// Performance thresholds for different quality levels
export interface PerformanceThresholds {
  minFps: number;
  maxFrameTime: number;
  maxMemoryUsage: number;
}

// Performance event callback types
export type PerformanceEventCallback = (metrics: PerformanceMetrics) => void;
export type ThresholdViolationCallback = (
  type: 'fps' | 'frameTime' | 'memory',
  current: number,
  threshold: number
) => void;

// Default performance thresholds
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  minFps: 30,
  maxFrameTime: 33, // 33ms = ~30fps
  maxMemoryUsage: 100 // MB
};

export interface UsePerformanceMonitorOptions {
  thresholds?: PerformanceThresholds;
  onPerformanceChange?: PerformanceEventCallback;
  onThresholdViolation?: ThresholdViolationCallback;
  updateInterval?: number; // ms
  enabled?: boolean;
}

export interface UsePerformanceMonitorReturn {
  metrics: PerformanceMetrics;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  resetMetrics: () => void;
}

export const usePerformanceMonitor = (
  options: UsePerformanceMonitorOptions = {}
): UsePerformanceMonitorReturn => {
  const {
    thresholds = DEFAULT_THRESHOLDS,
    onPerformanceChange,
    onThresholdViolation,
    updateInterval = 1000, // Update every second
    enabled = true
  } = options;

  // State for current metrics
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    canvasOperations: 0
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  // Refs for tracking performance data
  const animationFrameRef = useRef<number>();
  const intervalRef = useRef<number>();
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const frameTimesRef = useRef<number[]>([]);
  const canvasOperationsRef = useRef(0);
  const lastMetricsRef = useRef<PerformanceMetrics>(metrics);

  // FPS and frame time calculation using requestAnimationFrame
  const measureFramePerformance = useCallback(() => {
    const now = performance.now();
    const deltaTime = now - lastTimeRef.current;
    
    frameCountRef.current++;
    frameTimesRef.current.push(deltaTime);
    
    // Keep only recent frame times (last 60 frames for 1-second window at 60fps)
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift();
    }
    
    lastTimeRef.current = now;
    
    if (isMonitoring) {
      animationFrameRef.current = requestAnimationFrame(measureFramePerformance);
    }
  }, [isMonitoring]);

  // Memory usage calculation
  const getMemoryUsage = useCallback((): number => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      // Convert bytes to MB
      return Math.round(memInfo.usedJSHeapSize / (1024 * 1024));
    }
    return 0;
  }, []);

  // Calculate current performance metrics
  const calculateMetrics = useCallback((): PerformanceMetrics => {
    const frameCount = frameCountRef.current;
    const frameTimes = frameTimesRef.current;
    
    // Calculate FPS based on frame count over time
    const fps = frameTimes.length > 0 ? Math.round(1000 / (frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length)) : 0;
    
    // Calculate average frame time
    const frameTime = frameTimes.length > 0 ? Math.round(frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length) : 0;
    
    // Get current memory usage
    const memoryUsage = getMemoryUsage();
    
    // Get canvas operations count
    const canvasOperations = canvasOperationsRef.current;
    
    return {
      fps: Math.max(0, Math.min(fps, 120)), // Cap FPS at reasonable values
      frameTime,
      memoryUsage,
      canvasOperations
    };
  }, [getMemoryUsage]);

  // Check for threshold violations
  const checkThresholds = useCallback((currentMetrics: PerformanceMetrics) => {
    if (!onThresholdViolation) return;

    // Check FPS threshold
    if (currentMetrics.fps < thresholds.minFps && currentMetrics.fps > 0) {
      onThresholdViolation('fps', currentMetrics.fps, thresholds.minFps);
    }

    // Check frame time threshold
    if (currentMetrics.frameTime > thresholds.maxFrameTime && currentMetrics.frameTime > 0) {
      onThresholdViolation('frameTime', currentMetrics.frameTime, thresholds.maxFrameTime);
    }

    // Check memory usage threshold
    if (currentMetrics.memoryUsage > thresholds.maxMemoryUsage && currentMetrics.memoryUsage > 0) {
      onThresholdViolation('memory', currentMetrics.memoryUsage, thresholds.maxMemoryUsage);
    }
  }, [thresholds, onThresholdViolation]);

  // Update metrics periodically
  const updateMetrics = useCallback(() => {
    if (!isMonitoring) return;

    const currentMetrics = calculateMetrics();
    
    // Only update if metrics have changed significantly
    const hasSignificantChange = (
      Math.abs(currentMetrics.fps - lastMetricsRef.current.fps) > 2 ||
      Math.abs(currentMetrics.frameTime - lastMetricsRef.current.frameTime) > 2 ||
      Math.abs(currentMetrics.memoryUsage - lastMetricsRef.current.memoryUsage) > 1 ||
      Math.abs(currentMetrics.canvasOperations - lastMetricsRef.current.canvasOperations) > 5
    );

    if (hasSignificantChange) {
      setMetrics(currentMetrics);
      lastMetricsRef.current = currentMetrics;
      
      // Call performance change callback
      onPerformanceChange?.(currentMetrics);
      
      // Check for threshold violations
      checkThresholds(currentMetrics);
    }
  }, [isMonitoring, calculateMetrics, onPerformanceChange, checkThresholds]);

  // Start monitoring function
  const startMonitoring = useCallback(() => {
    if (isMonitoring || !enabled) return;

    setIsMonitoring(true);
    
    // Reset counters
    frameCountRef.current = 0;
    frameTimesRef.current = [];
    canvasOperationsRef.current = 0;
    lastTimeRef.current = performance.now();
    
    // Start frame performance measurement
    animationFrameRef.current = requestAnimationFrame(measureFramePerformance);
    
    // Start periodic metrics updates
    intervalRef.current = window.setInterval(updateMetrics, updateInterval);
  }, [isMonitoring, enabled, measureFramePerformance, updateMetrics, updateInterval]);

  // Stop monitoring function
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;

    setIsMonitoring(false);
    
    // Clear animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, [isMonitoring]);

  // Reset metrics function
  const resetMetrics = useCallback(() => {
    frameCountRef.current = 0;
    frameTimesRef.current = [];
    canvasOperationsRef.current = 0;
    lastTimeRef.current = performance.now();
    
    const resetMetrics: PerformanceMetrics = {
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
      canvasOperations: 0
    };
    
    setMetrics(resetMetrics);
    lastMetricsRef.current = resetMetrics;
  }, []);

  // Canvas operations tracking utility
  const trackCanvasOperation = useCallback(() => {
    canvasOperationsRef.current++;
  }, []);

  // Auto-start monitoring if enabled
  useEffect(() => {
    if (enabled) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [enabled, startMonitoring, stopMonitoring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    resetMetrics,
    // Export canvas operation tracker for use in components
    trackCanvasOperation
  } as UsePerformanceMonitorReturn & { trackCanvasOperation: () => void };
};