import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  detectDeviceCapabilities,
  calculateDeviceScore,
  selectDeviceProfile,
  getDeviceProfileById,
  detectAndProfileDevice,
  DEVICE_PROFILES
} from '../deviceDetection';

// Mock navigator and window objects
const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  platform: 'Win32',
  hardwareConcurrency: 8,
  deviceMemory: 8,
  maxTouchPoints: 0,
  connection: {
    effectiveType: '4g',
    type: 'wifi'
  }
};

const mockScreen = {
  width: 1920,
  height: 1080
};

const mockWindow = {
  devicePixelRatio: 1,
  screen: mockScreen,
  performance: {
    now: jest.fn()
  }
};

describe('deviceDetection', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock global objects
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true
    });
    
    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true
    });
  });

  describe('detectDeviceCapabilities', () => {
    it('should detect desktop device capabilities correctly', () => {
      const capabilities = detectDeviceCapabilities();
      
      expect(capabilities).toMatchObject({
        hardwareConcurrency: 8,
        deviceMemory: 8,
        maxTouchPoints: 0,
        pixelRatio: 1,
        screenWidth: 1920,
        screenHeight: 1080,
        platform: 'Win32',
        isDesktop: true,
        isMobile: false,
        isTablet: false,
        hasPerformanceAPI: true,
        hasMemoryAPI: true,
        hasConnectionAPI: true,
        connectionEffectiveType: '4g',
        connectionType: 'wifi'
      });
    });

    it('should detect mobile device correctly', () => {
      // Mock mobile user agent
      const mobileNavigator = {
        ...mockNavigator,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        maxTouchPoints: 5
      };
      
      const mobileScreen = {
        width: 375,
        height: 812
      };
      
      Object.defineProperty(global, 'navigator', {
        value: mobileNavigator,
        writable: true
      });
      
      Object.defineProperty(global, 'window', {
        value: { ...mockWindow, screen: mobileScreen },
        writable: true
      });
      
      const capabilities = detectDeviceCapabilities();
      
      expect(capabilities.isMobile).toBe(true);
      expect(capabilities.isDesktop).toBe(false);
      expect(capabilities.maxTouchPoints).toBe(5);
      expect(capabilities.screenWidth).toBe(375);
    });

    it('should handle missing APIs gracefully', () => {
      // Mock navigator without optional APIs
      const limitedNavigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        platform: 'Win32',
        hardwareConcurrency: 4,
        maxTouchPoints: 0
        // Missing deviceMemory and connection
      };
      
      Object.defineProperty(global, 'navigator', {
        value: limitedNavigator,
        writable: true
      });
      
      const capabilities = detectDeviceCapabilities();
      
      expect(capabilities.hardwareConcurrency).toBe(4);
      expect(capabilities.deviceMemory).toBeUndefined();
      expect(capabilities.connectionType).toBeUndefined();
      expect(capabilities.hasMemoryAPI).toBe(false);
      expect(capabilities.hasConnectionAPI).toBe(false);
    });
  });

  describe('calculateDeviceScore', () => {
    it('should calculate high score for high-end desktop', () => {
      const capabilities = detectDeviceCapabilities();
      const score = calculateDeviceScore(capabilities);
      
      // High-end desktop should score well
      expect(score).toBeGreaterThan(70);
    });

    it('should calculate lower score for mobile device', () => {
      const mobileCapabilities = {
        ...detectDeviceCapabilities(),
        hardwareConcurrency: 4,
        deviceMemory: 4,
        screenWidth: 375,
        screenHeight: 812,
        isMobile: true,
        isDesktop: false,
        isTablet: false,
        connectionEffectiveType: '3g'
      };
      
      const score = calculateDeviceScore(mobileCapabilities);
      
      // Mobile should score lower than desktop
      expect(score).toBeLessThan(70);
    });

    it('should handle missing deviceMemory', () => {
      const capabilities = {
        ...detectDeviceCapabilities(),
        deviceMemory: undefined
      };
      
      const score = calculateDeviceScore(capabilities);
      
      // Should still calculate a reasonable score
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(100);
    });
  });

  describe('selectDeviceProfile', () => {
    it('should select high-end profile for high-performance device', () => {
      const capabilities = detectDeviceCapabilities();
      const profile = selectDeviceProfile(capabilities);
      
      expect(profile.id).toBe('high-end');
      expect(profile.qualitySettings.brushSmoothness).toBe(1.0);
      expect(profile.qualitySettings.shadowEffects).toBe(true);
    });

    it('should select low-end profile for low-performance device', () => {
      const lowEndCapabilities = {
        ...detectDeviceCapabilities(),
        hardwareConcurrency: 2,
        deviceMemory: 2,
        screenWidth: 320,
        screenHeight: 568,
        isMobile: true,
        isDesktop: false,
        isTablet: false,
        connectionEffectiveType: '2g'
      };
      
      const profile = selectDeviceProfile(lowEndCapabilities);
      
      expect(profile.id).toBe('low-end');
      expect(profile.qualitySettings.brushSmoothness).toBe(0.4);
      expect(profile.qualitySettings.shadowEffects).toBe(false);
    });
  });

  describe('getDeviceProfileById', () => {
    it('should return correct profile by ID', () => {
      const profile = getDeviceProfileById('mid-range');
      
      expect(profile).toBeDefined();
      expect(profile?.id).toBe('mid-range');
      expect(profile?.name).toBe('Balanced Performance');
    });

    it('should return undefined for invalid ID', () => {
      const profile = getDeviceProfileById('invalid-id');
      
      expect(profile).toBeUndefined();
    });
  });

  describe('detectAndProfileDevice', () => {
    it('should return complete device detection result', () => {
      const result = detectAndProfileDevice();
      
      expect(result).toHaveProperty('capabilities');
      expect(result).toHaveProperty('profile');
      expect(result).toHaveProperty('score');
      
      expect(result.capabilities).toBeDefined();
      expect(result.profile).toBeDefined();
      expect(typeof result.score).toBe('number');
      expect(result.score).toBeGreaterThan(0);
    });
  });

  describe('DEVICE_PROFILES', () => {
    it('should have all required profiles', () => {
      expect(DEVICE_PROFILES).toHaveLength(3);
      
      const profileIds = DEVICE_PROFILES.map(p => p.id);
      expect(profileIds).toContain('high-end');
      expect(profileIds).toContain('mid-range');
      expect(profileIds).toContain('low-end');
    });

    it('should have valid quality settings for all profiles', () => {
      DEVICE_PROFILES.forEach(profile => {
        expect(profile.qualitySettings.brushSmoothness).toBeGreaterThan(0);
        expect(profile.qualitySettings.brushSmoothness).toBeLessThanOrEqual(1);
        expect(profile.qualitySettings.interpolationSteps).toBeGreaterThan(0);
        expect(profile.qualitySettings.interpolationSteps).toBeLessThanOrEqual(10);
        expect(profile.qualitySettings.particleCount).toBeGreaterThanOrEqual(0);
        expect(profile.qualitySettings.particleCount).toBeLessThanOrEqual(50);
        expect(profile.qualitySettings.gradientComplexity).toBeGreaterThan(0);
        expect(profile.qualitySettings.gradientComplexity).toBeLessThanOrEqual(5);
      });
    });

    it('should have valid thresholds for all profiles', () => {
      DEVICE_PROFILES.forEach(profile => {
        expect(profile.thresholds.minFps).toBeGreaterThan(0);
        expect(profile.thresholds.maxMemory).toBeGreaterThan(0);
        expect(profile.thresholds.maxFrameTime).toBeGreaterThan(0);
      });
    });
  });
});