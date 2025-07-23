import React, { useEffect } from 'react';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  simulateCanvasOperations, 
  simulateMemoryUsage, 
  runPerformanceStressTest,
  logPerformanceMetrics,
  checkPerformanceHealth 
} from '../utils/performanceTestUtils';

/**
 * Demo component to showcase the performance monitoring hook
 * This demonstrates all the features required by the task:
 * - Real-time FPS, frame time, and memory tracking
 * - Performance event callbacks
 * - Threshold violation detection
 */
export const PerformanceMonitorDemo: React.FC = () => {
  const {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    resetMetrics
  } = usePerformanceMonitor({
    thresholds: {
      minFps: 45,
      maxFrameTime: 22,
      maxMemoryUsage: 80
    },
    onPerformanceChange: (metrics) => {
      // Log metrics changes (in development mode)
      if (process.env.NODE_ENV === 'development') {
        logPerformanceMetrics(metrics);
      }
    },
    onThresholdViolation: (type, current, threshold) => {
      console.warn(`⚠️ Performance threshold violation: ${type}`, {
        current,
        threshold,
        timestamp: new Date().toISOString()
      });
    },
    updateInterval: 500 // Update every 500ms for demo purposes
  });

  // Check performance health
  const healthCheck = checkPerformanceHealth(metrics);

  // Auto-log metrics changes for demo
  useEffect(() => {
    if (metrics.fps > 0 || metrics.frameTime > 0) {
      console.log('📈 Performance Update:', metrics);
    }
  }, [metrics]);

  const handleStressTest = async () => {
    console.log('🚀 Starting performance stress test...');
    await runPerformanceStressTest(3000);
    console.log('✅ Stress test completed');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'good': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      default: return '📊';
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Performance Monitor Demo</h2>
          <p className="text-muted-foreground">
            Real-time performance tracking with FPS, frame time, and memory monitoring
          </p>
        </div>

        {/* Monitoring Status */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="font-medium">
              {isMonitoring ? 'Monitoring Active' : 'Monitoring Stopped'}
            </span>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={startMonitoring} 
              disabled={isMonitoring}
              size="sm"
              variant="outline"
            >
              Start
            </Button>
            <Button 
              onClick={stopMonitoring} 
              disabled={!isMonitoring}
              size="sm"
              variant="outline"
            >
              Stop
            </Button>
            <Button 
              onClick={resetMetrics}
              size="sm"
              variant="outline"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Performance Metrics Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.fps}</div>
            <div className="text-sm text-blue-600">FPS</div>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{metrics.frameTime}ms</div>
            <div className="text-sm text-purple-600">Frame Time</div>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.memoryUsage}MB</div>
            <div className="text-sm text-green-600">Memory</div>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">{metrics.canvasOperations}</div>
            <div className="text-sm text-orange-600">Canvas Ops</div>
          </div>
        </div>

        {/* Performance Health Status */}
        <div className={`p-4 rounded-lg border-2 ${
          healthCheck.status === 'good' ? 'border-green-200 bg-green-50 dark:bg-green-950' :
          healthCheck.status === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950' :
          'border-red-200 bg-red-50 dark:bg-red-950'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{getStatusEmoji(healthCheck.status)}</span>
            <span className={`font-semibold ${getStatusColor(healthCheck.status)}`}>
              Performance Status: {healthCheck.status.toUpperCase()}
            </span>
          </div>
          {healthCheck.issues.length > 0 && (
            <ul className="text-sm space-y-1">
              {healthCheck.issues.map((issue, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-current rounded-full" />
                  {issue}
                </li>
              ))}
            </ul>
          )}
          {healthCheck.issues.length === 0 && (
            <p className="text-sm text-muted-foreground">All performance metrics are within acceptable ranges.</p>
          )}
        </div>

        {/* Test Controls */}
        <div className="space-y-3">
          <h3 className="font-semibold">Performance Tests</h3>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => simulateCanvasOperations(200)}
              variant="outline"
              size="sm"
            >
              Canvas Stress Test
            </Button>
            <Button 
              onClick={simulateMemoryUsage}
              variant="outline"
              size="sm"
            >
              Memory Test
            </Button>
            <Button 
              onClick={handleStressTest}
              variant="outline"
              size="sm"
            >
              Full Stress Test
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Use these buttons to simulate performance-intensive operations and observe the metrics changes.
            Check the browser console for detailed performance logs.
          </p>
        </div>

        {/* Implementation Notes */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Implementation Features</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>✅ Real-time FPS tracking using requestAnimationFrame</li>
            <li>✅ Frame time measurement with rolling average</li>
            <li>✅ Memory usage monitoring (when available)</li>
            <li>✅ Canvas operations counting</li>
            <li>✅ Configurable performance thresholds</li>
            <li>✅ Performance event callbacks</li>
            <li>✅ Threshold violation detection</li>
            <li>✅ Auto-start/stop monitoring</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};