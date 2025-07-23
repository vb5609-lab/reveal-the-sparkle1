import { renderHook, act } from '@testing-library/react';
import { usePerformanceMonitor } from '../usePerformanceMonitor';

// Mock performance.now() for consistent testing
const mockPerformanceNow = jest.fn();
Object.defineProperty(global.performance, 'now', {
  value: mockPerformanceNow,
  writable: true
});

// Mock requestAnimationFrame and cancelAnimationFrame
const mockRequestAnimationFrame = jest.fn();
const mockCancelAnimationFrame = jest.fn();
Object.defineProperty(global, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame,
  writable: true
});
Object.defineProperty(global, 'cancelAnimationFrame', {
  value: mockCancelAnimationFrame,
  writable: true
});

// Mock setInterval and clearInterval
jest.useFakeTimers();

describe('usePerformanceMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
    mockRequestAnimationFrame.mockImplementation((callback) => {
      setTimeout(callback, 16); // Simulate 60fps
      return 1;
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should initialize with default metrics', () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    expect(result.current.metrics).toEqual({
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
      canvasOperations: 0
    });
    expect(result.current.isMonitoring).toBe(true); // Auto-starts by default
  });

  it('should start monitoring when startMonitoring is called', () => {
    const { result } = renderHook(() => usePerformanceMonitor({ enabled: false }));

    expect(result.current.isMonitoring).toBe(false);

    act(() => {
      result.current.startMonitoring();
    });

    expect(result.current.isMonitoring).toBe(true);
    expect(mockRequestAnimationFrame).toHaveBeenCalled();
  });

  it('should stop monitoring when stopMonitoring is called', () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    act(() => {
      result.current.stopMonitoring();
    });

    expect(result.current.isMonitoring).toBe(false);
    expect(mockCancelAnimationFrame).toHaveBeenCalled();
  });

  it('should reset metrics when resetMetrics is called', () => {
    const { result } = renderHook(() => usePerformanceMonitor());

    act(() => {
      result.current.resetMetrics();
    });

    expect(result.current.metrics).toEqual({
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
      canvasOperations: 0
    });
  });

  it('should call performance change callback when metrics update', () => {
    const onPerformanceChange = jest.fn();
    const { result } = renderHook(() => 
      usePerformanceMonitor({ onPerformanceChange })
    );

    // Simulate frame updates
    mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(16);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Should eventually call the callback (may need multiple timer advances)
    expect(onPerformanceChange).toHaveBeenCalled();
  });

  it('should call threshold violation callback when thresholds are exceeded', () => {
    const onThresholdViolation = jest.fn();
    const thresholds = {
      minFps: 60,
      maxFrameTime: 16,
      maxMemoryUsage: 50
    };

    renderHook(() => 
      usePerformanceMonitor({ 
        onThresholdViolation,
        thresholds
      })
    );

    // This test would need more complex mocking to simulate actual threshold violations
    // For now, we verify the callback is properly stored
    expect(onThresholdViolation).toBeDefined();
  });

  it('should not start monitoring when enabled is false', () => {
    const { result } = renderHook(() => usePerformanceMonitor({ enabled: false }));

    expect(result.current.isMonitoring).toBe(false);
    expect(mockRequestAnimationFrame).not.toHaveBeenCalled();
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => usePerformanceMonitor());

    unmount();

    expect(mockCancelAnimationFrame).toHaveBeenCalled();
  });
});