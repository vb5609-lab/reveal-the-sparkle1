import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { usePerformanceMonitor, PerformanceMetrics } from '@/hooks/usePerformanceMonitor';
import { checkPerformanceHealth, logPerformanceMetrics } from '@/utils/performanceTestUtils';
import { ImageReveal } from './ImageReveal';

interface ImageRevealWithPerformanceMonitoringProps {
  imageSrc: string;
  hiddenImageSrc: string;
  onRevealComplete?: () => void;
  showPerformanceOverlay?: boolean;
}

export const ImageRevealWithPerformanceMonitoring: React.FC<ImageRevealWithPerformanceMonitoringProps> = ({
  imageSrc,
  hiddenImageSrc,
  onRevealComplete,
  showPerformanceOverlay = false
}) => {
  const [performanceAlerts, setPerformanceAlerts] = useState<string[]>([]);
  const [performanceStatus, setPerformanceStatus] = useState<'good' | 'warning' | 'critical'>('good');
  
  // Performance monitoring with threshold violation callbacks
  const { metrics, isMonitoring, startMonitoring, stopMonitoring } = usePerformanceMonitor({
    onPerformanceChange: useCallback((metrics: PerformanceMetrics) => {
      // Log performance metrics in development mode
      if (process.env.NODE_ENV === 'development') {
        logPerformanceMetrics(metrics);
      }
      
      // Check performance health and update alerts
      const health = checkPerformanceHealth(metrics);
      setPerformanceStatus(health.status);
      setPerformanceAlerts(health.issues);
    }, []),
    
    onThresholdViolation: useCallback((type: 'fps' | 'frameTime' | 'memory', current: number, threshold: number) => {
      console.warn(`Performance threshold violation: ${type} = ${current} (threshold: ${threshold})`);
      
      // Add specific alert for threshold violation
      const alertMessage = `${type.toUpperCase()} threshold exceeded: ${current} (limit: ${threshold})`;
      setPerformanceAlerts(prev => [...prev.slice(-4), alertMessage]); // Keep last 5 alerts
    }, []),
    
    thresholds: {
      minFps: 30,
      maxFrameTime: 33, // 33ms = ~30fps
      maxMemoryUsage: 100 // 100MB
    },
    
    updateInterval: 1000, // Update every second
    enabled: true
  });

  // Performance status icon component
  const PerformanceStatusIcon = () => {
    switch (performanceStatus) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  // Performance metrics display component
  const PerformanceOverlay = () => {
    if (!showPerformanceOverlay) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 right-4 z-50"
      >
        <Card className="p-4 bg-black/80 text-white backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <PerformanceStatusIcon />
            <span className="text-sm font-medium">Performance Monitor</span>
            <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-400' : 'bg-red-400'}`} />
          </div>
          
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>FPS:</span>
              <span className={metrics.fps < 30 ? 'text-red-400' : metrics.fps < 45 ? 'text-yellow-400' : 'text-green-400'}>
                {metrics.fps}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Frame Time:</span>
              <span className={metrics.frameTime > 33 ? 'text-red-400' : metrics.frameTime > 22 ? 'text-yellow-400' : 'text-green-400'}>
                {metrics.frameTime}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>Memory:</span>
              <span className={metrics.memoryUsage > 100 ? 'text-red-400' : metrics.memoryUsage > 80 ? 'text-yellow-400' : 'text-green-400'}>
                {metrics.memoryUsage}MB
              </span>
            </div>
            <div className="flex justify-between">
              <span>Canvas Ops:</span>
              <span>{metrics.canvasOperations}</span>
            </div>
          </div>
          
          {performanceAlerts.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <div className="text-xs text-red-400">
                {performanceAlerts.slice(-2).map((alert, index) => (
                  <div key={index} className="truncate">{alert}</div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              className="text-xs h-6"
            >
              {isMonitoring ? 'Stop' : 'Start'}
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="relative">
      <ImageReveal
        imageSrc={imageSrc}
        hiddenImageSrc={hiddenImageSrc}
        onRevealComplete={onRevealComplete}
      />
      <PerformanceOverlay />
    </div>
  );
};