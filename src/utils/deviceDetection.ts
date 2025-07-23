/**
 * Device Detection and Profiling System
 * 
 * This utility provides device capability detection using navigator and performance APIs
 * to automatically select appropriate performance profiles.
 */

export interface DeviceCapabilities {
  // Hardware characteristics
  hardwareConcurrency: number;
  deviceMemory?: number;
  maxTouchPoints: number;
  
  // Performance characteristics
  connectionType?: string;
  connectionEffectiveType?: string;
  
  // Display characteristics
  pixelRatio: number;
  screenWidth: number;
  screenHeight: number;
  
  // Browser/Platform info
  userAgent: string;
  platform: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // Performance API availability
  hasPerformanceAPI: boolean;
  hasMemoryAPI: boolean;
  hasConnectionAPI: boolean;
}

export interface QualitySettings {
  brushSmoothness: number; // 0.1 to 1.0
  interpolationSteps: number; // 1 to 10
  particleCount: number; // 0 to 50
  shadowEffects: boolean;
  gradientComplexity: number; // 1 to 5
}

export interface DeviceProfile {
  id: string;
  name: string;
  qualitySettings: QualitySettings;
  thresholds: {
    minFps: number;
    maxMemory: number;
    maxFrameTime: number;
  };
}

// Device profile configurations
export const DEVICE_PROFILES: DeviceProfile[] = [
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
];

/**
 * Detects device capabilities using available browser APIs
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  const nav = navigator as any;
  const screen = window.screen;
  
  // Detect device type based on user agent and touch capabilities
  const userAgent = nav.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || 
                   (nav.maxTouchPoints > 0 && screen.width < 768);
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent) || 
                   (nav.maxTouchPoints > 0 && screen.width >= 768 && screen.width < 1024);
  const isDesktop = !isMobile && !isTablet;
  
  // Get connection information if available
  const connection = (nav.connection || nav.mozConnection || nav.webkitConnection) as any;
  
  return {
    // Hardware characteristics
    hardwareConcurrency: nav.hardwareConcurrency || 4,
    deviceMemory: nav.deviceMemory,
    maxTouchPoints: nav.maxTouchPoints || 0,
    
    // Performance characteristics
    connectionType: connection?.type,
    connectionEffectiveType: connection?.effectiveType,
    
    // Display characteristics
    pixelRatio: window.devicePixelRatio || 1,
    screenWidth: screen.width,
    screenHeight: screen.height,
    
    // Browser/Platform info
    userAgent: nav.userAgent,
    platform: nav.platform,
    isMobile,
    isTablet,
    isDesktop,
    
    // API availability
    hasPerformanceAPI: 'performance' in window && 'now' in performance,
    hasMemoryAPI: 'deviceMemory' in nav,
    hasConnectionAPI: !!(connection)
  };
}

/**
 * Calculates a device performance score based on detected capabilities
 */
export function calculateDeviceScore(capabilities: DeviceCapabilities): number {
  let score = 0;
  
  // CPU score (0-30 points)
  const cpuCores = capabilities.hardwareConcurrency;
  score += Math.min(cpuCores * 5, 30);
  
  // Memory score (0-25 points)
  if (capabilities.deviceMemory) {
    score += Math.min(capabilities.deviceMemory * 3, 25);
  } else {
    // Estimate based on device type
    if (capabilities.isDesktop) score += 20;
    else if (capabilities.isTablet) score += 15;
    else score += 10;
  }
  
  // Display score (0-20 points)
  const pixelRatio = capabilities.pixelRatio;
  const screenArea = capabilities.screenWidth * capabilities.screenHeight;
  score += Math.min((screenArea / 100000) * 5, 15);
  score += Math.min(pixelRatio * 2.5, 5);
  
  // Connection score (0-15 points)
  if (capabilities.connectionEffectiveType) {
    switch (capabilities.connectionEffectiveType) {
      case '4g': score += 15; break;
      case '3g': score += 10; break;
      case '2g': score += 5; break;
      case 'slow-2g': score += 2; break;
      default: score += 8;
    }
  } else {
    score += 10; // Default assumption
  }
  
  // Device type modifier (0-10 points)
  if (capabilities.isDesktop) score += 10;
  else if (capabilities.isTablet) score += 6;
  else score += 3;
  
  return Math.min(score, 100);
}

/**
 * Selects appropriate device profile based on capabilities
 */
export function selectDeviceProfile(capabilities: DeviceCapabilities): DeviceProfile {
  const score = calculateDeviceScore(capabilities);
  
  // Profile selection based on score
  if (score >= 70) {
    return DEVICE_PROFILES[0]; // high-end
  } else if (score >= 40) {
    return DEVICE_PROFILES[1]; // mid-range
  } else {
    return DEVICE_PROFILES[2]; // low-end
  }
}

/**
 * Gets device profile by ID
 */
export function getDeviceProfileById(id: string): DeviceProfile | undefined {
  return DEVICE_PROFILES.find(profile => profile.id === id);
}

/**
 * Main function to detect device and return appropriate profile
 */
export function detectAndProfileDevice(): {
  capabilities: DeviceCapabilities;
  profile: DeviceProfile;
  score: number;
} {
  const capabilities = detectDeviceCapabilities();
  const profile = selectDeviceProfile(capabilities);
  const score = calculateDeviceScore(capabilities);
  
  return {
    capabilities,
    profile,
    score
  };
}