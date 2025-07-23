import { PerformanceMetrics } from '../hooks/usePerformanceMonitor';

/**
 * Utility functions for testing and demonstrating performance monitoring
 */

// Simulate heavy canvas operations for testing
export const simulateCanvasOperations = (count: number = 100): void => {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return;
  
  // Perform multiple drawing operations to stress test
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    ctx.arc(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      Math.random() * 50,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 50%)`;
    ctx.fill();
  }
};

// Simulate memory-intensive operations
export const simulateMemoryUsage = (): void => {
  // Create large arrays to increase memory usage temporarily
  const largeArrays: number[][] = [];
  
  for (let i = 0; i < 10; i++) {
    largeArrays.push(new Array(100000).fill(0).map(() => Math.random()));
  }
  
  // Keep references briefly then clean up
  setTimeout(() => {
    largeArrays.length = 0;
  }, 1000);
};

// Create performance stress test
export const runPerformanceStressTest = (duration: number = 5000): Promise<PerformanceMetrics[]> => {
  return new Promise((resolve) => {
    const metrics: PerformanceMetrics[] = [];
    const startTime = performance.now();
    
    const stressLoop = () => {
      const currentTime = performance.now();
      
      if (currentTime - startTime < duration) {
        // Simulate various performance-intensive operations
        simulateCanvasOperations(50);
        
        if (Math.random() < 0.3) {
          simulateMemoryUsage();
        }
        
        // Continue the stress test
        requestAnimationFrame(stressLoop);
      } else {
        resolve(metrics);
      }
    };
    
    requestAnimationFrame(stressLoop);
  });
};

// Log performance metrics in a readable format
export const logPerformanceMetrics = (metrics: PerformanceMetrics): void => {
  console.group('🔍 Performance Metrics');
  console.log(`📊 FPS: ${metrics.fps}`);
  console.log(`⏱️ Frame Time: ${metrics.frameTime}ms`);
  console.log(`💾 Memory Usage: ${metrics.memoryUsage}MB`);
  console.log(`🎨 Canvas Operations: ${metrics.canvasOperations}`);
  console.groupEnd();
};

// Performance threshold checker
export const checkPerformanceHealth = (metrics: PerformanceMetrics): {
  status: 'good' | 'warning' | 'critical';
  issues: string[];
} => {
  const issues: string[] = [];
  let status: 'good' | 'warning' | 'critical' = 'good';
  
  // Check FPS
  if (metrics.fps < 30 && metrics.fps > 0) {
    issues.push(`Low FPS: ${metrics.fps} (target: 30+)`);
    status = 'critical';
  } else if (metrics.fps < 45 && metrics.fps > 0) {
    issues.push(`Moderate FPS: ${metrics.fps} (target: 45+)`);
    if (status !== 'critical') status = 'warning';
  }
  
  // Check frame time
  if (metrics.frameTime > 33) {
    issues.push(`High frame time: ${metrics.frameTime}ms (target: <33ms)`);
    status = 'critical';
  } else if (metrics.frameTime > 22) {
    issues.push(`Moderate frame time: ${metrics.frameTime}ms (target: <22ms)`);
    if (status !== 'critical') status = 'warning';
  }
  
  // Check memory usage
  if (metrics.memoryUsage > 100) {
    issues.push(`High memory usage: ${metrics.memoryUsage}MB (target: <100MB)`);
    status = 'critical';
  } else if (metrics.memoryUsage > 80) {
    issues.push(`Moderate memory usage: ${metrics.memoryUsage}MB (target: <80MB)`);
    if (status !== 'critical') status = 'warning';
  }
  
  return { status, issues };
};