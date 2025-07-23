import { describe, it, expect, beforeEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useDeviceProfile } from '../useDeviceProfile';

// Mock the device detection utility
jest.mock('../../utils/deviceDetection', () => ({
  detectAndProfileDevice: jest.fn(() => ({
    capabilities: {
      hardwareConcurrency: 8,
      deviceMemory: 8,
      maxTouchPoints: 0,
      pixelRatio: 1,
      screenWidth: 1920,
      screenHeight: 1080,
      userAgent: 'test-agent',
      platform: 'Win32',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      hasPerformanceAPI: true,
      hasMemoryAPI: true,
      hasConnectionAPI: true,
      connectionEffectiveType: '4g',
      connectionType: 'wifi'
    },
    profile: {
      id: 'high-end',
      name: 'High Performance',
      qualitySettings: {
        brushSmoothness: 1.0,
        interpolationSteps: 10,
        particleCount: 50,
        shadowEffects: true,
        gradientComplexity: 5
      },
      thresholds: { minFps: 55, maxMemory: 100, maxFrameTime: 16 }
    },
    score: 85
  })),
  getDeviceProfileById: jest.fn((id: string) => {
    const profiles = {
      'high-end': {
        id: 'high-end',
        name: 'High Performance',
        qualitySettings: {
          brushSmoothness: 1.0,
          interpolationSteps: 10,
          particleCount: 50,
          shadowEffects: true,
          gradientComplexity: 5
        },
        thresholds: { minFps: 55, maxMemory: 100, maxFrameTime: 16 }
      },
      'mid-range': {
        id: 'mid-range',
        name: 'Balanced Performance',
        qualitySettings: {
          brushSmoothness: 0.7,
          interpolationSteps: 6,
          particleCount: 25,
          shadowEffects: true,
          gradientComplexity: 3
        },
        thresholds: { minFps: 45, maxMemory: 80, maxFrameTime: 20 }
      },
      'low-end': {
        id: 'low-end',
        name: 'Performance Optimized',
        qualitySettings: {
          brushSmoothness: 0.4,
          interpolationSteps: 3,
          particleCount: 10,
          shadowEffects: false,
          gradientComplexity: 2
        },
        thresholds: { minFps: 30, maxMemory: 60, maxFrameTime: 33 }
      }
    };
    return profiles[id as keyof typeof profiles];
  }),
  DEVICE_PROFILES: [
    {
      id: 'high-end',
      name: 'High Performance',
      qualitySettings: {
        brushSmoothness: 1.0,
        interpolationSteps: 10,
        particleCount: 50,
        shadowEffects: true,
        gradientComplexity: 5
      },
      thresholds: { minFps: 55, maxMemory: 100, maxFrameTime: 16 }
    },
    {
      id: 'mid-range',
      name: 'Balanced Performance',
      qualitySettings: {
        brushSmoothness: 0.7,
        interpolationSteps: 6,
        particleCount: 25,
        shadowEffects: true,
        gradientComplexity: 3
      },
      thresholds: { minFps: 45, maxMemory: 80, maxFrameTime: 20 }
    },
    {
      id: 'low-end',
      name: 'Performance Optimized',
      qualitySettings: {
        brushSmoothness: 0.4,
        interpolationSteps: 3,
        particleCount: 10,
        shadowEffects: false,
        gradientComplexity: 2
      },
      thresholds: { minFps: 30, maxMemory: 60, maxFrameTime: 33 }
    }
  ]
}));

describe('useDeviceProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should initialize with device detection', async () => {
    const { result } = renderHook(() => useDeviceProfile());

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.capabilities).toBe(null);
    expect(result.current.currentProfile).toBe(null);

    // Wait for detection to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.capabilities).toBeDefined();
    expect(result.current.currentProfile).toBeDefined();
    expect(result.current.currentProfile?.id).toBe('high-end');
    expect(result.current.deviceScore).toBe(85);
    expect(result.current.autoSelectedProfileId).toBe('high-end');
    expect(result.current.isManualOverride).toBe(false);
  });

  it('should provide quality settings from current profile', async () => {
    const { result } = renderHook(() => useDeviceProfile());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.qualitySettings).toEqual({
      brushSmoothness: 1.0,
      interpolationSteps: 10,
      particleCount: 50,
      shadowEffects: true,
      gradientComplexity: 5
    });
  });

  it('should provide available profiles', async () => {
    const { result } = renderHook(() => useDeviceProfile());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.availableProfiles).toHaveLength(3);
    expect(result.current.availableProfiles.map(p => p.id)).toEqual([
      'high-end', 'mid-range', 'low-end'
    ]);
  });

  it('should allow manual profile override', async () => {
    const { result } = renderHook(() => useDeviceProfile());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Initially auto-selected high-end
    expect(result.current.currentProfile?.id).toBe('high-end');
    expect(result.current.isManualOverride).toBe(false);

    // Set manual override to mid-range
    act(() => {
      result.current.setManualProfile('mid-range');
    });

    expect(result.current.currentProfile?.id).toBe('mid-range');
    expect(result.current.isManualOverride).toBe(true);
    expect(result.current.autoSelectedProfileId).toBe('high-end'); // Should remain unchanged
  });

  it('should reset to auto profile', async () => {
    const { result } = renderHook(() => useDeviceProfile());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Set manual override
    act(() => {
      result.current.setManualProfile('low-end');
    });

    expect(result.current.currentProfile?.id).toBe('low-end');
    expect(result.current.isManualOverride).toBe(true);

    // Reset to auto
    act(() => {
      result.current.resetToAutoProfile();
    });

    expect(result.current.currentProfile?.id).toBe('high-end');
    expect(result.current.isManualOverride).toBe(false);
  });

  it('should refresh profile and re-run detection', async () => {
    const { result } = renderHook(() => useDeviceProfile());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Set manual override
    act(() => {
      result.current.setManualProfile('mid-range');
    });

    expect(result.current.isManualOverride).toBe(true);

    // Refresh should reset manual override and re-run detection
    act(() => {
      result.current.refreshProfile();
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isManualOverride).toBe(false);
    expect(result.current.currentProfile?.id).toBe('high-end');
  });

  it('should handle invalid manual profile ID', async () => {
    const { result } = renderHook(() => useDeviceProfile());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const originalProfile = result.current.currentProfile;

    // Try to set invalid profile
    act(() => {
      result.current.setManualProfile('invalid-profile');
    });

    // Should remain unchanged
    expect(result.current.currentProfile).toBe(originalProfile);
    expect(result.current.isManualOverride).toBe(false);
  });

  it('should handle detection errors gracefully', async () => {
    // Mock detection to throw error
    const { detectAndProfileDevice } = require('../../utils/deviceDetection');
    (detectAndProfileDevice as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Detection failed');
    });

    const { result } = renderHook(() => useDeviceProfile());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should fallback to mid-range profile
    expect(result.current.isLoading).toBe(false);
    expect(result.current.currentProfile?.id).toBe('mid-range');
    expect(result.current.autoSelectedProfileId).toBe('mid-range');
  });
});